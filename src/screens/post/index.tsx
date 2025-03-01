import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PostCard from '../../components/post/PostCard';
import CommentItem from '../../components/comment/CommentItem';
import CommentForm from '../../components/comment/CommentForm';
import useAuth from '../../hooks/useAuth';
import * as Sentry from '@sentry/browser';
import { buildCommentThread } from '../../models/Comment';

interface Post {
  id: number;
  title: string;
  content: string;
  communityId: number;
  communityName: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  voteScore: number;
  userVote: number | null;
  userEmail?: string;
}

interface Comment {
  id: number;
  content: string;
  postId: number;
  userId: string;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
  voteScore: number;
  userVote: number | null;
  user?: {
    email: string;
  };
  replies?: Comment[];
}

const PostDetail = () => {
  const { postId } = useParams<{ postId: string }>();
  const { session, user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComments = async () => {
    try {
      if (!postId) return;
      
      const response = await fetch(`/api/comments?postId=${postId}`, {
        headers: session ? {
          Authorization: `Bearer ${session.access_token}`,
        } : {},
      });

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const commentsData = await response.json();
      const threaded = buildCommentThread(commentsData);
      setComments(threaded);
    } catch (error) {
      console.error('Error fetching comments:', error);
      Sentry.captureException(error);
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        if (!postId) {
          throw new Error('Post ID is required');
        }

        // Fetch post
        const postResponse = await fetch(`/api/posts?postId=${postId}`, {
          headers: session ? {
            Authorization: `Bearer ${session.access_token}`,
          } : {},
        });

        if (!postResponse.ok) {
          throw new Error('Failed to fetch post');
        }

        const postsData = await postResponse.json();
        if (postsData.length === 0) {
          throw new Error('Post not found');
        }

        setPost(postsData[0]);

        // Fetch comments
        await fetchComments();
      } catch (error) {
        console.error('Error fetching post:', error);
        Sentry.captureException(error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, session]);

  const handleCommentSubmit = async () => {
    await fetchComments();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 flex justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="card text-center py-8">
          <p className="text-lg text-gray-600">Post not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <PostCard post={{...post, commentCount: comments.length}} isDetail />
        
        <div className="card mb-4">
          {user ? (
            <CommentForm 
              postId={parseInt(postId as string)} 
              onSubmitSuccess={handleCommentSubmit} 
            />
          ) : (
            <div className="bg-gray-50 p-4 text-center rounded">
              Log in or sign up to leave a comment
            </div>
          )}
          
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Comments ({comments.length})</h3>
            
            {comments.length === 0 ? (
              <div className="text-gray-500 py-4 text-center">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {comments.map((comment) => (
                  <CommentItem 
                    key={comment.id} 
                    comment={comment} 
                    onAddComment={handleCommentSubmit}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;