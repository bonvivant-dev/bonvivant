"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Create client-side supabase instance
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Session error:", error);
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await checkAdminStatus(session.user);
        } else {
          setIsAdmin(false);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await checkAdminStatus(session.user);
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const checkAdminStatus = async (user: User) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Profile query error:", error);
        // Try to create profile if it doesn't exist
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert([
            {
              id: user.id,
              email: user.email || "",
              role: "user",
            },
          ])
          .select()
          .single();

        if (!insertError && newProfile) {
          setIsAdmin(newProfile.role === "admin");
        } else {
          setIsAdmin(false);
        }
      } else if (profile) {
        setIsAdmin(profile.role === "admin");
      } else {
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert([
            {
              id: user.id,
              email: user.email || "",
              role: "user",
            },
          ])
          .select()
          .single();

        if (!insertError && newProfile) {
          setIsAdmin(newProfile.role === "admin");
        } else {
          setIsAdmin(false);
        }
      }
    } catch (error) {
      console.error("Error in checkAdminStatus:", error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Google sign in error:", error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      console.error("Email sign in error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);
      setIsAdmin(false);
    } catch (error) {
      console.error("Sign out error:", error);
      // Clear state even if signOut fails
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signOut,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
