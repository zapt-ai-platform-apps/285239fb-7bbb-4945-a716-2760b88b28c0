import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PostCard from '../../components/post/PostCard';
import CommentSection from '../../components/comment/CommentSection';
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

const PostDetailPage = () => {
  const { postId, subredditName } = useParams<{ postId: string; subredditName: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        
        // TODO: Implement actual API call when ready
        // const response = await fetch(`/api/posts/${postId}`);
        // if (!response.ok) {
        //   throw new Error('Failed to fetch post');
        // }
        // const data = await response.json();
        // setPost(data);

        // Mock data for development
        setTimeout(() => {
          setPost({
            id: parseInt(postId || '0'),
            title: "This is a detailed post about an interesting topic",
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.\n\nSed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            userName: "detailed_poster",
            subredditName: subredditName || 'unknown',
            upvotes: 1542,
            downvotes: 41,
            commentCount: 87,
          });
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching post:', error);
        Sentry.captureException(error);
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId, subredditName]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="card mb-4">
          <div className="flex">
            <div className="bg-gray-200 w-14 p-2"></div>
            <div className="p-4 flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="h-8 bg-gray-200 rounded w-1/6 mb-4"></div>
        
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Post not found or has been deleted.</p>
      </div>
    );
  }

  return (
    <div>
      <PostCard post={post} isDetail />
      <CommentSection postId={post.id} />
    </div>
  );
};

export default PostDetailPage;