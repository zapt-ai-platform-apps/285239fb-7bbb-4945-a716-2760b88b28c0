import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PostCard from '../../components/post/PostCard';
import CommunityInfo from '../../components/community/CommunityInfo';
import useAuth from '../../hooks/useAuth';
import * as Sentry from '@sentry/browser';
import { Post } from '../../types/post';

interface Community {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  createdBy: string;
}

const CommunityPage = () => {
  const { communityName } = useParams<{ communityName: string }>();
  const { session } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCommunity = async () => {
      setLoading(true);
      try {
        if (!communityName) {
          throw new Error('Community name is required');
        }

        // Fetch community
        const communityResponse = await fetch(`/api/communities?name=${communityName}`, {
          headers: session ? {
            Authorization: `Bearer ${session.access_token}`,
          } : {},
        });

        if (!communityResponse.ok) {
          throw new Error('Failed to fetch community');
        }

        const communitiesData = await communityResponse.json();
        if (communitiesData.length === 0) {
          throw new Error('Community not found');
        }

        const foundCommunity = communitiesData.find(
          (c: Community) => c.name.toLowerCase() === communityName.toLowerCase()
        );

        if (!foundCommunity) {
          throw new Error('Community not found');
        }

        setCommunity(foundCommunity);

        // Fetch posts for this community
        const postsResponse = await fetch(`/api/posts?communityId=${foundCommunity.id}`, {
          headers: session ? {
            Authorization: `Bearer ${session.access_token}`,
          } : {},
        });

        if (!postsResponse.ok) {
          throw new Error('Failed to fetch posts');
        }

        const postsData = await postsResponse.json();
        const formattedPosts = postsData.map((post: Post) => ({
          ...post,
          userName: post.userName || 'unknown',
          subredditName: communityName,
          commentCount: 0,
        }));
        setPosts(formattedPosts);
      } catch (error) {
        console.error('Error fetching community:', error);
        Sentry.captureException(error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunity();
  }, [communityName, session]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 flex justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="card text-center py-8">
          <p className="text-lg text-gray-600">Community not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main content */}
        <div className="md:w-2/3">
          <h1 className="text-2xl font-bold mb-4">r/{community.name}</h1>

          {posts.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-lg text-gray-600 mb-4">No posts in this community yet!</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={{
                  ...post,
                  userName: post.userName || 'unknown',
                  subredditName: community.name,
                  commentCount: post.commentCount || 0
                }} 
              />
            ))
          )}
        </div>

        {/* Sidebar */}
        <div className="md:w-1/3">
          <CommunityInfo community={community} />

          <div className="card">
            <h2 className="text-lg font-bold mb-3">Community Rules</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Remember the human</li>
              <li>Behave like you would in real life</li>
              <li>Look for the original source of content</li>
              <li>Search for duplicates before posting</li>
              <li>Read the community's rules</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;