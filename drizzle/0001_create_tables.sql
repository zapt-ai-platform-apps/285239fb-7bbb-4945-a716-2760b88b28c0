CREATE TABLE IF NOT EXISTS "communities" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "created_by" UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS "posts" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "content" TEXT,
  "community_id" INTEGER NOT NULL REFERENCES communities(id),
  "user_id" UUID NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "comments" (
  "id" SERIAL PRIMARY KEY,
  "content" TEXT NOT NULL,
  "post_id" INTEGER NOT NULL REFERENCES posts(id),
  "user_id" UUID NOT NULL,
  "parent_id" INTEGER REFERENCES comments(id),
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "votes" (
  "id" SERIAL PRIMARY KEY,
  "user_id" UUID NOT NULL,
  "post_id" INTEGER REFERENCES posts(id),
  "comment_id" INTEGER REFERENCES comments(id),
  "value" INTEGER NOT NULL CHECK (value IN (-1, 1)),
  "created_at" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "one_vote_per_user_post" UNIQUE ("user_id", "post_id"),
  CONSTRAINT "one_vote_per_user_comment" UNIQUE ("user_id", "comment_id"),
  CONSTRAINT "post_or_comment_required" CHECK (
    (post_id IS NULL AND comment_id IS NOT NULL) OR
    (post_id IS NOT NULL AND comment_id IS NULL)
  )
);