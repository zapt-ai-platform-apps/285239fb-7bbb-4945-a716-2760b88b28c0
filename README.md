# Reddit Clone

A simplified Reddit clone built with React, TypeScript, and Tailwind CSS.

## Features

- View, create, and vote on posts
- Comment on posts and reply to comments
- Create and browse subreddits
- User authentication
- User profiles
- Responsive design

## Tech Stack

- React
- TypeScript
- Tailwind CSS
- CockroachDB with Drizzle ORM
- Supabase Authentication

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

The application requires several environment variables to be set. Create a `.env` file in the root directory with the following variables:

```
VITE_PUBLIC_APP_ID=
VITE_PUBLIC_APP_ENV=
VITE_PUBLIC_SENTRY_DSN=
VITE_PUBLIC_UMAMI_WEBSITE_ID=
COCKROACH_DB_URL=
```

## Deployment

This project is set up to be deployed on Vercel.