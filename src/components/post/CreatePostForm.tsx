import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import * as Sentry from '@sentry/browser';

interface FormData {
  title: string;
  content: string;
  subreddit: string;
}

interface SubredditOption {
  id: number;
  name: string;
}

const CreatePostForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subreddits, setSubreddits] = useState<SubredditOption[]>([
    { id: 1, name: 'funny' },
    { id: 2, name: 'AskReddit' },
    { id: 3, name: 'gaming' },
    { id: 4, name: 'news' },
    { id: 5, name: 'worldnews' },
  ]);
  const [createNewSubreddit, setCreateNewSubreddit] = useState(false);
  const [newSubredditName, setNewSubredditName] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Submitting post:', data);
      
      let subredditName = data.subreddit;
      
      // Create a new subreddit if needed
      if (createNewSubreddit && newSubredditName) {
        // Here we would make an API call to create the subreddit
        console.log('Creating new subreddit:', newSubredditName);
        subredditName = newSubredditName;
      }
      
      // TODO: Implement actual API call
      // const response = await fetch('/api/posts', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${user.token}`
      //   },
      //   body: JSON.stringify({
      //     title: data.title,
      //     content: data.content,
      //     subreddit: subredditName,
      //   })
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to create post');
      // }
      
      // For demo purposes, we'll just simulate a successful response
      setTimeout(() => {
        navigate(`/r/${subredditName}`);
      }, 1000);
      
    } catch (error) {
      console.error('Error creating post:', error);
      Sentry.captureException(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          className={`input-field ${errors.title ? 'border-red-500' : ''}`}
          {...register('title', { required: 'Title is required' })}
        />
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Content
        </label>
        <textarea
          id="content"
          rows={6}
          className="input-field"
          {...register('content')}
        ></textarea>
      </div>

      {createNewSubreddit ? (
        <div>
          <label htmlFor="newSubreddit" className="block text-sm font-medium text-gray-700 mb-1">
            New Subreddit Name <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center">
            <span className="text-gray-500 mr-1">r/</span>
            <input
              id="newSubreddit"
              type="text"
              className="input-field"
              value={newSubredditName}
              onChange={(e) => setNewSubredditName(e.target.value)}
              required
            />
          </div>
          <button
            type="button"
            className="mt-2 text-sm text-reddit-blue hover:underline"
            onClick={() => setCreateNewSubreddit(false)}
          >
            Choose existing subreddit instead
          </button>
        </div>
      ) : (
        <div>
          <label htmlFor="subreddit" className="block text-sm font-medium text-gray-700 mb-1">
            Subreddit <span className="text-red-500">*</span>
          </label>
          <select
            id="subreddit"
            className={`input-field ${errors.subreddit ? 'border-red-500' : ''}`}
            {...register('subreddit', { required: 'Subreddit is required' })}
          >
            <option value="">Select a subreddit</option>
            {subreddits.map((subreddit) => (
              <option key={subreddit.id} value={subreddit.name}>
                r/{subreddit.name}
              </option>
            ))}
          </select>
          {errors.subreddit && <p className="mt-1 text-sm text-red-500">{errors.subreddit.message}</p>}
          <button
            type="button"
            className="mt-2 text-sm text-reddit-blue hover:underline"
            onClick={() => setCreateNewSubreddit(true)}
          >
            Create a new subreddit
          </button>
        </div>
      )}

      <div className="pt-4">
        <button
          type="submit"
          className="btn-primary w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
};

export default CreatePostForm;