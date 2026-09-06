import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { user: null, error: error.message };
    }

    const profile = await fetchProfile(data.user.id);
    setUser(profile);
    return { user: profile, error: null };
  }

  async function loginWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      return { error: error.message };
    }
    return { error: null };
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  async function register(name, email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.session) {
      return { user: null, error: null, needsEmailConfirmation: true };
    }

    const profile = await fetchProfile(data.user.id);
    setUser(profile);
    return { user: profile, error: null };
  }

  async function updateProfile({ name, email, password }) {
    if (name && name !== user?.name) {
      const { error: profileError } = await supabase.from("profiles").update({ name }).eq("id", user.id);
      if (profileError) {
        return { error: profileError.message };
      }
    }

    const authUpdates = {};
    if (email && email !== user?.email) authUpdates.email = email;
    if (password) authUpdates.password = password;

    if (Object.keys(authUpdates).length > 0) {
      const { error: authError } = await supabase.auth.updateUser(authUpdates);
      if (authError) {
        return { error: authError.message };
      }
    }

    const profile = await fetchProfile(user.id);
    setUser(profile);

    return {
      error: null,
      emailChangePending: Boolean(authUpdates.email),
    };
  }

  function getInitials() {
    if (!user?.name) return "";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  const value = { user, loading, login, loginWithGoogle, logout, register, updateProfile, getInitials };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return ctx;
}
