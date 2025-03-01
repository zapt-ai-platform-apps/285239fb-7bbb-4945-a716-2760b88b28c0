import { Link } from 'react-router-dom';
import { formatRelativeTime } from '../../utils/date';
import { FaArrowUp, FaArrowDown, FaCommentAlt } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import { useState } from 'react';
import { supabase } from '../../supabaseClient';
import * as Sentry from '@sentry/browser';

interface PostCardProps {
  post: {
    id: number;
    title: string;
    content: string;
    communityId: number;
    communityName: string;
    userId: string;
    createdAt: string | Date;
    voteScore: number;
    userVote: number | null;
    commentCount?: number;
  };
  isDetail?: boolean;
}

const PostCard = ({ post, isDetail = false }: PostCardProps) => {
  const { user, session } = useAuth();
  const [voteScore, setVoteScore] = useState(post.voteScore);
  const [userVote, setUserVote] = useState(post.userVote);
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
          postId: post.id,
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

  return (
    <div className="card mb-4">
      <div className="flex">
        {/* Vote buttons */}
        <div className="flex flex-col items-center mr-4 pt-2">
          <button 
            onClick={() => handleVote(1)}
            disabled={isVoting}
            className={`cursor-pointer p-1 rounded ${userVote === 1 ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'}`}
            aria-label="Upvote"
          >
            <FaArrowUp size={20} />
          </button>
          <span className="my-1 font-medium">{voteScore}</span>
          <button 
            onClick={() => handleVote(-1)}
            disabled={isVoting}
            className={`cursor-pointer p-1 rounded ${userVote === -1 ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'}`}
            aria-label="Downvote"
          >
            <FaArrowDown size={20} />
          </button>
        </div>

        {/* Post content */}
        <div className="flex-1">
          <div className="text-sm text-gray-500 mb-1">
            <Link to={`/r/${post.communityName}`} className="hover:underline">
              r/{post.communityName}
            </Link>
            <span className="mx-1">•</span>
            Posted {formatRelativeTime(post.createdAt)}
          </div>
          
          {isDetail ? (
            <h1 className="text-xl font-medium mb-2">{post.title}</h1>
          ) : (
            <Link to={`/post/${post.id}`} className="block">
              <h2 className="text-xl font-medium mb-2 hover:text-blue-600">{post.title}</h2>
            </Link>
          )}
          
          {(isDetail || post.content) && (
            <div className={`text-gray-800 mb-3 ${isDetail ? '' : 'line-clamp-3'}`}>
              {post.content}
            </div>
          )}

          <div className="flex items-center text-gray-500">
            <Link to={`/post/${post.id}`} className="flex items-center hover:bg-gray-100 rounded p-1">
              <FaCommentAlt className="mr-1" />
              <span>{post.commentCount || 0} comments</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;