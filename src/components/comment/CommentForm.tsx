import { useState } from 'react';
import { useForm } from 'react-hook-form';
import useAuth from '../../hooks/useAuth';
import * as Sentry from '@sentry/browser';

interface CommentFormProps {
  postId: number;
  parentId?: number;
  onCommentAdded: (comment: any) => void;
  isReply?: boolean;
}

interface CommentFormData {
  content: string;
}

const CommentForm = ({ postId, parentId, onCommentAdded, isReply = false }: CommentFormProps) => {
  const { session, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CommentFormData>();
  
  const onSubmit = async (data: CommentFormData) => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }

    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log('Submitting comment to API...');
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          content: data.content,
          postId,
          parentId
        })
      });
      
      // Check if response is OK
      if (!response.ok) {
        // Try to get error message from response if it's JSON
        let errorMessage = 'Failed to add comment';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          // If parsing JSON fails, use status text
          errorMessage = `Failed to add comment: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      // Try to parse the JSON response
      let newComment;
      try {
        newComment = await response.json();
        console.log('Comment added successfully:', newComment);
      } catch (jsonError) {
        console.error('Error parsing response:', jsonError);
        throw new Error('Received invalid response format from server');
      }
      
      // Format the comment for display
      const formattedComment = {
        ...newComment,
        userName: user.user_metadata?.full_name || user.email,
        replies: []
      };
      
      // Reset form and notify parent component
      reset();
      onCommentAdded(formattedComment);
    } catch (error) {
      console.error('Error adding comment:', error);
      Sentry.captureException(error);
      setError(error instanceof Error ? error.message : 'Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}
      
      <div className="mb-3">
        <textarea
          className="input-field min-h-[100px]"
          placeholder={isReply ? "What are your thoughts on this comment?" : "What are your thoughts?"}
          {...register('content', { 
            required: 'Comment cannot be empty',
            minLength: { value: 1, message: 'Comment cannot be empty' }
          })}
        />
        {errors.content && (
          <p className="text-red-600 text-sm mt-1">{errors.content.message}</p>
        )}
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="btn-primary cursor-pointer"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Posting...' : isReply ? 'Reply' : 'Comment'}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;