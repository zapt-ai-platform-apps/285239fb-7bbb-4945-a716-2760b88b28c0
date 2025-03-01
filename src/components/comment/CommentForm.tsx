import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as Sentry from '@sentry/browser';

interface CommentFormProps {
  postId: number;
  parentId?: number;
  onCommentAdded: (comment: any) => void;
  isReply?: boolean;
}

const CommentForm = ({ postId, parentId, onCommentAdded, isReply = false }: CommentFormProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      window.location.href = '/auth';
      return;
    }
    
    if (!content.trim()) return;
    
    try {
      setIsSubmitting(true);
      
      // TODO: Implement actual API call
      // const response = await fetch('/api/comments', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${user.token}`
      //   },
      //   body: JSON.stringify({
      //     content,
      //     postId,
      //     parentId
      //   })
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to add comment');
      // }
      
      // const data = await response.json();
      
      // For demo purposes, we'll simulate a successful response
      const newComment = {
        id: Math.floor(Math.random() * 10000),
        content,
        createdAt: new Date().toISOString(),
        userName: user.user_metadata?.name || user.email?.split('@')[0] || 'user',
        upvotes: 0,
        downvotes: 0,
        userVote: 0,
        replies: []
      };
      
      // Add small delay to simulate API call
      setTimeout(() => {
        onCommentAdded(newComment);
        setContent('');
        setIsSubmitting(false);
      }, 500);
      
    } catch (error) {
      console.error('Error adding comment:', error);
      Sentry.captureException(error);
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-gray-50 p-4 rounded-md text-center">
        <p className="text-gray-700 mb-2">Log in or sign up to leave a comment</p>
        <a 
          href="/auth" 
          className="btn-primary inline-block"
        >
          Log In / Sign Up
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="mb-3">
        <textarea
          className="input-field min-h-24"
          placeholder={isReply ? "What are your thoughts on this comment?" : "What are your thoughts?"}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        ></textarea>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? 'Posting...' : isReply ? 'Reply' : 'Comment'}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;