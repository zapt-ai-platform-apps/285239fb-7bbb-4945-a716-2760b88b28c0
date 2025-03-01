import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { communities } from '../drizzle/schema.js';
import { authenticateUser } from './_apiUtils.js';
import Sentry from './_sentry.js';
import { eq } from 'drizzle-orm';

export default async function handler(req, res) {
  try {
    const user = await authenticateUser(req);
    const client = postgres(process.env.COCKROACH_DB_URL);
    const db = drizzle(client);

    // GET request - fetch communities
    if (req.method === 'GET') {
      const result = await db.select().from(communities);
      return res.status(200).json(result);
    }
    
    // POST request - create community
    if (req.method === 'POST') {
      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Community name is required' });
      }
      
      try {
        const newCommunity = await db.insert(communities)
          .values({
            name,
            description,
            createdBy: user.id
          })
          .returning();
          
        return res.status(201).json(newCommunity[0]);
      } catch (error) {
        // Check if error is due to unique constraint violation
        if (error.message.includes('unique constraint')) {
          return res.status(409).json({ error: 'A community with this name already exists' });
        }
        throw error;
      }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in communities API:', error);
    Sentry.captureException(error);
    
    if (error.message === 'Missing Authorization header' || error.message === 'Invalid token') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}