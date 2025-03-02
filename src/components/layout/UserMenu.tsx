import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { useAuth } from '../../context/AuthContext';
import { UserCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const UserMenu = () => {
  const { user, signOut, loading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const userName = user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const handleSignOut = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    try {
      setIsLoggingOut(true);
      console.log('Signing out...');
      await signOut();
      // No need for navigation here as we're doing a full redirect in AuthContext
    } catch (error) {
      console.error('Error during sign out:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-center items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold shadow-sm hover:bg-gray-50 cursor-pointer">
          <div className="flex items-center">
            <UserCircleIcon className="w-6 h-6 text-gray-700 mr-1" />
            <span className="hidden sm:inline mr-1">{userName}</span>
          </div>
          <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-3">
            <p className="text-sm font-medium text-gray-900">Signed in as</p>
            <p className="truncate text-sm text-gray-500">{user?.email}</p>
          </div>
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <Link
                  to={`/u/${userName}`}
                  className={`${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  } block px-4 py-2 text-sm`}
                >
                  Profile
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link
                  to="/submit"
                  className={`${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  } block px-4 py-2 text-sm`}
                >
                  Create Post
                </Link>
              )}
            </Menu.Item>
          </div>
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className={`${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  } block w-full text-left px-4 py-2 text-sm cursor-pointer`}
                >
                  {isLoggingOut ? 'Signing out...' : 'Sign out'}
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default UserMenu;