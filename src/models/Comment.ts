/**
 * @typedef {Object} Comment
 * @property {number} id - Unique identifier
 * @property {string} content - Comment content
 * @property {number} postId - ID of the post the comment belongs to
 * @property {string} userId - ID of the user who created the comment
 * @property {number|null} parentId - ID of the parent comment if this is a reply
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} CommentCreateParams
 * @property {string} content - Comment content
 * @property {number} postId - ID of the post
 * @property {string} userId - ID of the user creating the comment
 * @property {number|null} parentId - ID of the parent comment if this is a reply
 */

/**
 * Creates a new comment with validated parameters
 * @param {CommentCreateParams} params - Parameters for creating a comment
 * @returns {Comment} The created comment object
 */
export function createComment(params: {
  content: string;
  postId: number;
  userId: string;
  parentId?: number | null;
}) {
  const { content, postId, userId, parentId = null } = params;
  
  // Validation
  if (!content) {
    throw new Error('Comment content is required');
  }
  
  if (content.length < 1) {
    throw new Error('Comment content must not be empty');
  }
  
  if (content.length > 10000) {
    throw new Error('Comment content must be less than 10,000 characters');
  }
  
  if (!postId) {
    throw new Error('Post ID is required');
  }
  
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  const now = new Date();
  
  return {
    content,
    postId,
    userId,
    parentId,
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Organizes comments into a nested structure for a thread view
 * @param {Comment[]} comments - Array of all comments
 * @returns {Object} Nested comment structure
 */
export function buildCommentThread(comments: Array<{
  id: number;
  parentId: number | null;
  [key: string]: any;
}>) {
  if (!comments || comments.length === 0) {
    return [];
  }

  const commentMap: Record<number, any> = {};
  const rootComments: any[] = [];

  // First pass: Create a map of all comments
  comments.forEach(comment => {
    commentMap[comment.id] = {
      ...comment,
      replies: []
    };
  });

  // Second pass: Set up the parent-child relationships
  comments.forEach(comment => {
    if (comment.parentId === null) {
      rootComments.push(commentMap[comment.id]);
    } else if (commentMap[comment.parentId]) {
      commentMap[comment.parentId].replies.push(commentMap[comment.id]);
    }
  });

  return rootComments;
}