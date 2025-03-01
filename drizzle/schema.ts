import { pgTable, serial, text, timestamp, uuid, integer, uniqueIndex, foreignKey, unique, check } from 'drizzle-orm/pg-core';

export const communities = pgTable('communities', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: uuid('created_by').notNull()
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content'),
  communityId: integer('community_id').notNull().references(() => communities.id),
  userId: uuid('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  postId: integer('post_id').notNull().references(() => posts.id),
  userId: uuid('user_id').notNull(),
  parentId: integer('parent_id').references(() => comments.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const votes = pgTable('votes', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  postId: integer('post_id').references(() => posts.id),
  commentId: integer('comment_id').references(() => comments.id),
  value: integer('value').notNull(),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => {
  return {
    userPostUnique: unique().on(table.userId, table.postId),
    userCommentUnique: unique().on(table.userId, table.commentId),
    valueCheck: check('value_check', `value IN (-1, 1)`),
    targetCheck: check('target_check', `
      (post_id IS NULL AND comment_id IS NOT NULL) OR
      (post_id IS NOT NULL AND comment_id IS NULL)
    `)
  };
});