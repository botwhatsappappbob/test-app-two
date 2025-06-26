import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { validateFoodItem } from '../middleware/validation.js';

const router = express.Router();

// Get all food items for user
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  try {
    const foodItems = db.prepare(`
      SELECT * FROM food_items 
      WHERE user_id = ? 
      ORDER BY expiration_date ASC
    `).all(req.user!.id);

    // Convert dates and boolean values
    const formattedItems = foodItems.map(item => ({
      ...item,
      purchaseDate: new Date(item.purchase_date),
      expirationDate: new Date(item.expiration_date),
      consumedDate: item.consumed_date ? new Date(item.consumed_date) : null,
      isConsumed: Boolean(item.is_consumed),
      userId: item.user_id
    }));

    res.json(formattedItems);
  } catch (error) {
    console.error('Get food items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new food item
router.post('/', authenticateToken, validateFoodItem, (req: AuthRequest, res) => {
  try {
    const {
      name,
      category,
      quantity,
      unit,
      purchaseDate,
      expirationDate,
      storageLocation,
      cost,
      barcode
    } = req.body;

    const itemId = uuidv4();
    const insertItem = db.prepare(`
      INSERT INTO food_items (
        id, user_id, name, category, quantity, unit,
        purchase_date, expiration_date, storage_location, cost, barcode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertItem.run(
      itemId,
      req.user!.id,
      name,
      category,
      quantity,
      unit,
      purchaseDate,
      expirationDate,
      storageLocation,
      cost || null,
      barcode || null
    );

    // Get the created item
    const newItem = db.prepare('SELECT * FROM food_items WHERE id = ?').get(itemId);

    res.status(201).json({
      message: 'Food item added successfully',
      item: {
        ...newItem,
        purchaseDate: new Date(newItem.purchase_date),
        expirationDate: new Date(newItem.expiration_date),
        isConsumed: Boolean(newItem.is_consumed),
        userId: newItem.user_id
      }
    });
  } catch (error) {
    console.error('Add food item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update food item
router.put('/:id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if item belongs to user
    const existingItem = db.prepare('SELECT user_id FROM food_items WHERE id = ?').get(id);
    if (!existingItem || existingItem.user_id !== req.user!.id) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    // Build dynamic update query
    const allowedFields = ['name', 'category', 'quantity', 'unit', 'purchase_date', 'expiration_date', 'storage_location', 'cost', 'barcode', 'is_consumed', 'consumed_date'];
    const updateFields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = updateFields.map(field => updates[field]);
    values.push(id);

    const updateQuery = `UPDATE food_items SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    const updateItem = db.prepare(updateQuery);
    updateItem.run(...values);

    // Get updated item
    const updatedItem = db.prepare('SELECT * FROM food_items WHERE id = ?').get(id);

    res.json({
      message: 'Food item updated successfully',
      item: {
        ...updatedItem,
        purchaseDate: new Date(updatedItem.purchase_date),
        expirationDate: new Date(updatedItem.expiration_date),
        consumedDate: updatedItem.consumed_date ? new Date(updatedItem.consumed_date) : null,
        isConsumed: Boolean(updatedItem.is_consumed),
        userId: updatedItem.user_id
      }
    });
  } catch (error) {
    console.error('Update food item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark item as consumed
router.post('/:id/consume', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    // Check if item belongs to user
    const existingItem = db.prepare('SELECT * FROM food_items WHERE id = ? AND user_id = ?').get(id, req.user!.id);
    if (!existingItem) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    const remainingQuantity = existingItem.quantity - (quantity || existingItem.quantity);
    const isFullyConsumed = remainingQuantity <= 0;

    const updateItem = db.prepare(`
      UPDATE food_items 
      SET quantity = ?, is_consumed = ?, consumed_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateItem.run(
      isFullyConsumed ? 0 : remainingQuantity,
      isFullyConsumed ? 1 : 0,
      isFullyConsumed ? new Date().toISOString() : null,
      id
    );

    res.json({ message: 'Food item consumption updated successfully' });
  } catch (error) {
    console.error('Consume food item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete food item
router.delete('/:id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Check if item belongs to user
    const existingItem = db.prepare('SELECT user_id FROM food_items WHERE id = ?').get(id);
    if (!existingItem || existingItem.user_id !== req.user!.id) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    const deleteItem = db.prepare('DELETE FROM food_items WHERE id = ?');
    deleteItem.run(id);

    res.json({ message: 'Food item deleted successfully' });
  } catch (error) {
    console.error('Delete food item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get expiring items
router.get('/expiring/:days', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { days } = req.params;
    const daysAhead = parseInt(days) || 7;
    
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysAhead);

    const expiringItems = db.prepare(`
      SELECT * FROM food_items 
      WHERE user_id = ? 
        AND is_consumed = FALSE 
        AND expiration_date <= ? 
        AND expiration_date >= date('now')
      ORDER BY expiration_date ASC
    `).all(req.user!.id, targetDate.toISOString());

    const formattedItems = expiringItems.map(item => ({
      ...item,
      purchaseDate: new Date(item.purchase_date),
      expirationDate: new Date(item.expiration_date),
      isConsumed: Boolean(item.is_consumed),
      userId: item.user_id
    }));

    res.json(formattedItems);
  } catch (error) {
    console.error('Get expiring items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;