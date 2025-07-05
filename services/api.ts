import { API_CONFIG } from '../constants/Config';

interface FetchOptions extends RequestInit {
  skipRetry?: boolean;
}

class RateLimitError extends Error {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export const api = {
  async fetch(endpoint: string, options: FetchOptions = {}) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // Handle rate limiting
      if (response.status === 429) {
        throw new RateLimitError();
      }

      // Only try to parse JSON for successful responses or expected error responses
      if (response.ok || response.status < 500) {
        try {
          const data = await response.json();
          return { data, response };
        } catch (e) {
          // If JSON parsing fails, it might be a rate limit page
          throw new RateLimitError();
        }
      }

      throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw error;
      }
      throw new Error('Failed to fetch. Please check your connection and try again.');
    }
  },

  // Convenience methods
  async get(endpoint: string, options: FetchOptions = {}) {
    return this.fetch(endpoint, { ...options, method: 'GET' });
  },

  async post(endpoint: string, body: any, options: FetchOptions = {}) {
    return this.fetch(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async put(endpoint: string, body: any, options: FetchOptions = {}) {
    return this.fetch(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  async delete(endpoint: string, options: FetchOptions = {}) {
    return this.fetch(endpoint, { ...options, method: 'DELETE' });
  },
}; 