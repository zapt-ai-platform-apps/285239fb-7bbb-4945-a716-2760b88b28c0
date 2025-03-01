import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CommunityForm from '@/components/community/CommunityForm';
import { createCommunity } from '@/api/communities';

interface FormData {
  name: string;
  description?: string;
}

const CreateCommunityScreen = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const newCommunity = await createCommunity(formData);
      navigate(`/r/${newCommunity.name}`);
    } catch (err) {
      console.error('Failed to create community:', err);
      setError(err instanceof Error ? err.message : 'Failed to create community');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create a Community</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <CommunityForm 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
      />
    </div>
  );
};

export default CreateCommunityScreen;