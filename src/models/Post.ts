/**
 * @typedef {Object} Post
 * @property {number} id - Unique identifier
 * @property {string} title - Post title
 * @property {string} content - Post content
 * @property {number} communityId - ID of the community the post belongs to
 * @property {string} userId - ID of the user who created the post
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} PostCreateParams
 * @property {string} title - Post title
 * @property {string} content - Post content
 * @property {number} communityId - ID of the community
 * @property {string} userId - ID of the user creating the post
 */

/**
 * Creates a new post with validated parameters
 * @param {PostCreateParams} params - Parameters for creating a post
 * @returns {Post} The created post object
 */
export function createPost(params: {
  title: string;
  content: string;
  communityId: number;
  userId: string;
}) {
  const { title, content, communityId, userId } = params;
  
  // Validation
  if (!title) {
    throw new Error('Post title is required');
  }
  
  if (title.length < 3) {
    throw new Error('Post title must be at least 3 characters');
  }
  
  if (title.length > 300) {
    throw new Error('Post title must be less than 300 characters');
  }
  
  if (!communityId) {
    throw new Error('Community ID is required');
  }
  
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  const now = new Date();
  
  return {
    title,
    content: content || '',
    communityId,
    userId,
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Calculate vote score for a post (upvotes - downvotes)
 * @param {Object[]} votes - Array of vote objects
 * @returns {number} The calculated vote score
 */
export function calculateVoteScore(votes: { value: number }[]) {
  if (!votes || votes.length === 0) {
    return 0;
  }
  
  return votes.reduce((total, vote) => total + vote.value, 0);
}

/**
 * Get the user's vote on a post if it exists
 * @param {Object[]} votes - Array of vote objects
 * @param {string} userId - ID of the current user
 * @returns {number|null} 1 for upvote, -1 for downvote, null if no vote
 */
export function getUserVote(votes: { userId: string; value: number }[], userId: string) {
  if (!votes || votes.length === 0 || !userId) {
    return null;
  }
  
  const userVote = votes.find(vote => vote.userId === userId);
  return userVote ? userVote.value : null;
}