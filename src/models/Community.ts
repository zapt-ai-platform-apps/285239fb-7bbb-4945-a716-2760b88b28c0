/**
 * @typedef {Object} Community
 * @property {number} id - Unique identifier
 * @property {string} name - Community name (unique)
 * @property {string} description - Community description
 * @property {Date} createdAt - Creation timestamp
 * @property {string} createdBy - User ID of creator
 */

/**
 * @typedef {Object} CommunityCreateParams
 * @property {string} name - Community name
 * @property {string} description - Community description
 * @property {string} userId - ID of the user creating the community
 */

/**
 * Creates a new community with validated parameters
 * @param {CommunityCreateParams} params - Parameters for creating a community
 * @returns {Community} The created community object
 */
export function createCommunity(params: {
  name: string;
  description: string;
  userId: string;
}) {
  const { name, description, userId } = params;
  
  // Validation
  if (!name) {
    throw new Error('Community name is required');
  }
  
  if (name.length < 3) {
    throw new Error('Community name must be at least 3 characters');
  }
  
  if (name.length > 21) {
    throw new Error('Community name must be less than 22 characters');
  }
  
  // Name can only contain letters, numbers, and underscores
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    throw new Error('Community name can only contain letters, numbers, and underscores');
  }
  
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  return {
    name,
    description: description || '', // Ensure description is always a string, never undefined
    createdBy: userId,
    createdAt: new Date()
  };
}

/**
 * Formats a community object for display
 * @param {Community} community - The community to format
 * @returns {Object} Formatted community object
 */
export function formatCommunity(community: {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  createdBy: string;
}) {
  return {
    ...community,
    displayName: `r/${community.name}`,
  };
}