import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import UserMenu from './UserMenu';

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img 
              src="https://supabase.zapt.ai/storage/v1/render/image/public/icons/c7bd5333-787f-461f-ae9b-22acbc0ed4b0/55145115-0624-472f-96b9-d5d88aae355f.png?width=32&height=32" 
              alt="Reddit Clone"
              className="w-8 h-8 mr-2"
            />
            <span className="font-bold text-lg hidden sm:block">Reddit Clone</span>
          </Link>
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-xl px-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="search"
              className="box-border w-full py-2 pl-10 pr-4 bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:bg-white focus:border-reddit-blue focus:ring-1 focus:ring-reddit-blue"
              placeholder="Search Reddit"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          {user ? (
            <UserMenu />
          ) : (
            <>
              <button
                onClick={() => navigate('/auth')}
                className="btn-secondary hidden sm:block"
              >
                Log In
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="btn-primary"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;