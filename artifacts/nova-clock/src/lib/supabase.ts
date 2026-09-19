type AuthResponse = {
  access_token?: string;
  refresh_token?: string;
  user?: { id: string; email?: string | null; created_at?: string };
  msg?: string;
  error_description?: string;
  message?: string;
};

const baseUrl = String(import.meta.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '');
const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? '');

export const supabaseConfig = {
  configured: Boolean(baseUrl && anonKey),
  url: baseUrl,
};

const sessionKey = 'nova-supabase-session';

function authHeaders(token?: string) {
  return {
    apikey: anonKey,
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function friendlyAuthError(response: AuthResponse) {
  const raw = response.error_description ?? response.msg ?? response.message ?? '';
  if (/captcha/i.test(raw)) {
    return 'Supabase CAPTCHA protection is enabled for this project. Disable it under Authentication → Bot and Abuse Protection, or connect an hCaptcha/Turnstile widget before signing in.';
  }
  if (/invalid login|invalid credentials/i.test(raw)) return 'That email or password does not match.';
  if (/already registered|already exists/i.test(raw)) return 'An account with that email already exists.';
  if (/password/i.test(raw) && /weak|short|characters/i.test(raw)) return 'Use a stronger password with at least 6 characters.';
  if (/email/i.test(raw) && /valid|invalid/i.test(raw)) return 'Enter a valid email address.';
  return raw || 'We could not reach Supabase right now. You can keep using guest mode.';
}

export function getSavedSession(): AuthResponse | null {
  try {
    const raw = window.localStorage.getItem(sessionKey);
    return raw ? (JSON.parse(raw) as AuthResponse) : null;
  } catch {
    return null;
  }
}

function saveSession(response: AuthResponse) {
  if (response.access_token) {
    window.localStorage.setItem(sessionKey, JSON.stringify(response));
  }
}

export async function signInWithPassword(email: string, password: string) {
  if (!supabaseConfig.configured) {
    return { ok: false, message: 'Cloud sign-in is not configured in this build yet. Continue as a guest, or add your Supabase URL and public anon key.' };
  }
  try {
    const response = await fetch(`${baseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = (await response.json()) as AuthResponse;
    if (!response.ok) return { ok: false, message: friendlyAuthError(data) };
    saveSession(data);
    return { ok: true, user: data.user };
  } catch {
    return { ok: false, message: 'We could not reach the sign-in service. Check your connection, then try again or continue as a guest.' };
  }
}

export async function signUpWithPassword(email: string, password: string) {
  if (!supabaseConfig.configured) {
    return { ok: false, message: 'Cloud sign-up is not configured in this build yet. Continue as a guest, or add your Supabase URL and public anon key.' };
  }
  try {
    const response = await fetch(`${baseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = (await response.json()) as AuthResponse;
    if (!response.ok) return { ok: false, message: friendlyAuthError(data) };
    if (data.access_token) saveSession(data);
    return {
      ok: true,
      needsEmailConfirmation: !data.access_token,
      user: data.user,
    };
  } catch {
    return { ok: false, message: 'We could not reach the sign-up service. Check your connection, then try again or continue as a guest.' };
  }
}

export function signOutLocally() {
  window.localStorage.removeItem(sessionKey);
}