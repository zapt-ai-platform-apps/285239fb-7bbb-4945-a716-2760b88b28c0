import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { subreddits } from '../drizzle/schema.ts';
import { authenticateUser, Sentry } from './_apiUtils.ts';
import type { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const client = postgres(process.env.COCKROACH_DB_URL || '');
    const db = drizzle(client);

    // Get all subreddits
    const results = await db.select().from(subreddits).limit(20);

    return res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching subreddits:', error);
    Sentry.captureException(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}