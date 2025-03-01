import CreatePostForm from '../../components/post/CreatePostForm';

const CreatePostPage = () => {
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