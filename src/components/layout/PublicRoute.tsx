import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import React from 'react';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectAuthenticated?: boolean;
}

const PublicRoute = ({ children, redirectAuthenticated = false }: PublicRouteProps) => {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Redirect to home if authenticated and redirectAuthenticated is true
  if (redirectAuthenticated && user) {
    return <Navigate to="/" replace />;
  }

  // Render the public content
  return <>{children}</>;
};

export default PublicRoute;