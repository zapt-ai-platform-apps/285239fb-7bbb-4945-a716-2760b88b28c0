import { pgTable, serial, text, timestamp, uuid, integer, unique, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

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

// Forward declare the comments type to avoid circular reference error
type CommentsTable = ReturnType<typeof pgTable<"comments", {
  id: ReturnType<typeof serial>;
  content: ReturnType<typeof text>;
  postId: ReturnType<typeof integer>;
  userId: ReturnType<typeof uuid>;
  parentId: ReturnType<typeof integer>;
  createdAt: ReturnType<typeof timestamp>;
  updatedAt: ReturnType<typeof timestamp>;
}>>;

export const comments: CommentsTable = pgTable('comments', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  postId: integer('post_id').notNull().references(() => posts.id),
  userId: uuid('user_id').notNull(),
  parentId: integer('parent_id').references((): ReturnType<typeof serial> => comments.id),
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
  return {
    postVoteUnique: unique().on(table.userId, table.postId),
    commentVoteUnique: unique().on(table.userId, table.commentId),
    postOrComment: check(
      'post_or_comment', 
      sql`(post_id IS NULL AND comment_id IS NOT NULL) OR (post_id IS NOT NULL AND comment_id IS NULL)`
    )
  };
});

export const subreddits = pgTable('subreddits', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: uuid('created_by').notNull(),
});