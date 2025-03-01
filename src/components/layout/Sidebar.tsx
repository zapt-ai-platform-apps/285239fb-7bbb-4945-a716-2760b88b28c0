import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as Sentry from '@sentry/browser';

interface Community {
  id: number;
  name: string;
}

const Sidebar = () => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching communities for sidebar');
        
        const response = await fetch('/api/communities');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch communities: ${response.status}`);
        }
        
        let data;
        try {
          data = await response.json();
          console.log(`Found ${data.length} communities`);
        } catch (jsonError) {
          console.error('JSON parsing error:', jsonError);
          Sentry.captureException(jsonError);
          throw new Error(`Failed to parse communities response as JSON. Received: ${await response.text()}`);
        }
        
        setCommunities(data);
      } catch (error) {
        console.error('Error fetching communities:', error);
        Sentry.captureException(error);
        setError('Failed to load communities');
        
        // Set fallback mock data if API fails
        setCommunities([
          { id: 1, name: 'funny' },
          { id: 2, name: 'AskReddit' },
          { id: 3, name: 'gaming' },
          { id: 4, name: 'news' },
          { id: 5, name: 'worldnews' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  return (
    <aside className="hidden md:block w-64 p-4">
      <div className="card p-4 mb-4">
        <h2 className="font-bold text-lg mb-4">About Reddit Clone</h2>
        <p className="text-sm mb-3">
          Reddit Clone is a platform for communities where users can post, comment, and vote.
        </p>
        <Link to="/submit" className="btn-primary w-full text-center block cursor-pointer">
          Create Post
        </Link>
      </div>

      <div className="card p-4">
        <h2 className="font-bold text-lg mb-4">Top Communities</h2>
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : (
          <ul className="space-y-2">
            {communities.map((community) => (
              <li key={community.id}>
                <Link 
                  to={`/r/${community.name}`}
                  className="block p-2 hover:bg-gray-100 rounded-md transition duration-200"
                >
                  r/{community.name}
                </Link>
              </li>
            ))}
            
            {communities.length === 0 && (
              <li className="text-center text-gray-500 py-2">
                No communities found
              </li>
            )}
          </ul>
        )}
        
        {user && (
          <Link 
            to="/create-community" 
            className="mt-4 text-reddit-blue hover:underline text-sm block text-center"
          >
            Create a Community
          </Link>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;