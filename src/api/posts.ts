import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { posts, subreddits } from '../drizzle/schema.js';
import { desc, eq } from 'drizzle-orm';
import { authenticateUser, Sentry } from './_apiUtils.js';

export default async function handler(req, res) {
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

async function handleGetPosts(req, res) {
  const sort = req.query.sort || 'hot';
  
  const client = postgres(process.env.COCKROACH_DB_URL);
  const db = drizzle(client);
  
  let query = db.select().from(posts);
  
  // Apply sorting
  if (sort === 'new') {
    query = query.orderBy(desc(posts.createdAt));
  } else if (sort === 'top') {
    query = query.orderBy(desc(posts.upvotes));
  } else {
    // Default 'hot' sorting - a simplified algorithm based on votes and recency
    // In a real app, you'd implement a more sophisticated algorithm
    query = query.orderBy(desc(posts.upvotes), desc(posts.createdAt));
  }
  
  const results = await query.limit(50);
  
  return res.status(200).json(results);
}

async function handleCreatePost(req, res) {
  try {
    const user = await authenticateUser(req);
    const { title, content, subredditName } = req.body;
    
    if (!title || !subredditName) {
      return res.status(400).json({ error: 'Title and subreddit are required' });
    }
    
    const client = postgres(process.env.COCKROACH_DB_URL);
    const db = drizzle(client);
    
    // Find or create the subreddit
    let subredditId;
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
      content,
      subredditId,
      userId: user.id,
    }).returning();
    
    return res.status(201).json(newPost[0]);
  } catch (error) {
    console.error('Error creating post:', error);
    Sentry.captureException(error);
    
    if (error.message === 'Missing Authorization header' || error.message === 'Invalid token') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    return res.status(500).json({ error: 'Failed to create post' });
  }
}