import { pgTable, serial, text, timestamp, uuid, integer, unique, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import type { PgTableWithColumns } from 'drizzle-orm/pg-core';

export const communities = pgTable('communities', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: uuid('created_by').notNull(),
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content'),
  communityId: integer('community_id').notNull().references(() => communities.id),
  userId: uuid('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  upvotes: integer('upvotes').default(0),
  downvotes: integer('downvotes').default(0),
});

// Fix for TS7022: Add type annotation for the comments variable
export const comments: PgTableWithColumns<any> = pgTable('comments', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  postId: integer('post_id').notNull().references(() => posts.id),
  userId: uuid('user_id').notNull(),
  parentId: integer('parent_id').references(() => comments.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const votes = pgTable('votes', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  postId: integer('post_id').references(() => posts.id),
  commentId: integer('comment_id').references(() => comments.id),
  value: integer('value').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  // Fix for TS7024: Add return type annotation for this function
  return {
    postVoteUnique: unique('post_vote_unique').on(table.userId, table.postId),
    commentVoteUnique: unique('comment_vote_unique').on(table.userId, table.commentId),
    postOrComment: check(
      'post_or_comment', 
      sql`(post_id IS NULL AND comment_id IS NOT NULL) OR (post_id IS NOT NULL AND comment_id IS NULL)`
    )
  } as const;
});

export const subreddits = pgTable('subreddits', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: uuid('created_by').notNull(),
});
