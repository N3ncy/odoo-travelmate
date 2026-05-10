import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Demo mode detection
export const isDemoMode = !import.meta.env.VITE_SUPABASE_URL || supabaseUrl === 'https://demo.supabase.co';

// Auth helpers
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// Storage helpers
export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file);
  return { data, error };
};

export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

// Realtime subscription helpers
export const subscribeToChannel = (
  channelName: string,
  table: string,
  filter: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table, filter },
      callback
    )
    .subscribe();
};

export const unsubscribeFromChannel = async (channelName: string) => {
  await supabase.channel(channelName).unsubscribe();
};
