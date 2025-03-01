import { useState, useEffect } from 'react';
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

const HomePage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortMethod, setSortMethod] = useState('hot');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        // TODO: Implement actual API call when ready
        // const response = await fetch(`/api/posts?sort=${sortMethod}`);
        // if (!response.ok) {
        //   throw new Error('Failed to fetch posts');
        // }
        // const data = await response.json();
        // setPosts(data);

        // Mock data for development
        setTimeout(() => {
          setPosts([
            {
              id: 1,
              title: "What's the most useful thing you've learned on Reddit?",
              content: "I've picked up so many life hacks and tips from various subreddits over the years. Curious to hear what useful knowledge others have gained!",
              createdAt: new Date(Date.now() - 3600000).toISOString(),
              userName: "curious_user",
              subredditName: "AskReddit",
              upvotes: 1542,
              downvotes: 41,
              commentCount: 832,
            },
            {
              id: 2,
              title: "Just finished building my first gaming PC!",
              content: "After months of saving and researching parts, I finally completed my build. Ryzen 7, RTX 3080, 32GB RAM, and a 1TB SSD. It's not much, but it's mine!",
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              userName: "pc_builder",
              subredditName: "gaming",
              upvotes: 2765,
              downvotes: 124,
              commentCount: 431,
            },
            {
              id: 3,
              title: "Breaking: Major tech company announces new CEO",
              createdAt: new Date(Date.now() - 7200000).toISOString(),
              userName: "tech_news",
              subredditName: "news",
              upvotes: 945,
              downvotes: 87,
              commentCount: 213,
            },
            {
              id: 4,
              title: "This cat looks exactly like my cat who passed away last year",
              content: "I was scrolling through r/cats and came across this doppelgänger of my beloved Mittens who crossed the rainbow bridge last year. The resemblance is uncanny!",
              createdAt: new Date(Date.now() - 172800000).toISOString(),
              userName: "cat_lover",
              subredditName: "cats",
              upvotes: 15234,
              downvotes: 125,
              commentCount: 473,
            },
            {
              id: 5,
              title: "Pro Tip: How to efficiently meal prep for the entire week",
              content: "I've been meal prepping for years and have refined my process to make it super efficient. Here's my complete guide to saving time and money while eating healthy!",
              createdAt: new Date(Date.now() - 259200000).toISOString(),
              userName: "meal_prep_master",
              subredditName: "LifeProTips",
              upvotes: 982,
              downvotes: 67,
              commentCount: 156,
            }
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching posts:', error);
        Sentry.captureException(error);
        setLoading(false);
      }
    };

    fetchPosts();
  }, [sortMethod]);

  const handleSortChange = (newSortMethod: string) => {
    if (newSortMethod !== sortMethod) {
      setSortMethod(newSortMethod);
    }
  };

  return (
    <div>
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

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card animate-pulse">
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
        <div>
          {posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No posts found.</p>
            </div>
          )}
        </div>
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

export default HomePage;