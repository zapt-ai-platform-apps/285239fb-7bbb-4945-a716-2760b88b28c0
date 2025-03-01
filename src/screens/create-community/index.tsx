import CommunityForm from '../../components/community/CommunityForm';
import ProtectedRoute from '../../components/layout/ProtectedRoute';

const CreateCommunity = () => {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-8">Create a Community</h1>
        <CommunityForm />
      </div>
    </ProtectedRoute>
  );
};

export default CreateCommunity;