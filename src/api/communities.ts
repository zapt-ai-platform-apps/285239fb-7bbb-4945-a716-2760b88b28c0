import { supabase } from '../supabaseClient';

/**
 * Fetches all communities
 */
export async function getCommunities() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('No active session');
    }

    const response = await fetch('/api/communities', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch communities');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching communities:', error);
    throw error;
  }
}

/**
 * Creates a new community
 */
export async function createCommunity(data: { name: string; description?: string }) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('No active session');
    }

    const response = await fetch('/api/communities', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create community');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating community:', error);
    throw error;
  }
}