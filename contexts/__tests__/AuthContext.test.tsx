import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../AuthContext';
import { API_BASE_URL } from '../../constants/Config';

// Mock fetch globally
global.fetch = jest.fn();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });

    it('should provide auth context when used inside AuthProvider', () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.user).toBeDefined();
      expect(result.current.login).toBeDefined();
      expect(result.current.signup).toBeDefined();
      expect(result.current.logout).toBeDefined();
    });
  });

  describe('Initial State', () => {
    it('should start with loading state', () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.user).toBeNull();
    });

    it('should check auth status on mount', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({}),
      });

      renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `${API_BASE_URL}/api/auth/me`,
          expect.objectContaining({
            credentials: 'include',
          })
        );
      });
    });

    it('should set user if auth status check succeeds', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
    });

    it('should set user to null if auth status check fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Not authenticated' }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };

      (global.fetch as jest.Mock)
        // First call - checkAuthStatus on mount
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({}),
        })
        // Second call - login
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ user: mockUser }),
        });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loginResult: boolean = false;
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'password123');
      });

      expect(loginResult).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/auth/login`,
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        })
      );
    });

    it('should return false for invalid credentials', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Invalid credentials' }),
        });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loginResult: boolean = true;
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'wrongpassword');
      });

      expect(loginResult).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should handle network errors during login', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({}),
        })
        .mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loginResult: boolean = true;
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'password123');
      });

      expect(loginResult).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should handle timeout errors during login', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({}),
        })
        .mockImplementationOnce(
          () =>
            new Promise((_, reject) => {
              setTimeout(() => {
                const error = new Error('Request timeout');
                error.name = 'AbortError';
                reject(error);
              }, 10000);
            })
        );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loginResult: boolean = true;
      const loginPromise = act(async () => {
        loginResult = await result.current.login('test@example.com', 'password123');
      });

      // Fast-forward time to trigger timeout
      act(() => {
        jest.advanceTimersByTime(10000);
      });

      await loginPromise;

      expect(loginResult).toBe(false);
    });

    it('should include timeout controller in request', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ user: { id: '1', name: 'Test', email: 'test@example.com' } }),
        });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      // Verify signal was passed to fetch
      const loginCall = (global.fetch as jest.Mock).mock.calls.find(
        call => call[0].includes('/login')
      );
      expect(loginCall[1].signal).toBeDefined();
    });
  });

  describe('signup', () => {
    it('should signup successfully with valid data', async () => {
      const mockUser = { id: '2', email: 'new@example.com', name: 'New User' };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ user: mockUser }),
        });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let signupResult: boolean = false;
      await act(async () => {
        signupResult = await result.current.signup('New User', 'new@example.com', 'password123');
      });

      expect(signupResult).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/auth/signup`,
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({ name: 'New User', email: 'new@example.com', password: 'password123' }),
        })
      );
    });

    it('should return false for invalid signup data', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Email already exists' }),
        });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let signupResult: boolean = true;
      await act(async () => {
        signupResult = await result.current.signup('User', 'existing@example.com', 'password');
      });

      expect(signupResult).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should handle network errors during signup', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({}),
        })
        .mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let signupResult: boolean = true;
      await act(async () => {
        signupResult = await result.current.signup('User', 'test@example.com', 'password');
      });

      expect(signupResult).toBe(false);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };

      (global.fetch as jest.Mock)
        // checkAuthStatus on mount
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUser,
        })
        // logout
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/auth/logout`,
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      );
    });

    it('should clear user even if logout request fails', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUser,
        })
        .mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      await act(async () => {
        await result.current.logout();
      });

      // User should still be cleared locally even if request fails
      expect(result.current.user).toBeNull();
    });
  });

  describe('checkAuthStatus', () => {
    it('should update user when called manually', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUser,
        });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();

      await act(async () => {
        await result.current.checkAuthStatus();
      });

      expect(result.current.user).toEqual(mockUser);
    });

    it('should handle errors during manual auth check', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({}),
        })
        .mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.checkAuthStatus();
      });

      expect(result.current.user).toBeNull();
    });
  });

  describe('isAuthenticated computed property', () => {
    it('should return false when user is null', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
    });

    it('should have user when authenticated', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });
    });
  });
});
