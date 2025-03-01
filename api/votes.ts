import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { votes } from '../drizzle/schema.js';
import { authenticateUser } from './_apiUtils.js';
import Sentry from './_sentry.js';
import { eq, and } from 'drizzle-orm';

export default async function handler(req, res) {
  try {
    const user = await authenticateUser(req);
    const client = postgres(process.env.COCKROACH_DB_URL);
    const db = drizzle(client);

    // POST request - create or update vote
    if (req.method === 'POST') {
      const { postId, commentId, value } = req.body;
      
      if (value !== 1 && value !== -1) {
        return res.status(400).json({ error: 'Vote value must be either 1 or -1' });
      }
      
      if (!postId && !commentId) {
        return res.status(400).json({ error: 'Either postId or commentId is required' });
      }
      
      if (postId && commentId) {
        return res.status(400).json({ error: 'Cannot vote on both post and comment' });
      }
      
      // Check if user already voted on this post/comment
      let existingVote;
      if (postId) {
        existingVote = await db.select()
          .from(votes)
          .where(and(
            eq(votes.userId, user.id),
            eq(votes.postId, postId)
          ));
      } else {
        existingVote = await db.select()
          .from(votes)
          .where(and(
            eq(votes.userId, user.id),
            eq(votes.commentId, commentId)
          ));
      }
      
      // If voting the same way, remove the vote
      if (existingVote.length > 0 && existingVote[0].value === value) {
        await db.delete(votes).where(eq(votes.id, existingVote[0].id));
        return res.status(200).json({ message: 'Vote removed' });
      }
      
      // If changing vote, update it
      if (existingVote.length > 0) {
        const updatedVote = await db.update(votes)
          .set({ value })
          .where(eq(votes.id, existingVote[0].id))
          .returning();
          
        return res.status(200).json(updatedVote[0]);
      }
      
      // Otherwise, create new vote
      const newVote = await db.insert(votes)
        .values({
          userId: user.id,
          postId: postId || null,
          commentId: commentId || null,
          value
        })
        .returning();
        
      return res.status(201).json(newVote[0]);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in votes API:', error);
    Sentry.captureException(error);
    
    if (error.message === 'Missing Authorization header' || error.message === 'Invalid token') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}