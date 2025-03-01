import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCommunities } from '@/api/communities';
import useAuth from '@/hooks/useAuth';

interface Community {
  id: number;
  name: string;
  description?: string;
}

const Sidebar: React.FC = () => {
  const { session } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommunities = async () => {
      if (!session) {
        setIsLoading(false);
        return;
      }
      
      try {
        const data = await getCommunities();
        setCommunities(data);
      } catch (err) {
        console.error('Error fetching communities:', err);
        setError('Failed to load communities');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunities();
  }, [session]);

  if (!session) {
    return null;
  }

  return (
    <div className="bg-white shadow rounded-md p-4 w-64">
      <h2 className="text-lg font-semibold mb-4">Communities</h2>
      
      {isLoading ? (
        <div className="py-4 text-center">
          <div className="w-6 h-6 border-2 border-t-transparent border-indigo-500 rounded-full animate-spin mx-auto"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-sm">{error}</div>
      ) : communities.length === 0 ? (
        <div className="text-gray-500 text-sm">No communities found</div>
      ) : (
        <ul className="space-y-2">
          {communities.map((community) => (
            <li key={community.id}>
              <Link 
                to={`/r/${community.name}`}
                className="block hover:bg-gray-50 p-2 rounded transition"
              >
                r/{community.name}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 pt-3 border-t">
        <Link 
          to="/create-community"
          className="block text-center py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition cursor-pointer"
        >
          Create Community
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;