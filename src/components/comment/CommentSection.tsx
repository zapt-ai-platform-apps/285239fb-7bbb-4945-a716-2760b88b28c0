import { useState, useEffect } from 'react';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import * as Sentry from '@sentry/browser';

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  userName: string;
  upvotes: number;
  downvotes: number;
  userVote?: number;
  replies?: Comment[];
}

interface CommentSectionProps {
  postId: number;
}

const CommentSection = ({ postId }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        // TODO: Implement actual API call when ready
        // const response = await fetch(`/api/posts/${postId}/comments`);
        // if (!response.ok) {
        //   throw new Error('Failed to fetch comments');
        // }
        // const data = await response.json();
        // setComments(data);

        // Mock data for development
        setTimeout(() => {
          setComments([
            {
              id: 1,
              content: "This is really interesting, I've been thinking about this topic for a while.",
              createdAt: new Date(Date.now() - 3600000).toISOString(),
              userName: "reddit_user1",
              upvotes: 15,
              downvotes: 2,
              replies: [
                {
                  id: 3,
                  content: "I agree with you completely!",
                  createdAt: new Date(Date.now() - 1800000).toISOString(),
                  userName: "comment_enthusiast",
                  upvotes: 5,
                  downvotes: 0,
                }
              ]
            },
            {
              id: 2,
              content: "I have a different perspective on this. Have you considered...",
              createdAt: new Date(Date.now() - 7200000).toISOString(),
              userName: "different_opinion",
              upvotes: 8,
              downvotes: 4,
            }
          ]);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching comments:', error);
        Sentry.captureException(error);
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const addComment = (newComment: Comment) => {
    setComments([newComment, ...comments]);
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Comments</h3>
      
      <CommentForm postId={postId} onCommentAdded={addComment} />
      
      <div className="mt-6">
        {loading ? (
          <div className="animate-pulse space-y-4">
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
        ) : comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No comments yet. Be the first to share your thoughts!
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;