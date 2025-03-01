import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PostCard from '../../components/post/PostCard';
import * as Sentry from '@sentry/browser';
import useAuth from '../../hooks/useAuth';
import { Post } from '../../types/post';

interface Community {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  createdBy: string;
}

const SubredditPage = () => {
  const { subredditName } = useParams<{ subredditName: string }>();
  const { session } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortMethod, setSortMethod] = useState('hot');

  useEffect(() => {
    const fetchSubredditAndPosts = async () => {
      if (!subredditName) return;
      
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching data for r/${subredditName}`);
        
        // Fetch communities to find matching one by name
        const communityResponse = await fetch(`/api/communities`, {
          headers: session ? {
            Authorization: `Bearer ${session.access_token}`
          } : {}
        });
        
        // Check for successful response
        if (!communityResponse.ok) {
          throw new Error(`Failed to fetch communities data: ${communityResponse.status}`);
        }
        
        let communities;
        try {
          communities = await communityResponse.json();
          console.log(`Found ${communities.length} communities`);
        } catch (jsonError) {
          console.error('JSON parsing error:', jsonError);
          Sentry.captureException(jsonError);
          throw new Error(`Failed to parse communities response as JSON. Received: ${await communityResponse.text()}`);
        }
        
        // Find the community with matching name
        const foundCommunity = communities.find(
          (c: Community) => c.name.toLowerCase() === subredditName.toLowerCase()
        );
        
        if (!foundCommunity) {
          setError(`Community r/${subredditName} not found`);
          setLoading(false);
          return;
        }
        
        setCommunity(foundCommunity);
        
        // Fetch posts for this community
        const postsResponse = await fetch(`/api/posts?communityId=${foundCommunity.id}`, {
          headers: session ? {
            Authorization: `Bearer ${session.access_token}`
          } : {}
        });
        
        if (!postsResponse.ok) {
          throw new Error(`Failed to fetch posts: ${postsResponse.status}`);
        }
        
        let postsData;
        try {
          postsData = await postsResponse.json();
          console.log(`Found ${postsData.length} posts for community`);
        } catch (jsonError) {
          console.error('JSON parsing error:', jsonError);
          Sentry.captureException(jsonError);
          throw new Error(`Failed to parse posts response as JSON. Received: ${await postsResponse.text()}`);
        }
        
        setPosts(postsData);
      } catch (error) {
        console.error('Error fetching subreddit data:', error);
        Sentry.captureException(error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSubredditAndPosts();
  }, [subredditName, session, sortMethod]);

  const handleSortChange = (newSortMethod: string) => {
    if (newSortMethod !== sortMethod) {
      setSortMethod(newSortMethod);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-24 bg-gray-200 rounded-t-md mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card animate-pulse mb-4">
            <div className="flex">
              <div className="bg-gray-200 w-10 p-2"></div>
              <div className="p-4 flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-24 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-28"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Link to="/" className="btn-primary cursor-pointer">Return to Home</Link>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="card p-6 text-center">
        <p className="text-gray-500 mb-4">Community not found</p>
        <Link to="/" className="btn-primary cursor-pointer">Return to Home</Link>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-md shadow-sm mb-4 overflow-hidden">
        <div className="h-24 bg-reddit-blue"></div>
        <div className="p-4">
          <h1 className="text-2xl font-bold">r/{community.name}</h1>
          <p className="text-gray-500 text-sm mb-2">
            Created {new Date(community.createdAt).toLocaleDateString()}
          </p>
          <p className="text-sm">{community.description || 'No description provided'}</p>
        </div>
      </div>

      <div className="mb-4 pb-2 border-b border-gray-200">
        <div className="flex space-x-2">
          <SortButton 
            label="Hot" 
            active={sortMethod === 'hot'} 
            onClick={() => handleSortChange('hot')} 
          />
          <SortButton 
            label="New" 
            active={sortMethod === 'new'} 
            onClick={() => handleSortChange('new')} 
          />
          <SortButton 
            label="Top" 
            active={sortMethod === 'top'} 
            onClick={() => handleSortChange('top')} 
          />
        </div>
      </div>

      <div>
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={{
                ...post,
                userName: post.userName || 'unknown',
                subredditName: community.name,
                commentCount: post.commentCount || 0,
                upvotes: post.upvotes || 0,
                downvotes: post.downvotes || 0
              }} 
            />
          ))
        ) : (
          <div className="text-center py-8 bg-white rounded-md shadow-sm">
            <p className="text-gray-500 mb-4">No posts in this community yet.</p>
            <Link to="/submit" className="btn-primary cursor-pointer">Create the first post</Link>
          </div>
        )}
      </div>
    </>
  );
};

interface SortButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const SortButton = ({ label, active, onClick }: SortButtonProps) => {
  return (
    <button
      className={`px-4 py-2 text-sm font-medium rounded-full cursor-pointer ${
        active 
          ? 'bg-gray-200 text-gray-800' 
          : 'text-gray-500 hover:bg-gray-100'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default SubredditPage;