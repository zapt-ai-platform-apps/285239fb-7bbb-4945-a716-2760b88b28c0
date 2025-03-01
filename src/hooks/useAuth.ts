import { useContext } from 'react';
import { AuthContext, AuthContextType } from '../context/AuthContext';

const useAuth = (): AuthContextType => {
  const auth = useContext(AuthContext);
  
  if (!auth) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return auth;
};

export default useAuth;