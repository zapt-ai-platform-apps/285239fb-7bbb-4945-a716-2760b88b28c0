import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../supabaseClient';

const Auth = () => {
  return (
    <div className="w-full max-w-md mx-auto p-6 card">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Sign in with ZAPT</h2>
        <a 
          href="https://www.zapt.ai" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          Learn more about ZAPT
        </a>
      </div>
      <SupabaseAuth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={['google', 'facebook', 'apple']}
        magicLink={true}
        view="magic_link"
      />
    </div>
  );
};

export default Auth;