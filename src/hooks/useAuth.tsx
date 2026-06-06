import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile, UserRole } from '../types';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isOfficer: boolean;
  isStaff: boolean;
  role: UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function ensureProfile(userId: string, email: string, fullName: string): Promise<Profile | null> {
  // Try to fetch the profile first (trigger may have already created it)
  const { data: existing } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (existing) return existing;

  // Profile doesn't exist yet — create it manually
  // This handles the race condition where the trigger hasn't fired yet,
  // or if email confirmation is required and the trigger only fires on confirmation
  const { data: created, error } = await supabase
    .from('profiles')
    .insert({ id: userId, email, full_name: fullName, role: 'citizen' })
    .select()
    .single();

  if (error) {
    // Might have been created by the trigger in the meantime — try fetching again
    const { data: retry } = await supabase.from('profiles').select('*').eq('id', userId).single();
    return retry;
  }

  return created;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        const p = await ensureProfile(s.user.id, s.user.email ?? '', s.user.user_metadata?.full_name ?? '');
        setProfile(p);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        const p = await ensureProfile(s.user.id, s.user.email ?? '', s.user.user_metadata?.full_name ?? '');
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signUp(email: string, password: string, fullName: string): Promise<{ error: string | null }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { error: error.message };

    // If the user is immediately confirmed (email confirmation disabled),
    // ensure the profile exists right away
    if (data.user) {
      const p = await ensureProfile(data.user.id, email, fullName);
      setProfile(p);
    }

    return { error: null };
  }

  async function signIn(email: string, password: string): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
  }

  const role = profile?.role ?? null;
  const isAdmin = role === 'admin';
  const isOfficer = role === 'officer';
  const isStaff = isAdmin || isOfficer;

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signUp, signIn, signOut, isAdmin, isOfficer, isStaff, role }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
