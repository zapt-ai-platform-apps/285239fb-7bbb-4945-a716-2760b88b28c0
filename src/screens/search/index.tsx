import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PostCard from '../../components/post/PostCard';
import useAuth from '../../hooks/useAuth';
import * as Sentry from '@sentry/browser';

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
}

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { session } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const searchPosts = async () => {
      if (!query) {
        setPosts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/posts?search=${encodeURIComponent(query)}`, {
          headers: session ? {
            Authorization: `Bearer ${session.access_token}`,
          } : {},
        });

        if (!response.ok) {
          throw new Error('Failed to search posts');
        }

        const data = await response.json();
        // Filter posts that match the search query in title or content
        const filteredPosts = data.filter((post: Post) => 
          post.title.toLowerCase().includes(query.toLowerCase()) || 
          (post.content && post.content.toLowerCase().includes(query.toLowerCase()))
        );
        setPosts(filteredPosts);
      } catch (error) {
        console.error('Error searching posts:', error);
        Sentry.captureException(error);
        setError('Failed to search. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    searchPosts();
  }, [query, session]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          Search results for: <span className="text-blue-600">"{query}"</span>
        </h1>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : posts.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-lg text-gray-600 mb-4">No results found for "{query}"</p>
            <Link to="/" className="btn-primary inline-block">
              Back to Home
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-500 mb-4">{posts.length} result(s) found</p>
            {posts.map((post) => <PostCard key={post.id} post={post} />)}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;