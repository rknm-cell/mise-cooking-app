import { API_BASE_URL } from '../constants/Config';

export interface ShoppingList {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingListItem {
  id: string;
  listId: string;
  name: string;
  quantity: string;
  unit?: string;
  category?: string;
  isCompleted: boolean;
  createdAt: string;
}

// Get all shopping lists for the current user
export const getShoppingLists = async (token: string): Promise<ShoppingList[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/shopping/lists`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.lists || [];
  } catch (error) {
    console.error('Error fetching shopping lists:', error);
    throw error;
  }
};

// Create a new shopping list
export const createShoppingList = async (token: string, name: string): Promise<ShoppingList> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/shopping/lists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.list;
  } catch (error) {
    console.error('Error creating shopping list:', error);
    throw error;
  }
};

// Delete a shopping list
export const deleteShoppingList = async (token: string, listId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/shopping/lists/${listId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting shopping list:', error);
    throw error;
  }
};

// Get items for a shopping list
export const getShoppingListItems = async (token: string, listId: string): Promise<ShoppingListItem[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/shopping/lists/${listId}/items`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching shopping list items:', error);
    throw error;
  }
};

// Add item to shopping list
export const addShoppingListItem = async (
  token: string, 
  listId: string, 
  name: string, 
  quantity: string, 
  unit?: string, 
  category?: string
): Promise<ShoppingListItem> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/shopping/lists/${listId}/items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, quantity, unit, category }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.item;
  } catch (error) {
    console.error('Error adding shopping list item:', error);
    throw error;
  }
};

// Update shopping list item
export const updateShoppingListItem = async (
  token: string,
  itemId: string,
  updates: {
    name?: string;
    quantity?: string;
    unit?: string;
    category?: string;
    isCompleted?: boolean;
  }
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/shopping/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error updating shopping list item:', error);
    throw error;
  }
};

// Delete shopping list item
export const deleteShoppingListItem = async (token: string, itemId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/shopping/items/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting shopping list item:', error);
    throw error;
  }
};

// Generate shopping list from recipe
export const generateShoppingListFromRecipe = async (
  token: string, 
  recipeId: string, 
  listName?: string
): Promise<ShoppingList> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/shopping/generate-from-recipe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipeId, listName }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.list;
  } catch (error) {
    console.error('Error generating shopping list from recipe:', error);
    throw error;
  }
}; 