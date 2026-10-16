import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { login, logout } from './authService';

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls the backend login endpoint and stores the auth token', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'fake-token',
        token_type: 'bearer',
      }),
    });

    vi.stubGlobal('fetch', fetchMock);

    const result = await login('user@example.com', 'StrongPass123');

    expect(result.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'StrongPass123',
        }),
      }),
    );
    expect(localStorage.getItem('roundzero.auth.token')).toBe('fake-token');

    logout();
    expect(localStorage.getItem('roundzero.auth.token')).toBeNull();
  });
});
