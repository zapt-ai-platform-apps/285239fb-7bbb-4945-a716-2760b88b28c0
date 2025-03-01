import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PostCard from '../../components/post/PostCard';
import useAuth from '../../hooks/useAuth';
import * as Sentry from '@sentry/browser';
import { FaPlus } from 'react-icons/fa';

interface Post {
  id: number;
  title: string;
  content: string;
  communityId: number;
  communityName: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  voteScore: number;
  userVote: number | null;
}

interface Community {
  id: number;
  name: string;
}

const Home = () => {
  const { session } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch posts
        let postsResponse;
        if (session) {
          postsResponse = await fetch('/api/posts', {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });
        } else {
          postsResponse = await fetch('/api/posts');
        }

        if (!postsResponse.ok) {
          throw new Error('Failed to fetch posts');
        }

        const postsData = await postsResponse.json();
        setPosts(postsData);

        // Fetch communities
        let communitiesResponse;
        if (session) {
          communitiesResponse = await fetch('/api/communities', {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });
        } else {
          communitiesResponse = await fetch('/api/communities');
        }

        if (!communitiesResponse.ok) {
          throw new Error('Failed to fetch communities');
        }

        const communitiesData = await communitiesResponse.json();
        setCommunities(communitiesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        Sentry.captureException(error);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main content */}
        <div className="md:w-2/3">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Popular Posts</h1>
            {session && (
              <Link to="/submit" className="btn-primary">
                Create Post
              </Link>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          ) : posts.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-lg text-gray-600 mb-4">No posts yet!</p>
              {session && (
                <Link to="/submit" className="btn-primary inline-block">
                  Create the first post
                </Link>
              )}
            </div>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>

        {/* Sidebar */}
        <div className="md:w-1/3">
          <div className="card mb-4">
            <h2 className="text-lg font-bold mb-3">About Reddit Clone</h2>
            <p className="text-gray-700 mb-4">
              Welcome to Reddit Clone, a community of communities where people can dive into their interests, hobbies, and passions.
            </p>
            {session ? (
              <Link to="/create-community" className="btn-primary block text-center">
                Create Community
              </Link>
            ) : (
              <Link to="/login" className="btn-primary block text-center">
                Sign In to Create Community
              </Link>
            )}
          </div>

          <div className="card">
            <h2 className="text-lg font-bold mb-3">Top Communities</h2>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : communities.length === 0 ? (
              <p className="text-gray-600 mb-4">No communities yet!</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {communities.slice(0, 5).map((community, index) => (
                  <li key={community.id} className="py-2">
                    <Link to={`/r/${community.name}`} className="flex items-center hover:bg-gray-50 p-2 rounded">
                      <span className="text-gray-500 font-medium mr-3">{index + 1}</span>
                      <span className="font-medium">r/{community.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {session && (
              <Link 
                to="/create-community" 
                className="flex items-center text-blue-500 font-medium mt-3 hover:bg-blue-50 p-2 rounded"
              >
                <FaPlus className="mr-2" />
                <span>Create Community</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;