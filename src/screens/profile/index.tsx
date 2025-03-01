import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProtectedRoute from '../../components/layout/ProtectedRoute';
import PostCard from '../../components/post/PostCard';
import useAuth from '../../hooks/useAuth';
import * as Sentry from '@sentry/browser';

interface Post {
  id: number;
  title: string;
  content: string;
  communityId: number;
  communityName: string;
  userId: string;
  createdAt: string;
  voteScore: number;
  userVote: number | null;
}

const Profile = () => {
  const { user, session, signOut } = useAuth();
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!session) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/posts?userId=${user?.id}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user posts');
        }

        const data = await response.json();
        setUserPosts(data);
      } catch (error) {
        console.error('Error fetching user posts:', error);
        Sentry.captureException(error);
        setError('Failed to load your posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [session, user?.id]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      Sentry.captureException(error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="card mb-6">
            <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <p className="text-lg mb-2">
                  <span className="font-medium">Email:</span> {user?.email}
                </p>
                <p className="text-sm text-gray-500">
                  Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}
                </p>
              </div>
              
              <div className="mt-4 md:mt-0">
                <button 
                  onClick={handleSignOut}
                  className="btn-secondary"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Your Posts</h2>
              <Link to="/submit" className="btn-primary">
                Create Post
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            ) : userPosts.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-lg text-gray-600 mb-4">You haven't created any posts yet.</p>
                <Link to="/submit" className="btn-primary inline-block">
                  Create your first post
                </Link>
              </div>
            ) : (
              userPosts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Profile;