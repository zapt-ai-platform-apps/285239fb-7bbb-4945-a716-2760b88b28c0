import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';

const AuthPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state, or default to home
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  useEffect(() => {
    // If user is already logged in, redirect to the previous page or home
    if (user && !loading) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  // Don't render anything while checking auth
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-reddit-orange"></div>
      </div>
    );
  }

  // Only render auth UI if user is not logged in
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <div className="text-center mb-6">
            <img 
              src="https://supabase.zapt.ai/storage/v1/render/image/public/icons/c7bd5333-787f-461f-ae9b-22acbc0ed4b0/55145115-0624-472f-96b9-d5d88aae355f.png?width=64&height=64" 
              alt="Reddit Clone"
              className="w-16 h-16 mx-auto mb-2"
            />
            <h1 className="text-2xl font-bold text-gray-900">Reddit Clone</h1>
            <p className="text-gray-600 mt-1">Sign in with ZAPT</p>
            <a 
              href="https://www.zapt.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-reddit-blue hover:underline text-sm"
            >
              Powered by ZAPT.ai
            </a>
          </div>
          
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="light"
            providers={['google', 'facebook', 'apple']}
            magicLink={true}
            view="magic_link"
            redirectTo={window.location.origin + from}
          />
        </div>
      </div>
    );
  }

  return null;
};

export default AuthPage;