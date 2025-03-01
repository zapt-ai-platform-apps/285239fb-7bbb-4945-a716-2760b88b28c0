import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    email?: string;
  };
}

interface AuthContextType {
  session: any | null;
  user: User | null;
  loading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
}

const useAuth = (): AuthContextType => {
  const auth = useContext(AuthContext);
  
  if (!auth) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return auth;
};

export default useAuth;