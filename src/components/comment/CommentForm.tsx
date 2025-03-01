import { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import * as Sentry from '@sentry/browser';

interface CommentFormProps {
  postId: number;
  parentId?: number;
  onSubmitSuccess?: () => void;
}

const CommentForm = ({ postId, parentId, onSubmitSuccess }: CommentFormProps) => {
  const { session } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError('');
    
    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          content,
          postId,
          parentId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to post comment');
      }

      setContent('');
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      Sentry.captureException(error);
      setError(error instanceof Error ? error.message : 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="input min-h-24"
          placeholder="What are your thoughts?"
          rows={3}
        />
        
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            className="btn-primary text-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Comment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;