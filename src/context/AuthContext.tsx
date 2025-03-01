import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { supabase, recordLogin } from '../supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import * as Sentry from '@sentry/browser';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }
        
        setSession(data.session);
        setUser(data.session?.user || null);
        
        // Record login
        if (data.session?.user?.email) {
          try {
            await recordLogin(data.session.user.email, import.meta.env.VITE_PUBLIC_APP_ENV);
            console.log('Login recorded successfully');
          } catch (error) {
            console.error('Failed to record login:', error);
            Sentry.captureException(error);
          }
        }
      } catch (error) {
        console.error('Error getting session:', error);
        Sentry.captureException(error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        setUser(currentSession?.user || null);
        
        if (event === 'SIGNED_IN' && currentSession?.user?.email) {
          try {
            await recordLogin(currentSession.user.email, import.meta.env.VITE_PUBLIC_APP_ENV);
            console.log('Login recorded on auth state change');
          } catch (error) {
            console.error('Failed to record login on auth state change:', error);
            Sentry.captureException(error);
          }
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      Sentry.captureException(error);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};