const SESSION_KEY = 'roundzero.authenticated'

const DEMO_ACCOUNT = {
  email: 'test@gmail.com',
  password: '123',
}

export type LoginResult =
  | { success: true }
  | { success: false; message: string }

export function login(email: string, password: string, remember = true): LoginResult {
  const matchesDemoAccount = email.trim().toLowerCase() === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password

  if (!matchesDemoAccount) {
    return { success: false, message: 'We couldn’t sign you in. Check your email and password, then try again.' }
  }

  if (remember) {
    localStorage.setItem(SESSION_KEY, 'true')
    sessionStorage.removeItem(SESSION_KEY)
  } else {
    sessionStorage.setItem(SESSION_KEY, 'true')
    localStorage.removeItem(SESSION_KEY)
  }
  return { success: true }
}

export function hasSession(): boolean {
  return localStorage.getItem(SESSION_KEY) === 'true' || sessionStorage.getItem(SESSION_KEY) === 'true'
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(SESSION_KEY)
}
