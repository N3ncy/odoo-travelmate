import { useEffect, useState, useCallback } from 'react';
import { supabase, isDemoMode } from '@/lib/supabase';
import { useAuthStore } from '@/store';
import { profileService } from '@/services/api';
import { demoUserProfile } from '@/services/mockData';
import toast from 'react-hot-toast';

export function useAuth() {
  const { user, profile, isAuthenticated, isLoading, hasLoggedOut, setUser, setProfile, setLoading, logout } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDemoMode) {
      // Only auto-login if user hasn't explicitly logged out
      if (!hasLoggedOut) {
        setUser({ id: 'demo-user', email: 'demo@Traveloop.com' });
        setProfile(demoUserProfile);
      }
      setLoading(false);
      return;
    }

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email! });
        profileService.getProfile(session.user.id).then((profile) => {
          if (profile) setProfile(profile);
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser({ id: session.user.id, email: session.user.email! });
        const profile = await profileService.getProfile(session.user.id);
        if (profile) setProfile(profile);
      } else if (event === 'SIGNED_OUT') {
        logout();
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setProfile, setLoading, logout]);

  const signUp = useCallback(async (email: string, password: string, phone?: string) => {
    try {
      setError(null);
      if (isDemoMode) {
        setUser({ id: 'demo-user', email });
        setProfile(demoUserProfile);
        toast.success('Welcome to Traveloop!');
        return { success: true };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { phone } },
      });

      if (error) throw error;
      toast.success('Account created! Please check your email to verify.');
      return { success: true, data };
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
      return { success: false, error: err.message };
    }
  }, [setUser, setProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      if (isDemoMode) {
        setUser({ id: 'demo-user', email });
        setProfile(demoUserProfile);
        toast.success('Welcome back!');
        return { success: true };
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Welcome back!');
      return { success: true, data };
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
      return { success: false, error: err.message };
    }
  }, [setUser, setProfile]);

  const signInWithPhone = useCallback(async (phone: string) => {
    try {
      setError(null);
      if (isDemoMode) {
        toast.success('OTP sent! (Demo mode)');
        return { success: true };
      }

      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      toast.success('OTP sent to your phone!');
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const verifyPhoneOTP = useCallback(async (phone: string, token: string) => {
    try {
      setError(null);
      if (isDemoMode) {
        setUser({ id: 'demo-user', email: 'demo@Traveloop.com' });
        setProfile(demoUserProfile);
        toast.success('Phone verified!');
        return { success: true };
      }

      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });
      if (error) throw error;
      toast.success('Phone verified!');
      return { success: true, data };
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
      return { success: false, error: err.message };
    }
  }, [setUser, setProfile]);

  const signOut = useCallback(async () => {
    try {
      if (isDemoMode) {
        logout();
        toast.success('Logged out');
        return { success: true };
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      logout();
      toast.success('Logged out successfully');
      return { success: true };
    } catch (err: any) {
      toast.error(err.message);
      return { success: false, error: err.message };
    }
  }, [logout]);

  const updateProfile = useCallback(async (updates: any) => {
    try {
      if (!user) throw new Error('Not authenticated');
      const updated = await profileService.updateProfile(user.id, updates);
      setProfile(updated);
      toast.success('Profile updated!');
      return { success: true, profile: updated };
    } catch (err: any) {
      toast.error(err.message);
      return { success: false, error: err.message };
    }
  }, [user, setProfile]);

  return {
    user,
    profile,
    isAuthenticated,
    isLoading,
    error,
    signUp,
    signIn,
    signInWithPhone,
    verifyPhoneOTP,
    signOut,
    updateProfile,
  };
}
