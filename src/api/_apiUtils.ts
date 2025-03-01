import { initializeZapt } from '@zapt/zapt-js';
import * as Sentry from "@sentry/node";
import type { Request } from 'express';

// Initialize Sentry
Sentry.init({
  dsn: process.env.VITE_PUBLIC_SENTRY_DSN,
  environment: process.env.VITE_PUBLIC_APP_ENV,
  initialScope: {
    tags: {
      type: 'backend',
      projectId: process.env.VITE_PUBLIC_APP_ID
    }
  }
});

const appId = process.env.VITE_PUBLIC_APP_ID;
if (!appId) {
  throw new Error('VITE_PUBLIC_APP_ID environment variable is not defined');
}

const { supabase } = initializeZapt(appId); 

export async function authenticateUser(req: Request): Promise<any> {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new Error('Missing Authorization header');
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error) {
    throw new Error('Invalid token');
  }

  return user;
}

export { Sentry };