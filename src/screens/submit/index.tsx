import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import CreatePostForm from '../../components/post/CreatePostForm';

const CreatePostPage = () => {
  const location = useLocation();

  // Log navigation for debugging purposes
  useEffect(() => {
    console.log('Create Post Page Mounted. Path:', location.pathname);
    console.log('Query params:', location.search);
  }, [location]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create a post</h1>
      <div className="card p-6">
        <CreatePostForm />
      </div>
    </div>
  );
};

export default CreatePostPage;