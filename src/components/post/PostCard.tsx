import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import useAuth from '../../hooks/useAuth';
import * as Sentry from '@sentry/browser';

interface PostCardProps {
  post: {
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
  };
  isDetail?: boolean;
}

const PostCard = ({ post, isDetail = false }: PostCardProps) => {
  const { session, user } = useAuth();
  const [votes, setVotes] = useState({
    upvotes: post.upvotes,
    downvotes: post.downvotes,
    userVote: post.userVote || 0
  });
  const [isVoting, setIsVoting] = useState(false);
  
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

      // Make API call to update vote in the database
      const response = await fetch(`/api/posts/${post.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ value })
      });
      
      if (!response.ok) {
        // Revert changes on error
        setVotes({
          upvotes: post.upvotes,
          downvotes: post.downvotes,
          userVote: post.userVote || 0
        });
        throw new Error('Failed to update vote');
      }
      
    } catch (error) {
      console.error('Error voting:', error);
      Sentry.captureException(error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className={`card mb-4 ${isDetail ? 'pb-4' : ''}`}>
      <div className="flex">
        {/* Vote buttons */}
        <div className="flex flex-col items-center bg-gray-50 p-2 min-w-14">
          <button 
            onClick={() => handleVote(1)}
            className={`vote-button ${votes.userVote === 1 ? 'vote-active' : ''}`}
            disabled={isVoting}
            aria-label="Upvote"
          >
            <ArrowUpIcon className="h-6 w-6" />
          </button>
          
          <span className="text-sm font-medium my-1">{voteScore}</span>
          
          <button 
            onClick={() => handleVote(-1)}
            className={`vote-button ${votes.userVote === -1 ? 'downvote-active' : ''}`}
            disabled={isVoting}
            aria-label="Downvote"
          >
            <ArrowDownIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Post content */}
        <div className="p-3 flex-1">
          <div className="text-xs text-gray-500 mb-1">
            <Link to={`/r/${post.subredditName}`} className="hover:underline font-medium">
              r/{post.subredditName}
            </Link>
            {' • '}
            Posted by{' '}
            <Link to={`/u/${post.userName}`} className="hover:underline">
              u/{post.userName}
            </Link>
            {' • '}
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </div>
          
          {isDetail ? (
            <>
              <h1 className="text-xl font-medium mb-4">{post.title}</h1>
              {post.content && (
                <div className="prose max-w-none mb-4">
                  <p>{post.content}</p>
                </div>
              )}
            </>
          ) : (
            <Link to={`/r/${post.subredditName}/comments/${post.id}`} className="block">
              <h2 className="text-lg font-medium hover:text-reddit-blue mb-2">{post.title}</h2>
              {post.content && (
                <div className="prose max-w-none text-sm text-gray-800 line-clamp-3 mb-3">
                  <p>{post.content}</p>
                </div>
              )}
            </Link>
          )}
          
          {!isDetail && (
            <div className="flex items-center text-gray-500">
              <Link 
                to={`/r/${post.subredditName}/comments/${post.id}`}
                className="flex items-center hover:bg-gray-100 rounded-sm py-1 px-2"
              >
                <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                <span className="text-xs">{post.commentCount} comments</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;