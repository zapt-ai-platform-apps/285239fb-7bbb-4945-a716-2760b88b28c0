import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { comments, posts } from '../drizzle/schema.js';
import { authenticateUser } from './_apiUtils.js';
import Sentry from './_sentry.js';
import { eq } from 'drizzle-orm';

export default async function handler(req, res) {
  try {
    const user = await authenticateUser(req);
    const client = postgres(process.env.COCKROACH_DB_URL);
    const db = drizzle(client);

    // POST request - create comment
    if (req.method === 'POST') {
      const { content, postId, parentId } = req.body;
      
      if (!content) {
        return res.status(400).json({ error: 'Comment content is required' });
      }
      
      if (!postId) {
        return res.status(400).json({ error: 'Post ID is required' });
      }
      
      // Check if post exists
      const postExists = await db.select().from(posts).where(eq(posts.id, postId));
      if (postExists.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      // If parentId exists, check if the parent comment exists
      if (parentId) {
        const parentExists = await db.select().from(comments).where(eq(comments.id, parentId));
        if (parentExists.length === 0) {
          return res.status(404).json({ error: 'Parent comment not found' });
        }
      }
      
      const newComment = await db.insert(comments)
        .values({
          content,
          postId,
          userId: user.id,
          parentId: parentId || null
        })
        .returning();
        
      return res.status(201).json(newComment[0]);
    }
    
    // GET request - fetch comments for a post
    if (req.method === 'GET') {
      const { postId } = req.query;
      
      if (!postId) {
        return res.status(400).json({ error: 'Post ID is required' });
      }
      
      const result = await db.select().from(comments)
        .where(eq(comments.postId, parseInt(postId)));
      
      return res.status(200).json(result);
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