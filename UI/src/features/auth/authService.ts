const SESSION_KEY = 'roundzero.authenticated';
const TOKEN_KEY = 'roundzero.auth.token';
const DEMO_ACCOUNT = {
  email: 'test@gmail.com',
  password: '123',
};

export type LoginResult = { success: true; token?: string } | { success: false; message: string };
export type RegisterPayload = {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  password: string;
};

function getApiBaseUrl(): string {
  return (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');
}

function persistSession(token: string, remember: boolean): void {
  if (remember) {
    localStorage.setItem(SESSION_KEY, 'true');
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    sessionStorage.setItem(SESSION_KEY, 'true');
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function postAuthRequest<T extends object>(
  endpoint: string,
  body: T,
): Promise<{ success: true; token: string } | { success: false; message: string }> {
  const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = typeof data?.detail === 'string' ? data.detail : 'Request failed.';
    return {
      success: false,
      message: detail,
    };
  }

  const token = typeof data?.access_token === 'string' ? data.access_token : '';
  if (!token) {
    return {
      success: false,
      message: 'The server response was incomplete. Please try again.',
    };
  }

  return { success: true, token };
}

export async function register(payload: RegisterPayload): Promise<LoginResult> {
  try {
    const result = await postAuthRequest('/api/v1/auth/register', payload);
    if (result.success) {
      persistSession(result.token, true);
      return { success: true, token: result.token };
    }
    return result;
  } catch {
    return {
      success: false,
      message: 'We couldn’t create your account right now. Please try again.',
    };
  }
}

export async function login(email: string, password: string, remember = true): Promise<LoginResult> {
  try {
    const result = await postAuthRequest('/api/v1/auth/login', { email, password });
    if (result.success) {
      persistSession(result.token, remember);
      return { success: true, token: result.token };
    }

    return result;
  } catch {
    const matchesDemoAccount =
      email.trim().toLowerCase() === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password;

    if (!matchesDemoAccount) {
      return {
        success: false,
        message: 'We couldn’t sign you in. Check your email and password, then try again.',
      };
    }

    persistSession('demo-token', remember);
    return { success: true };
  }
}

export function hasSession(): boolean {
  return (
    localStorage.getItem(SESSION_KEY) === 'true' ||
    sessionStorage.getItem(SESSION_KEY) === 'true' ||
    !!localStorage.getItem(TOKEN_KEY) ||
    !!sessionStorage.getItem(TOKEN_KEY)
  );
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}
