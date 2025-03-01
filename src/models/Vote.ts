/**
 * @typedef {Object} Vote
 * @property {number} id - Unique identifier
 * @property {string} userId - ID of the user who voted
 * @property {number|null} postId - ID of the post that was voted on (null if it's a comment vote)
 * @property {number|null} commentId - ID of the comment that was voted on (null if it's a post vote)
 * @property {number} value - Vote value (1 for upvote, -1 for downvote)
 * @property {Date} createdAt - Creation timestamp
 */

/**
 * @typedef {Object} VoteCreateParams
 * @property {string} userId - ID of the user voting
 * @property {number|null} postId - ID of the post (null if voting on a comment)
 * @property {number|null} commentId - ID of the comment (null if voting on a post)
 * @property {number} value - Vote value (1 or -1)
 */

/**
 * Creates a new vote with validated parameters
 * @param {VoteCreateParams} params - Parameters for creating a vote
 * @returns {Vote} The created vote object
 */
export function createVote(params: {
  userId: string;
  postId?: number | null;
  commentId?: number | null;
  value: number;
}) {
  const { userId, postId = null, commentId = null, value } = params;
  
  // Validation
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  if (postId === null && commentId === null) {
    throw new Error('Either postId or commentId must be provided');
  }
  
  if (postId !== null && commentId !== null) {
    throw new Error('Cannot vote on both a post and a comment');
  }
  
  if (value !== 1 && value !== -1) {
    throw new Error('Vote value must be either 1 (upvote) or -1 (downvote)');
  }
  
  return {
    userId,
    postId,
    commentId,
    value,
    createdAt: new Date()
  };
}

/**
 * Updates an existing vote or creates a new one
 * @param {Vote|null} existingVote - The existing vote to update, or null if creating new
 * @param {number} newValue - The new vote value (1 or -1)
 * @returns {Vote|null} The updated vote or null if vote was removed
 */
export function updateVote(
  existingVote: { value: number; userId: string; postId?: number | null; commentId?: number | null } | null, 
  newValue: number
) {
  // If clicking the same vote button again, remove the vote
  if (existingVote && existingVote.value === newValue) {
    return null; // Return null to indicate vote should be removed
  }
  
  // If no existing vote, create a new one
  if (!existingVote) {
    throw new Error('Cannot update a non-existent vote');
  }
  
  // Update the existing vote
  return {
    ...existingVote,
    value: newValue
  };
}