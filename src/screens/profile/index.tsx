import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PostCard from '../../components/post/PostCard';
import * as Sentry from '@sentry/browser';

interface Post {
  id: number;
  title: string;
  content?: string;
  createdAt: string;
  userName: string;
  subredditName: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  userVote?: number;
}

interface UserProfile {
  username: string;
  joinDate: string;
  karma: number;
}

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // TODO: Implement actual API calls when ready
        // const profileResponse = await fetch(`/api/users/${username}`);
        // if (!profileResponse.ok) {
        //   throw new Error('Failed to fetch user profile');
        // }
        // const profileData = await profileResponse.json();
        // setUserProfile(profileData);
        
        // const postsResponse = await fetch(`/api/users/${username}/posts`);
        // if (!postsResponse.ok) {
        //   throw new Error('Failed to fetch user posts');
        // }
        // const postsData = await postsResponse.json();
        // setPosts(postsData);

        // Mock data for development
        setTimeout(() => {
          setUserProfile({
            username: username || 'unknown',
            joinDate: new Date(Date.now() - 15552000000).toISOString(), // 6 months ago
            karma: 12453,
          });

          setPosts([
            {
              id: 1,
              title: `Post by ${username} in r/funny`,
              content: "This is a post I made in r/funny that got a lot of upvotes!",
              createdAt: new Date(Date.now() - 259200000).toISOString(),
              userName: username || 'unknown',
              subredditName: "funny",
              upvotes: 742,
              downvotes: 21,
              commentCount: 132,
            },
            {
              id: 2,
              title: `Another post by ${username} in r/gaming`,
              content: "I shared my gaming setup and got some great feedback.",
              createdAt: new Date(Date.now() - 604800000).toISOString(),
              userName: username || 'unknown',
              subredditName: "gaming",
              upvotes: 531,
              downvotes: 42,
              commentCount: 89,
            },
            {
              id: 3,
              title: `Question from ${username} in r/AskReddit`,
              createdAt: new Date(Date.now() - 2592000000).toISOString(),
              userName: username || 'unknown',
              subredditName: "AskReddit",
              upvotes: 325,
              downvotes: 15,
              commentCount: 47,
            }
          ]);
          
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching user data:', error);
        Sentry.captureException(error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  return (
    <div>
      {loading ? (
        <div className="animate-pulse">
          <div className="bg-white rounded-md shadow-sm mb-4 p-6">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full mr-4"></div>
              <div>
                <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md shadow-sm mb-4 p-4">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card animate-pulse mb-4">
                <div className="flex">
                  <div className="bg-gray-200 w-10 p-2"></div>
                  <div className="p-4 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-16 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-28"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-md shadow-sm mb-4 p-6">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full mr-4 flex items-center justify-center text-2xl text-gray-500">
                {username?.[0]?.toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold">u/{userProfile?.username}</h1>
                <p className="text-gray-500 text-sm">
                  {userProfile?.karma.toLocaleString()} karma • 
                  Joined {new Date(userProfile?.joinDate || '').toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md shadow-sm mb-4">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === 'posts'
                      ? 'border-reddit-orange text-reddit-orange'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('posts')}
                >
                  Posts
                </button>
                <button
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === 'comments'
                      ? 'border-reddit-orange text-reddit-orange'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('comments')}
                >
                  Comments
                </button>
              </nav>
            </div>

            <div className="p-4">
              {activeTab === 'posts' ? (
                posts.length > 0 ? (
                  posts.map((post) => <PostCard key={post.id} post={post} />)
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">This user hasn't posted anything yet.</p>
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Comments will be displayed here.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;