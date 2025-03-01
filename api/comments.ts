import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { comments, votes } from '../drizzle/schema.js';
import { authenticateUser } from './_apiUtils.js';
import Sentry from './_sentry.js';
import { eq, and, desc } from 'drizzle-orm';

export default async function handler(req, res) {
  try {
    const user = await authenticateUser(req);
    const client = postgres(process.env.COCKROACH_DB_URL);
    const db = drizzle(client);

    // GET request - fetch comments for a post
    if (req.method === 'GET') {
      const { postId } = req.query;
      
      if (!postId) {
        return res.status(400).json({ error: 'Post ID is required' });
      }
      
      const result = await db.select()
        .from(comments)
        .where(eq(comments.postId, parseInt(postId)))
        .orderBy(desc(comments.createdAt));
      
      // Get votes for all comments
      const commentIds = result.map(comment => comment.id);
      const commentVotes = commentIds.length > 0 
        ? await db.select().from(votes).where(eq(votes.commentId, commentIds[0]))
        : [];
      
      // Calculate vote counts and check user votes
      const commentsWithVotes = result.map(comment => {
        const commentVotesList = commentVotes.filter(vote => vote.commentId === comment.id);
        const voteScore = commentVotesList.reduce((total, vote) => total + vote.value, 0);
        const userVote = commentVotesList.find(vote => vote.userId === user.id)?.value || null;
        
        return {
          ...comment,
          voteScore,
          userVote
        };
      });
      
      return res.status(200).json(commentsWithVotes);
    }
    
    // POST request - create comment
    if (req.method === 'POST') {
      const { content, postId, parentId } = req.body;
      
      if (!content) {
        return res.status(400).json({ error: 'Comment content is required' });
      }
      
      if (!postId) {
        return res.status(400).json({ error: 'Post ID is required' });
      }
      
      const newComment = await db.insert(comments)
        .values({
          content,
          postId,
          parentId: parentId || null,
          userId: user.id
        })
        .returning();
        
      return res.status(201).json(newComment[0]);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in comments API:', error);
    Sentry.captureException(error);
    
    if (error.message === 'Missing Authorization header' || error.message === 'Invalid token') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}