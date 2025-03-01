import { Link } from 'react-router-dom';
import { formatStandardDate } from '../../utils/date';
import useAuth from '../../hooks/useAuth';

interface CommunityInfoProps {
  community: {
    id: number;
    name: string;
    description: string;
    createdAt: string | Date;
    createdBy: string;
  };
}

const CommunityInfo = ({ community }: CommunityInfoProps) => {
  const { user } = useAuth();

  return (
    <div className="card mb-4">
      <div className="bg-blue-500 h-12 rounded-t-lg -mt-4 -mx-4 mb-4"></div>
      
      <h1 className="text-xl font-bold mb-2">r/{community.name}</h1>
      
      {community.description && (
        <p className="text-gray-700 mb-4">{community.description}</p>
      )}
      
      <div className="text-sm text-gray-500 mb-2">
        <p>Created {formatStandardDate(community.createdAt)}</p>
      </div>
      
      {user && (
        <Link to="/submit" className="btn-primary block text-center mt-4">
          Create Post
        </Link>
      )}
    </div>
  );
};

export default CommunityInfo;