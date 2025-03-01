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

interface Subreddit {
  id: number;
  name: string;
  description?: string;
  memberCount?: number;
  createdAt: string;
}

const SubredditPage = () => {
  const { subredditName } = useParams<{ subredditName: string }>();
  const [subreddit, setSubreddit] = useState<Subreddit | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortMethod, setSortMethod] = useState('hot');

  useEffect(() => {
    const fetchSubredditAndPosts = async () => {
      try {
        setLoading(true);
        
        // TODO: Implement actual API calls when ready
        // const subredditResponse = await fetch(`/api/subreddits/${subredditName}`);
        // if (!subredditResponse.ok) {
        //   throw new Error('Failed to fetch subreddit info');
        // }
        // const subredditData = await subredditResponse.json();
        // setSubreddit(subredditData);
        
        // const postsResponse = await fetch(`/api/subreddits/${subredditName}/posts?sort=${sortMethod}`);
        // if (!postsResponse.ok) {
        //   throw new Error('Failed to fetch posts');
        // }
        // const postsData = await postsResponse.json();
        // setPosts(postsData);

        // Mock data for development
        setTimeout(() => {
          setSubreddit({
            id: 1,
            name: subredditName || 'unknown',
            description: "A community dedicated to discussing all things related to this topic.",
            memberCount: 142567,
            createdAt: new Date(Date.now() - 31536000000).toISOString(), // 1 year ago
          });

          setPosts([
            {
              id: 1,
              title: `First popular post in r/${subredditName}`,
              content: "This is the content of the first post. It's pretty interesting!",
              createdAt: new Date(Date.now() - 3600000).toISOString(),
              userName: "active_poster",
              subredditName: subredditName || 'unknown',
              upvotes: 742,
              downvotes: 21,
              commentCount: 132,
            },
            {
              id: 2,
              title: `Second popular post in r/${subredditName}`,
              content: "This is the content of the second post. Even more interesting than the first!",
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              userName: "frequent_contributor",
              subredditName: subredditName || 'unknown',
              upvotes: 531,
              downvotes: 42,
              commentCount: 89,
            },
            {
              id: 3,
              title: `Third popular post in r/${subredditName}`,
              createdAt: new Date(Date.now() - 172800000).toISOString(),
              userName: "community_member",
              subredditName: subredditName || 'unknown',
              upvotes: 325,
              downvotes: 15,
              commentCount: 47,
            }
          ]);
          
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching data:', error);
        Sentry.captureException(error);
        setLoading(false);
      }
    };

    fetchSubredditAndPosts();
  }, [subredditName, sortMethod]);

  const handleSortChange = (newSortMethod: string) => {
    if (newSortMethod !== sortMethod) {
      setSortMethod(newSortMethod);
    }
  };

  return (
    <div>
      {loading ? (
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
      ) : (
        <>
          <div className="bg-white rounded-md shadow-sm mb-4 overflow-hidden">
            <div className="h-24 bg-reddit-blue"></div>
            <div className="p-4">
              <h1 className="text-2xl font-bold">r/{subreddit?.name}</h1>
              <p className="text-gray-500 text-sm mb-2">
                {subreddit?.memberCount?.toLocaleString()} members • 
                Created {new Date(subreddit?.createdAt || '').toLocaleDateString()}
              </p>
              <p className="text-sm">{subreddit?.description}</p>
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
              posts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <div className="text-center py-8 bg-white rounded-md shadow-sm">
                <p className="text-gray-500">No posts in this subreddit yet.</p>
                <button className="btn-primary mt-4">Create the first post</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
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