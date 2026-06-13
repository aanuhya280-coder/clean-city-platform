import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile, UserRole } from '../types';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null; autoConfirmed: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<{ error: string | null }>;
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
    // Seed initial state from getSession, then immediately release the loading gate.
    // Profile fetch is non-blocking so the app renders even if the DB is slow.
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
      if (s?.user) {
        ensureProfile(s.user.id, s.user.email ?? '', s.user.user_metadata?.full_name ?? '')
          .then(setProfile);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (!s?.user) {
        setProfile(null);
        return;
      }
      // Defer Supabase DB call to avoid the known v2 deadlock where calling
      // supabase.from() inside onAuthStateChange blocks the auth lock indefinitely.
      setTimeout(() => {
        ensureProfile(s.user.id, s.user.email ?? '', s.user.user_metadata?.full_name ?? '')
          .then(setProfile);
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signUp(email: string, password: string, fullName: string): Promise<{ error: string | null; autoConfirmed: boolean }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    if (error) return { error: error.message, autoConfirmed: false };

    // data.session is non-null when email confirmation is disabled in Supabase —
    // the user is immediately active and we can skip the "check your email" screen.
    const autoConfirmed = !!data.session;

    if (data.user) {
      const p = await ensureProfile(data.user.id, email, fullName);
      setProfile(p);
    }

    return { error: null, autoConfirmed };
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

  async function resendConfirmation(email: string): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) return { error: error.message };
    return { error: null };
  }

  const role = profile?.role ?? null;
  const isAdmin = role === 'admin';
  const isOfficer = role === 'officer';
  const isStaff = isAdmin || isOfficer;

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signUp, signIn, signOut, resendConfirmation, isAdmin, isOfficer, isStaff, role }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
