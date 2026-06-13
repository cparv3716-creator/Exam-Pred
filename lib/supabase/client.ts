"use client";

type AuthRequestResult<T> = { ok: true; data: T } | { ok: false; error: string; code?: string };
type SupabaseStyleResult<T> = { data: T; error: null } | { data: null; error: Error };

async function authRequest<T>(path: string, body: Record<string, unknown>) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => null)) as T & { error?: string; code?: string };

  if (!response.ok) {
    return { ok: false, error: data?.error ?? "Request failed.", code: data?.code } satisfies AuthRequestResult<T>;
  }

  return { ok: true, data } satisfies AuthRequestResult<T>;
}

async function supabaseStyleRequest<T>(path: string, body: Record<string, unknown>): Promise<SupabaseStyleResult<T>> {
  const result = await authRequest<T>(path, body);

  if (!result.ok) {
    return { data: null, error: new Error(result.error) };
  }

  return { data: result.data, error: null };
}

export const supabase = {
  auth: {
    resetPasswordForEmail(email: string) {
      return supabaseStyleRequest<{ message: string }>("/api/auth/forgot-password", { email });
    },
    verifyOtp({ email, token, type }: { email: string; token: string; type: "recovery" }) {
      return supabaseStyleRequest<{ message: string }>("/api/auth/verify-recovery-otp", { email, token, type });
    },
    updateUser({ password }: { password: string }) {
      return supabaseStyleRequest<{ message: string }>("/api/auth/reset-password", { password });
    },
  },
};

export function signInWithPassword(email: string, password: string) {
  return authRequest<{ next?: string }>("/api/auth/login", { email, password });
}

export function signUpWithPassword(email: string, password: string, fullName: string) {
  return authRequest<{ message: string; hasSession?: boolean }>("/api/auth/signup", { email, password, fullName });
}

export function resetPasswordForEmail(email: string) {
  return authRequest<{ message: string }>("/api/auth/forgot-password", { email });
}

export function requestPasswordReset(email: string) {
  return resetPasswordForEmail(email);
}

export function updateUserPassword(password: string) {
  return authRequest<{ message: string }>("/api/auth/reset-password", { password });
}

export function updatePassword(password: string) {
  return updateUserPassword(password);
}

export function storeAuthSession(accessToken: string, refreshToken?: string) {
  return authRequest<{ message: string }>("/api/auth/session", { accessToken, refreshToken });
}
