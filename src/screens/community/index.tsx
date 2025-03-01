import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CommunityInfo from '@/components/community/CommunityInfo';
import PostCard from '@/components/post/PostCard';
import { getCommunities } from '@/api/communities';
import { getPosts } from '@/api/posts';

interface Community {
  id: number;
  name: string;
  description: string; // This needs to be a string, not optional
  createdAt: string;
  createdBy: string;
}

interface Post {
  id: number;
  title: string;
  content?: string;
  communityId: number;
  userId: string;
  createdAt: string;
  voteScore: number;
  userVote: number | undefined; // Changed from number | null to number | undefined
  communityName: string;
  userName: string;
  subredditName: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
}

const CommunityScreen = () => {
  const { communityName } = useParams<{ communityName: string }>();
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommunityAndPosts = async () => {
      try {
        // Get all communities to find the one with matching name
        const communities = await getCommunities();
        const matchedCommunity = communities.find(
          (c: Community) => c.name === communityName
        );
        
        if (!matchedCommunity) {
          setError('Community not found');
          setIsLoading(false);
          return;
        }
        
        // Ensure description is always a string
        const communityWithStringDescription = {
          ...matchedCommunity,
          description: matchedCommunity.description || '' // Ensure description is a string
        };
        
        setCommunity(communityWithStringDescription);
        
        // Get posts for this community
        const communityPosts = await getPosts(matchedCommunity.id);
        setPosts(communityPosts.map((post: any) => ({
          ...post,
          userName: post.userName || 'unknown',
          subredditName: matchedCommunity.name,
          upvotes: post.upvotes || 0,
          downvotes: post.downvotes || 0,
          commentCount: post.commentCount || 0,
          userVote: post.userVote === null ? undefined : post.userVote // Convert null to undefined
        })));
      } catch (err) {
        console.error('Error loading community:', err);
        setError('Failed to load community data');
      } finally {
        setIsLoading(false);
      }
    };

    if (communityName) {
      fetchCommunityAndPosts();
    }
  }, [communityName]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : community ? (
        <>
          <CommunityInfo community={community} />
          
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Posts</h2>
            
            {posts.length === 0 ? (
              <div className="bg-white shadow rounded-md p-6 text-center">
                <p className="text-gray-500">No posts in this community yet.</p>
                <a 
                  href={`/submit?community=${community.id}`}
                  className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer"
                >
                  Create Post
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default CommunityScreen;