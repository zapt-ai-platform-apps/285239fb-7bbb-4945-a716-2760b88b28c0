-- Create subreddits table
CREATE TABLE IF NOT EXISTS "subreddits" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "created_by" UUID NOT NULL
);

-- Create posts table
CREATE TABLE IF NOT EXISTS "posts" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "content" TEXT,
  "subreddit_id" INTEGER REFERENCES "subreddits"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "user_id" UUID NOT NULL,
  "upvotes" INTEGER DEFAULT 0,
  "downvotes" INTEGER DEFAULT 0
);

-- Create comments table
CREATE TABLE IF NOT EXISTS "comments" (
  "id" SERIAL PRIMARY KEY,
  "content" TEXT NOT NULL,
  "post_id" INTEGER REFERENCES "posts"("id") ON DELETE CASCADE,
  "parent_id" INTEGER REFERENCES "comments"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "user_id" UUID NOT NULL,
  "upvotes" INTEGER DEFAULT 0,
  "downvotes" INTEGER DEFAULT 0
);

-- Create votes table
CREATE TABLE IF NOT EXISTS "votes" (
  "id" SERIAL PRIMARY KEY,
  "user_id" UUID NOT NULL,
  "post_id" INTEGER REFERENCES "posts"("id") ON DELETE CASCADE,
  "comment_id" INTEGER REFERENCES "comments"("id") ON DELETE CASCADE,
  "value" INTEGER NOT NULL, -- 1 for upvote, -1 for downvote
  "created_at" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "one_vote_per_post" UNIQUE ("user_id", "post_id"),
  CONSTRAINT "one_vote_per_comment" UNIQUE ("user_id", "comment_id"),
  CONSTRAINT "post_or_comment" CHECK (
    (post_id IS NULL AND comment_id IS NOT NULL) OR
    (post_id IS NOT NULL AND comment_id IS NULL)
  )
);