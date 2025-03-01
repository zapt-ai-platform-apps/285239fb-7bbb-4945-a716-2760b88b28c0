import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { posts, communities, votes } from '../drizzle/schema.js';
import { authenticateUser } from './_apiUtils.js';
import Sentry from './_sentry.js';
import { eq, and, desc, sql } from 'drizzle-orm';

export default async function handler(req, res) {
  try {
    const user = await authenticateUser(req);
    const client = postgres(process.env.COCKROACH_DB_URL);
    const db = drizzle(client);

    // GET request - fetch posts
    if (req.method === 'GET') {
      const { communityId } = req.query;
      
      let query = db.select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        communityId: posts.communityId,
        userId: posts.userId,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        communityName: communities.name
      })
      .from(posts)
      .leftJoin(communities, eq(posts.communityId, communities.id));
      
      if (communityId) {
        query = query.where(eq(posts.communityId, parseInt(communityId)));
      }
      
      const result = await query.orderBy(desc(posts.createdAt));
      
      // Get votes for all posts
      const postIds = result.map(post => post.id);
      const postVotes = postIds.length > 0 
        ? await db.select().from(votes).where(sql`${votes.postId} IN (${postIds})`)
        : [];
      
      // Calculate vote counts and check user votes
      const postsWithVotes = result.map(post => {
        const postVotesList = postVotes.filter(vote => vote.postId === post.id);
        const voteScore = postVotesList.reduce((total, vote) => total + vote.value, 0);
        const userVote = postVotesList.find(vote => vote.userId === user.id)?.value || null;
        
        return {
          ...post,
          voteScore,
          userVote
        };
      });
      
      return res.status(200).json(postsWithVotes);
    }
    
    // POST request - create post
    if (req.method === 'POST') {
      const { title, content, communityId } = req.body;
      
      if (!title) {
        return res.status(400).json({ error: 'Post title is required' });
      }
      
      if (!communityId) {
        return res.status(400).json({ error: 'Community ID is required' });
      }
      
      // Check if community exists
      const community = await db.select().from(communities).where(eq(communities.id, communityId));
      if (community.length === 0) {
        return res.status(404).json({ error: 'Community not found' });
      }
      
      const newPost = await db.insert(posts)
        .values({
          title,
          content,
          communityId,
          userId: user.id
        })
        .returning();
        
      return res.status(201).json(newPost[0]);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in posts API:', error);
    Sentry.captureException(error);
    
    if (error.message === 'Missing Authorization header' || error.message === 'Invalid token') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}