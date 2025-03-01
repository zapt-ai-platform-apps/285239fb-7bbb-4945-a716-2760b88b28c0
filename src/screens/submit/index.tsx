import { useEffect, useState } from 'react';
import PostForm from '../../components/post/PostForm';
import ProtectedRoute from '../../components/layout/ProtectedRoute';
import * as Sentry from '@sentry/browser';
import useAuth from '../../hooks/useAuth';

interface Community {
  id: number;
  name: string;
}

const Submit = () => {
  const { session } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCommunities = async () => {
      if (!session) return;
      
      setLoading(true);
      try {
        const response = await fetch('/api/communities', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch communities');
        }

        const data = await response.json();
        setCommunities(data);
      } catch (error) {
        console.error('Error fetching communities:', error);
        Sentry.captureException(error);
        setError('Failed to load communities. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, [session]);

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-8">Create a Post</h1>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-2xl mx-auto">
            {error}
          </div>
        ) : communities.length === 0 ? (
          <div className="card max-w-2xl mx-auto text-center py-8">
            <p className="text-lg text-gray-600 mb-4">You need to join or create a community before you can post!</p>
            <a href="/create-community" className="btn-primary inline-block">
              Create a Community
            </a>
          </div>
        ) : (
          <PostForm communities={communities} />
        )}
      </div>
    </ProtectedRoute>
  );
};

export default Submit;