import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuth from '../../hooks/useAuth';
import * as Sentry from '@sentry/browser';

interface Community {
  id: number;
  name: string;
}

interface FormData {
  title: string;
  content: string;
  communityId: string;
}

const CreatePostForm = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(true);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>();
  const selectedCommunityId = watch('communityId');
  
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        console.log('Fetching communities...');
        setIsLoadingCommunities(true);
        
        const response = await fetch('/api/communities', {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch communities');
        }
        
        const data = await response.json();
        console.log('Communities loaded:', data.length);
        setCommunities(data);
        
        // If there's only one community, pre-select it
        if (data.length === 1) {
          setValue('communityId', String(data[0].id));
        }
      } catch (error) {
        console.error('Error fetching communities:', error);
        Sentry.captureException(error);
        setError('Failed to load communities. Please try again.');
      } finally {
        setIsLoadingCommunities(false);
      }
    };
    
    fetchCommunities();
  }, [session, setValue]);
  
  const onSubmit = async (data: FormData) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log('Submitting post to API...', data);
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          communityId: parseInt(data.communityId)
        }),
      });
      
      // First check if the response is OK
      if (!response.ok) {
        // Try to get error message from response if it's JSON
        let errorMessage = 'Failed to create post';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          // If parsing JSON fails, use status text
          errorMessage = `Failed to create post: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      // Now try to parse the JSON response
      let result;
      try {
        result = await response.json();
        console.log('Post created successfully:', result);
      } catch (jsonError) {
        console.error('Error parsing response:', jsonError);
        throw new Error('Received invalid response format from server');
      }
      
      // Get the community name
      const community = communities.find(c => c.id === parseInt(data.communityId));
      
      // Successfully created post, redirect to it
      navigate(`/r/${community?.name}/comments/${result.id}`);
    } catch (error) {
      console.error('Error creating post:', error);
      Sentry.captureException(error);
      setError(error instanceof Error ? error.message : 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoadingCommunities) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="w-8 h-8 border-4 border-t-transparent border-reddit-orange rounded-full animate-spin mr-2"></div>
        <p>Loading communities...</p>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {communities.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          <p className="mb-2">You need to create or join a community before posting.</p>
          <button
            type="button"
            className="btn-primary cursor-pointer"
            onClick={() => navigate('/create-community')}
          >
            Create a Community
          </button>
        </div>
      ) : (
        <div className="mb-4">
          <label htmlFor="communityId" className="block text-sm font-medium text-gray-700 mb-1">
            Community
          </label>
          <select
            id="communityId"
            className="input-field cursor-pointer"
            {...register('communityId', { required: 'Please select a community' })}
          >
            <option value="">Select a community</option>
            {communities.map((community) => (
              <option key={community.id} value={community.id}>
                r/{community.name}
              </option>
            ))}
          </select>
          {errors.communityId && (
            <p className="text-red-600 text-sm mt-1">{errors.communityId.message}</p>
          )}
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          id="title"
          type="text"
          className="input-field"
          placeholder="Title"
          {...register('title', { required: 'Title is required' })}
        />
        {errors.title && (
          <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>
      
      <div className="mb-4">
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Content
        </label>
        <textarea
          id="content"
          className="input-field min-h-[150px]"
          placeholder="Text (optional)"
          {...register('content')}
        />
      </div>
      
      <button
        type="submit"
        className="btn-primary w-full cursor-pointer"
        disabled={isSubmitting || communities.length === 0 || !selectedCommunityId}
      >
        {isSubmitting ? 'Posting...' : 'Post'}
      </button>
    </form>
  );
};

export default CreatePostForm;