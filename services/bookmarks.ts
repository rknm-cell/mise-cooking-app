import { API_CONFIG } from '../constants/Config';

// Flexible API configuration
const API_BASE = API_CONFIG.BASE_URL;

export interface Bookmark {
  userId: string;
  recipeId: string;
  bookmarkedAt: string;
}

export const fetchBookmarks = async (userId: string): Promise<Bookmark[]> => {
  try {
    const response = await fetch(`${API_BASE}/api/bookmarks/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch bookmarks');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return [];
  }
};

export const addBookmark = async (userId: string, recipeId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/api/bookmarks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, recipeId }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add bookmark: ${errorText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return false;
  }
};

export const removeBookmark = async (userId: string, recipeId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/api/bookmarks`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, recipeId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove bookmark');
    }
    
    return true;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return false;
  }
};

export const isBookmarked = async (userId: string, recipeId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/api/bookmarks/${userId}/${recipeId}`);
    if (!response.ok) {
      throw new Error('Failed to check bookmark status');
    }
    return await response.json();
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    return false;
  }
}; 