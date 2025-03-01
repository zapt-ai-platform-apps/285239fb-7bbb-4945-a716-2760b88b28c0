import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, recordLogin } from '../supabaseClient';
import * as Sentry from '@sentry/browser';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    email?: string;
  };
}

export interface AuthContextType {
  session: any | null;
  user: User | null;
  loading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  error: null,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function getSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        setSession(data.session);
        setUser(data.session?.user || null);
        
        if (data.session?.user?.email) {
          try {
            await recordLogin(data.session.user.email, import.meta.env.VITE_PUBLIC_APP_ENV);
            console.log('Login recorded successfully');
          } catch (loginError) {
            console.error('Failed to record login:', loginError);
            Sentry.captureException(loginError);
          }
        }
      } catch (error) {
        console.error('Error fetching session:', error);
        Sentry.captureException(error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    }

    getSession();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth state changed: ${event}`);
        setSession(session);
        setUser(session?.user || null);
        
        if (event === 'SIGNED_IN' && session?.user?.email) {
          try {
            await recordLogin(session.user.email, import.meta.env.VITE_PUBLIC_APP_ENV);
          } catch (error) {
            console.error('Failed to record login:', error);
            Sentry.captureException(error);
          }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      Sentry.captureException(error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, error, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};