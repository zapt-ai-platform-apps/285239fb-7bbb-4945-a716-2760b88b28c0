import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { posts, subreddits } from '../../drizzle/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { authenticateUser, Sentry } from './_apiUtils';
import type { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  try {
    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return handleGetPosts(req, res);
      case 'POST':
        return handleCreatePost(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in posts endpoint:', error);
    Sentry.captureException(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetPosts(req: Request, res: Response) {
  const sort = req.query.sort as string || 'hot';
  
  const client = postgres(process.env.COCKROACH_DB_URL || '');
  const db = drizzle(client);
  
  try {
    let result;
    
    // Apply sorting
    if (sort === 'new') {
      result = await db.select().from(posts).orderBy(desc(posts.createdAt)).limit(50);
    } else if (sort === 'top') {
      // Use SQL expression for columns that might not be in the schema definition
      result = await db.select().from(posts).orderBy(desc(sql`upvotes`)).limit(50);
    } else {
      // Default 'hot' sorting - a simplified algorithm based on votes and recency
      result = await db.select().from(posts)
        .orderBy(desc(sql`upvotes`), desc(posts.createdAt))
        .limit(50);
    }
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error getting posts:', error);
    Sentry.captureException(error);
    return res.status(500).json({ error: 'Failed to fetch posts' });
  }
}

async function handleCreatePost(req: Request, res: Response) {
  try {
    const user = await authenticateUser(req);
    const { title, content, subredditName } = req.body;
    
    if (!title || !subredditName) {
      return res.status(400).json({ error: 'Title and subreddit are required' });
    }
    
    const client = postgres(process.env.COCKROACH_DB_URL || '');
    const db = drizzle(client);
    
    // Find or create the subreddit
    let subredditId: number;
    const existingSubreddit = await db.select().from(subreddits).where(eq(subreddits.name, subredditName)).limit(1);
    
    if (existingSubreddit.length > 0) {
      subredditId = existingSubreddit[0].id;
    } else {
      // Create new subreddit
      const newSubreddit = await db.insert(subreddits).values({
        name: subredditName,
        createdBy: user.id,
      }).returning({ id: subreddits.id });
      
      subredditId = newSubreddit[0].id;
    }
    
    // Create the post
    const newPost = await db.insert(posts).values({
      title,
      content: content || null,
      communityId: subredditId, // Use communityId to match schema definition
      userId: user.id,
    }).returning();
    
    return res.status(201).json(newPost[0]);
  } catch (error) {
    console.error('Error creating post:', error);
    Sentry.captureException(error);
    
    if (error instanceof Error && 
       (error.message === 'Missing Authorization header' || error.message === 'Invalid token')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    return res.status(500).json({ error: 'Failed to create post' });
  }
}