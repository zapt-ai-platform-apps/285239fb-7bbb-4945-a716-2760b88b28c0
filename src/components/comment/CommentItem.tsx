import { useState } from 'react';
import { formatRelativeTime } from '../../utils/date';
import { FaArrowUp, FaArrowDown, FaReply } from 'react-icons/fa';
import CommentForm from './CommentForm';
import useAuth from '../../hooks/useAuth';
import * as Sentry from '@sentry/browser';

interface CommentItemProps {
  comment: {
    id: number;
    content: string;
    userId: string;
    postId: number;
    parentId: number | null;
    createdAt: string | Date;
    updatedAt: string | Date;
    voteScore: number;
    userVote: number | null;
    user?: {
      email: string;
    };
    replies?: CommentItemProps['comment'][];
  };
  onAddComment?: () => void;
}

const CommentItem = ({ comment, onAddComment }: CommentItemProps) => {
  const { user, session } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [voteScore, setVoteScore] = useState(comment.voteScore);
  const [userVote, setUserVote] = useState(comment.userVote);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (value: number) => {
    if (!user || !session) {
      // Redirect to login or show login modal
      return;
    }

    if (isVoting) return;
    setIsVoting(true);

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          commentId: comment.id,
          value,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to vote');
      }

      // If voting the same way, remove the vote
      if (userVote === value) {
        setVoteScore(voteScore - value);
        setUserVote(null);
      } 
      // If changing vote, update score accordingly
      else if (userVote !== null) {
        setVoteScore(voteScore - userVote + value);
        setUserVote(value);
      } 
      // If new vote
      else {
        setVoteScore(voteScore + value);
        setUserVote(value);
      }
    } catch (error) {
      console.error('Error voting:', error);
      Sentry.captureException(error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleReplySubmit = () => {
    setIsReplying(false);
    if (onAddComment) {
      onAddComment();
    }
  };

  // Get display name for comment author
  const authorName = comment.user?.email?.split('@')[0] || 'Anonymous';

  return (
    <div className="mt-3">
      <div className="flex">
        {/* Vote buttons */}
        <div className="flex flex-col items-center mr-2">
          <button 
            onClick={() => handleVote(1)}
            disabled={isVoting}
            className={`cursor-pointer p-1 rounded ${userVote === 1 ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'}`}
            aria-label="Upvote"
          >
            <FaArrowUp size={16} />
          </button>
          <span className="text-xs font-medium my-1">{voteScore}</span>
          <button 
            onClick={() => handleVote(-1)}
            disabled={isVoting}
            className={`cursor-pointer p-1 rounded ${userVote === -1 ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'}`}
            aria-label="Downvote"
          >
            <FaArrowDown size={16} />
          </button>
        </div>

        {/* Comment content */}
        <div className="flex-1">
          <div className="text-xs text-gray-500 mb-1">
            <span className="font-medium">{authorName}</span>
            <span className="mx-1">•</span>
            {formatRelativeTime(comment.createdAt)}
          </div>
          
          <div className="text-gray-800 mb-2">
            {comment.content}
          </div>

          <div className="flex items-center text-xs text-gray-500 mb-2">
            <button 
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center hover:bg-gray-100 rounded p-1 cursor-pointer"
            >
              <FaReply className="mr-1" />
              <span>Reply</span>
            </button>
          </div>

          {isReplying && (
            <div className="ml-2 mt-2 border-l-2 border-gray-200 pl-3">
              <CommentForm 
                postId={comment.postId} 
                parentId={comment.id} 
                onSubmitSuccess={handleReplySubmit}
              />
            </div>
          )}

          {/* Render replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-2 border-l-2 border-gray-200 pl-3">
              {comment.replies.map((reply) => (
                <CommentItem 
                  key={reply.id} 
                  comment={reply} 
                  onAddComment={onAddComment}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;