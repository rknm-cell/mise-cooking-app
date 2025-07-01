import express from 'express';
import {
    addShoppingListItem,
    createShoppingList,
    deleteShoppingList,
    deleteShoppingListItem,
    generateShoppingListFromRecipe,
    getShoppingListItems,
    getShoppingLists,
    updateShoppingListItem,
} from '../db/queries.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

// Get all shopping lists for user
router.get('/lists', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const lists = await getShoppingLists(userId);
    res.json({ success: true, lists });
  } catch (error) {
    console.error('Error fetching shopping lists:', error);
    res.status(500).json({ error: 'Failed to fetch shopping lists' });
  }
});

// Create new shopping list
router.post('/lists', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'List name is required' });
    }

    const result = await createShoppingList(userId, name);
    if (result.success && result.list) {
      res.json({ success: true, list: result.list });
    } else {
      res.status(400).json({ error: result.message || 'Failed to create shopping list' });
    }
  } catch (error) {
    console.error('Error creating shopping list:', error);
    res.status(500).json({ error: 'Failed to create shopping list' });
  }
});

// Delete shopping list
router.delete('/lists/:listId', async (req, res) => {
  try {
    const { listId } = req.params;
    const result = await deleteShoppingList(listId);
    
    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: result.message || 'Failed to delete shopping list' });
    }
  } catch (error) {
    console.error('Error deleting shopping list:', error);
    res.status(500).json({ error: 'Failed to delete shopping list' });
  }
});

// Get items for a shopping list
router.get('/lists/:listId/items', async (req, res) => {
  try {
    const { listId } = req.params;
    const items = await getShoppingListItems(listId);
    res.json({ success: true, items });
  } catch (error) {
    console.error('Error fetching shopping list items:', error);
    res.status(500).json({ error: 'Failed to fetch shopping list items' });
  }
});

// Add item to shopping list
router.post('/lists/:listId/items', async (req, res) => {
  try {
    const { listId } = req.params;
    const { name, quantity, unit, category } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Item name is required' });
    }

    if (!quantity || typeof quantity !== 'string') {
      return res.status(400).json({ error: 'Quantity is required' });
    }

    const result = await addShoppingListItem(listId, name, quantity, unit, category);
    if (result.success && result.item) {
      res.json({ success: true, item: result.item });
    } else {
      res.status(400).json({ error: result.message || 'Failed to add item' });
    }
  } catch (error) {
    console.error('Error adding shopping list item:', error);
    res.status(500).json({ error: 'Failed to add item' });
  }
});

// Update shopping list item
router.put('/items/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { name, quantity, unit, category, isCompleted } = req.body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (quantity !== undefined) updates.quantity = quantity;
    if (unit !== undefined) updates.unit = unit;
    if (category !== undefined) updates.category = category;
    if (isCompleted !== undefined) updates.isCompleted = isCompleted;

    const result = await updateShoppingListItem(itemId, updates);
    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: result.message || 'Failed to update item' });
    }
  } catch (error) {
    console.error('Error updating shopping list item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Delete shopping list item
router.delete('/items/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const result = await deleteShoppingListItem(itemId);
    
    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: result.message || 'Failed to delete item' });
    }
  } catch (error) {
    console.error('Error deleting shopping list item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Generate shopping list from recipe
router.post('/generate-from-recipe', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { recipeId, listName } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!recipeId || typeof recipeId !== 'string') {
      return res.status(400).json({ error: 'Recipe ID is required' });
    }

    const result = await generateShoppingListFromRecipe(recipeId, userId, listName);
    if (result.success && result.list) {
      res.json({ success: true, list: result.list });
    } else {
      res.status(400).json({ error: result.message || 'Failed to generate shopping list' });
    }
  } catch (error) {
    console.error('Error generating shopping list from recipe:', error);
    res.status(500).json({ error: 'Failed to generate shopping list' });
  }
});

export default router; 