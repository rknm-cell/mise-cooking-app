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

// Get all shopping lists for the current user - like bookmarks
export const getShoppingLists = async (userId: string): Promise<ShoppingList[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/shopping/lists/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching shopping lists:', error);
    throw error;
  }
};

// Create a new shopping list - like bookmarks
export const createShoppingList = async (userId: string, name: string): Promise<ShoppingList> => {
  try {
    console.log('Making request to:', `${API_BASE_URL}/api/shopping/lists`);
    console.log('Request body:', { userId, name });
    
    const response = await fetch(`${API_BASE_URL}/api/shopping/lists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, name }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.json();
    console.log('Response data:', data);
    return data.list;
  } catch (error) {
    console.error('Error creating shopping list:', error);
    throw error;
  }
};

// Delete a shopping list
export const deleteShoppingList = async (listId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/shopping/lists/${listId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
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
export const getShoppingListItems = async (listId: string): Promise<ShoppingListItem[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/shopping/lists/${listId}/items`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
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
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
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
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
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
export const deleteShoppingListItem = async (itemId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/shopping/items/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting shopping list item:', error);
    throw error;
  }
};

// Generate shopping list from recipe - like bookmarks
export const generateShoppingListFromRecipe = async (
  userId: string,
  recipeId: string, 
  listName?: string
): Promise<ShoppingList> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/shopping/generate-from-recipe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, recipeId, listName }),
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

// Get all shopping list items aggregated across all lists - like bookmarks
export const getAllShoppingListItems = async (userId: string): Promise<ShoppingListItem[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/shopping/all-items/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching all shopping list items:', error);
    throw error;
  }
};

// Aggregate shopping list items by name and unit
export interface AggregatedItem {
  name: string;
  totalQuantity: string;
  unit?: string;
  category?: string;
  isCompleted: boolean;
  itemIds: string[];
  listIds: string[];
}

export const aggregateShoppingItems = (items: ShoppingListItem[]): AggregatedItem[] => {
  const aggregatedMap = new Map<string, AggregatedItem>();

  items.forEach(item => {
    const key = `${item.name.toLowerCase()}_${item.unit || 'no-unit'}`;
    
    if (aggregatedMap.has(key)) {
      const existing = aggregatedMap.get(key)!;
      
      // Combine quantities (simple string concatenation for now)
      const existingQty = parseFloat(existing.totalQuantity) || 0;
      const newQty = parseFloat(item.quantity) || 0;
      const combinedQty = existingQty + newQty;
      
      existing.totalQuantity = combinedQty.toString();
      existing.itemIds.push(item.id);
      existing.listIds.push(item.listId);
      
      // If any item is completed, mark as completed
      if (item.isCompleted) {
        existing.isCompleted = true;
      }
    } else {
      aggregatedMap.set(key, {
        name: item.name,
        totalQuantity: item.quantity,
        unit: item.unit,
        category: item.category,
        isCompleted: item.isCompleted,
        itemIds: [item.id],
        listIds: [item.listId],
      });
    }
  });

  return Array.from(aggregatedMap.values()).sort((a, b) => {
    // Sort by category first, then by name
    if (a.category && b.category) {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
    } else if (a.category) {
      return -1;
    } else if (b.category) {
      return 1;
    }
    return a.name.localeCompare(b.name);
  });
}; 