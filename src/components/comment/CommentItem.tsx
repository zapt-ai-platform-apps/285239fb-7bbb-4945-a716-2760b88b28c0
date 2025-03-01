import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import useAuth from '../../hooks/useAuth';
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

interface CommentItemProps {
  comment: Comment;
}

const CommentItem = ({ comment }: CommentItemProps) => {
  const { session, user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [votes, setVotes] = useState({
    upvotes: comment.upvotes,
    downvotes: comment.downvotes,
    userVote: comment.userVote || 0
  });
  const [isVoting, setIsVoting] = useState(false);
  const [replies, setReplies] = useState(comment.replies || []);

  const voteScore = votes.upvotes - votes.downvotes;

  const handleVote = async (value: number) => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }

    if (isVoting) return;

    // Prevent duplicate votes
    if (votes.userVote === value) {
      value = 0; // Reset vote if clicking the same button
    }

    try {
      setIsVoting(true);
      
      // Optimistic update
      const oldUserVote = votes.userVote;
      let newUpvotes = votes.upvotes;
      let newDownvotes = votes.downvotes;
      
      // Remove old vote if exists
      if (oldUserVote === 1) newUpvotes--;
      if (oldUserVote === -1) newDownvotes--;
      
      // Add new vote
      if (value === 1) newUpvotes++;
      if (value === -1) newDownvotes++;
      
      setVotes({
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        userVote: value
      });

      // TODO: Implement actual API call
      const response = await fetch(`/api/comments/${comment.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ value })
      });
      
      if (!response.ok) {
        // Revert changes on error
        throw new Error('Failed to update vote');
      }
      
    } catch (error) {
      console.error('Error voting on comment:', error);
      Sentry.captureException(error);
      
      // Revert on error
      setVotes({
        upvotes: comment.upvotes,
        downvotes: comment.downvotes,
        userVote: comment.userVote || 0
      });
    } finally {
      setIsVoting(false);
    }
  };

  const handleAddReply = (newReply: Comment) => {
    setReplies([...replies, newReply]);
    setIsReplying(false);
    setShowReplies(true);
  };

  return (
    <div className="pt-2">
      <div className="flex">
        <div className="flex flex-col items-center mr-2">
          <button 
            onClick={() => handleVote(1)}
            className={`vote-button ${votes.userVote === 1 ? 'vote-active' : ''}`}
            disabled={isVoting}
            aria-label="Upvote"
          >
            <ArrowUpIcon className="h-4 w-4" />
          </button>
          
          <span className="text-xs font-medium my-1">{voteScore}</span>
          
          <button 
            onClick={() => handleVote(-1)}
            className={`vote-button ${votes.userVote === -1 ? 'downvote-active' : ''}`}
            disabled={isVoting}
            aria-label="Downvote"
          >
            <ArrowDownIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1">
          <div className="text-xs text-gray-500 mb-1">
            <Link to={`/u/${comment.userName}`} className="font-medium hover:underline">
              u/{comment.userName}
            </Link>
            {' • '}
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </div>
          
          <div className="prose prose-sm max-w-none mb-2">
            <p>{comment.content}</p>
          </div>
          
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <button 
              onClick={() => setIsReplying(!isReplying)}
              className="hover:text-reddit-blue mr-3"
            >
              {isReplying ? 'Cancel' : 'Reply'}
            </button>
            
            {replies.length > 0 && (
              <button 
                onClick={() => setShowReplies(!showReplies)}
                className="hover:text-reddit-blue"
              >
                {showReplies ? 'Hide replies' : `Show ${replies.length} replies`}
              </button>
            )}
          </div>
          
          {isReplying && (
            <div className="mt-2 mb-3">
              <CommentForm 
                postId={0} // Not used for replies
                parentId={comment.id}
                onCommentAdded={handleAddReply}
                isReply
              />
            </div>
          )}
          
          {showReplies && replies.length > 0 && (
            <div className="ml-5 pl-4 border-l border-gray-200">
              {replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;