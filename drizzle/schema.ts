import { pgTable, serial, text, timestamp, uuid, integer, unique, foreignKey, check } from 'drizzle-orm/pg-core';

export const subreddits = pgTable('subreddits', {
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
  subredditId: integer('subreddit_id').references(() => subreddits.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  userId: uuid('user_id').notNull(),
  upvotes: integer('upvotes').default(0),
  downvotes: integer('downvotes').default(0),
});

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  parentId: integer('parent_id').references(() => comments.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  userId: uuid('user_id').notNull(),
  upvotes: integer('upvotes').default(0),
  downvotes: integer('downvotes').default(0),
});

export const votes = pgTable('votes', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  commentId: integer('comment_id').references(() => comments.id, { onDelete: 'cascade' }),
  value: integer('value').notNull(), // 1 for upvote, -1 for downvote
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    postVoteUnique: unique().on(table.userId, table.postId),
    commentVoteUnique: unique().on(table.userId, table.commentId),
    postOrComment: check('post_or_comment', 
      `(post_id IS NULL AND comment_id IS NOT NULL) OR 
       (post_id IS NOT NULL AND comment_id IS NULL)`)
  };
});