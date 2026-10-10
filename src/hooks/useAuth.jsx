import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

// Después del redirect de Google Auth, la URL trae el token en el hash
// (#access_token=...). Supabase lo lee para armar la sesión, pero a veces
// deja un "#" vacío colgando en la URL — lo limpiamos a mano.
function cleanAuthHash() {
  if (window.location.hash) {
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }
}

async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email")
    .eq("id", userId)
    .maybeSingle();

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
    // Un solo mecanismo para la sesión (inicial y cambios posteriores).
    // onAuthStateChange ya dispara un evento "INITIAL_SESSION" al montar,
    // con la sesión persistida (y refrescada si hacía falta) — no hace
    // falta un getSession() aparte, que competía con esto y podía pisar
    // el estado si uno de los dos terminaba antes que el otro.
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
      cleanAuthHash();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { user: null, error: error.message };
    }

    const profile = await fetchProfile(data.user.id);
    if (!profile) {
      return { user: null, error: "No pudimos cargar tu perfil. Cerrá sesión y volvé a intentar." };
    }
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
    if (!profile) {
      return { user: null, error: "Creamos tu cuenta pero no pudimos cargar tu perfil. Probá iniciar sesión." };
    }
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

    // Con las confirmaciones de email desactivadas, el cambio se aplica al
    // instante (no llega ningún mail). Supabase expone el email pendiente en
    // user.new_email solo cuando sí hace falta confirmarlo, así el mensaje
    // que ve el usuario refleja lo que realmente pasó.
    let emailChangePending = false;
    if (Object.keys(authUpdates).length > 0) {
      const { data: authData, error: authError } = await supabase.auth.updateUser(authUpdates);
      if (authError) {
        return { error: authError.message };
      }
      if (authUpdates.email) {
        emailChangePending = Boolean(authData?.user?.new_email);
      }
    }

    // Si el email se cambió al instante, sincronizamos profiles.email para
    // que la app (perfil, búsqueda de colaboradores) no muestre el viejo.
    if (authUpdates.email && !emailChangePending) {
      const { error: emailSyncError } = await supabase.from("profiles").update({ email }).eq("id", user.id);
      if (emailSyncError) {
        return { error: emailSyncError.message };
      }
    }

    const profile = await fetchProfile(user.id);
    if (profile) setUser(profile);

    return { error: null, emailChangePending };
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
