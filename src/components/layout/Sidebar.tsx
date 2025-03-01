import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as Sentry from '@sentry/browser';

interface Subreddit {
  id: number;
  name: string;
}

const Sidebar = () => {
  const { user } = useAuth();
  const [subreddits, setSubreddits] = useState<Subreddit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubreddits = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/subreddits');
        if (!response.ok) {
          throw new Error('Failed to fetch subreddits');
        }
        const data = await response.json();
        setSubreddits(data);
      } catch (error) {
        console.error('Error fetching subreddits:', error);
        Sentry.captureException(error);
        // Mock data for development
        setSubreddits([
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

    fetchSubreddits();
  }, []);

  return (
    <aside className="hidden md:block w-64 p-4">
      <div className="card p-4 mb-4">
        <h2 className="font-bold text-lg mb-4">About Reddit Clone</h2>
        <p className="text-sm mb-3">
          Reddit Clone is a platform for communities where users can post, comment, and vote.
        </p>
        <Link to="/submit" className="btn-primary w-full text-center block">
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
        ) : (
          <ul className="space-y-2">
            {subreddits.map((subreddit) => (
              <li key={subreddit.id}>
                <Link 
                  to={`/r/${subreddit.name}`}
                  className="block p-2 hover:bg-gray-100 rounded-md transition duration-200"
                >
                  r/{subreddit.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;