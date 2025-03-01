import React from 'react';
import { useForm } from 'react-hook-form';

interface CommunityFormProps {
  onSubmit: (data: FormData) => void;
  isSubmitting: boolean;
  initialData?: FormData;
}

interface FormData {
  name: string;
  description?: string;
}

const CommunityForm: React.FC<CommunityFormProps> = ({ 
  onSubmit, 
  isSubmitting, 
  initialData 
}) => {
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<FormData>({
    defaultValues: initialData || {
      name: '',
      description: ''
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Community Name
        </label>
        <input
          id="name"
          type="text"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm box-border"
          placeholder="community_name"
          {...register('name', { 
            required: 'Community name is required',
            pattern: {
              value: /^[a-zA-Z0-9_]+$/,
              message: 'Only letters, numbers, and underscores are allowed'
            }
          })}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description (optional)
        </label>
        <textarea
          id="description"
          rows={4}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm box-border"
          placeholder="Community description..."
          {...register('description')}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 cursor-pointer
          ${isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
      >
        {isSubmitting ? (
          <div className="flex items-center">
            <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
            Creating...
          </div>
        ) : (
          'Create Community'
        )}
      </button>
    </form>
  );
};

export default CommunityForm;