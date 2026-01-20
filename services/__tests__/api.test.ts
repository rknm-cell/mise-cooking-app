import { api } from '../api';
import { API_CONFIG } from '../../constants/Config';

// Mock fetch globally
global.fetch = jest.fn();

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('fetch', () => {
    it('should make successful GET request', async () => {
      const mockData = { id: '1', name: 'Test Recipe' };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const { data } = await api.fetch('/recipes');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}/recipes`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(data).toEqual(mockData);
    });

    it('should include custom headers when provided', async () => {
      const mockData = { success: true };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      await api.fetch('/recipes', {
        headers: {
          'Authorization': 'Bearer token123',
        },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}/recipes`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer token123',
          }),
        })
      );
    });

    it('should handle rate limit errors (429)', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 429,
      });

      await expect(api.fetch('/recipes')).rejects.toThrow(
        'Too many requests. Please try again later.'
      );
    });

    it('should throw RateLimitError for 429 status', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 429,
      });

      try {
        await api.fetch('/recipes');
        fail('Should have thrown RateLimitError');
      } catch (error: any) {
        expect(error.name).toBe('RateLimitError');
        expect(error.message).toBe('Too many requests. Please try again later.');
      }
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(api.fetch('/recipes')).rejects.toThrow(
        'Failed to fetch. Please check your connection and try again.'
      );
    });

    it('should handle 500 server errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(api.fetch('/recipes')).rejects.toThrow('HTTP error! status: 500');
    });

    it('should handle JSON parsing errors as rate limit', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(api.fetch('/recipes')).rejects.toThrow(
        'Too many requests. Please try again later.'
      );
    });

    it('should parse JSON for successful responses', async () => {
      const mockData = { recipes: ['pizza', 'pasta'] };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const { data } = await api.fetch('/recipes');

      expect(data).toEqual(mockData);
    });

    it('should parse JSON for client error responses (4xx)', async () => {
      const mockError = { error: 'Not found' };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => mockError,
      });

      const { data } = await api.fetch('/recipes/nonexistent');

      expect(data).toEqual(mockError);
    });
  });

  describe('get', () => {
    it('should make GET request', async () => {
      const mockData = { id: '1', name: 'Test' };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const { data } = await api.get('/recipes');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}/recipes`,
        expect.objectContaining({
          method: 'GET',
        })
      );
      expect(data).toEqual(mockData);
    });

    it('should pass additional options to GET request', async () => {
      const mockData = { success: true };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      await api.get('/recipes', {
        headers: { 'X-Custom-Header': 'value' },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}/recipes`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'X-Custom-Header': 'value',
          }),
        })
      );
    });
  });

  describe('post', () => {
    it('should make POST request with body', async () => {
      const mockData = { success: true, id: '123' };
      const postBody = { name: 'New Recipe', servings: 4 };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => mockData,
      });

      const { data } = await api.post('/recipes', postBody);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}/recipes`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(postBody),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(data).toEqual(mockData);
    });

    it('should stringify body object', async () => {
      const mockData = { success: true };
      const postBody = { email: 'test@example.com', password: 'pass123' };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      await api.post('/auth/login', postBody);

      const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
      expect(callArgs.body).toBe(JSON.stringify(postBody));
    });
  });

  describe('put', () => {
    it('should make PUT request with body', async () => {
      const mockData = { success: true };
      const putBody = { name: 'Updated Recipe' };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const { data } = await api.put('/recipes/123', putBody);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}/recipes/123`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(putBody),
        })
      );
      expect(data).toEqual(mockData);
    });
  });

  describe('delete', () => {
    it('should make DELETE request', async () => {
      const mockData = { success: true };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const { data } = await api.delete('/recipes/123');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}/recipes/123`,
        expect.objectContaining({
          method: 'DELETE',
        })
      );
      expect(data).toEqual(mockData);
    });

    it('should pass options to DELETE request', async () => {
      const mockData = { success: true };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      await api.delete('/recipes/123', {
        headers: { 'Authorization': 'Bearer token' },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}/recipes/123`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': 'Bearer token',
          }),
        })
      );
    });
  });

  describe('error handling', () => {
    it('should propagate RateLimitError', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 429,
      });

      try {
        await api.get('/recipes');
        fail('Should have thrown');
      } catch (error: any) {
        expect(error.name).toBe('RateLimitError');
      }
    });

    it('should wrap other errors in generic message', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('DNS lookup failed'));

      await expect(api.get('/recipes')).rejects.toThrow(
        'Failed to fetch. Please check your connection and try again.'
      );
    });

    it('should handle timeout errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Request timeout'));

      await expect(api.get('/recipes')).rejects.toThrow(
        'Failed to fetch. Please check your connection and try again.'
      );
    });
  });

  describe('response handling', () => {
    it('should return both data and response object', async () => {
      const mockData = { id: '1' };
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => mockData,
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.get('/recipes');

      expect(result.data).toEqual(mockData);
      expect(result.response).toBeDefined();
      expect(result.response.ok).toBe(true);
      expect(result.response.status).toBe(200);
    });
  });
});
