import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import * as Sentry from '@sentry/browser';

const CommunityForm = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError('');
    
    if (!name.trim()) {
      setError('Community name is required');
      return;
    }

    // Validate name format
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      setError('Community name can only contain letters, numbers, and underscores');
      return;
    }

    if (name.length < 3) {
      setError('Community name must be at least 3 characters');
      return;
    }

    if (name.length > 21) {
      setError('Community name must be less than 22 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/communities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          name,
          description,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create community');
      }

      const data = await response.json();
      // Redirect to the community
      navigate(`/r/${data.name}`);
    } catch (error) {
      console.error('Error creating community:', error);
      Sentry.captureException(error);
      setError(error instanceof Error ? error.message : 'Failed to create community');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Create a community</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
              r/
            </span>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input rounded-l-none"
              placeholder="community_name"
              required
              maxLength={21}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Community names must be 3-21 characters, and can only contain letters, numbers, and underscores.
          </p>
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input"
            placeholder="Description"
            rows={4}
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary mr-2"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Community'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommunityForm;