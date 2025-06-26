import express from 'express';
import { db } from '../config/database.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { validateDonation } from '../middleware/validation.js';
import { uuidv4 } from '../utils/uuid.js';

const router = express.Router();

// Get all donations for user
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  try {
    const donations = db.prepare(`
      SELECT * FROM donations 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).all(req.user!.id);

    const formattedDonations = donations.map((donation: any) => ({
      ...donation,
      foodItems: JSON.parse(donation.food_items),
      pickupDate: new Date(donation.pickup_date),
      createdAt: new Date(donation.created_at),
      userId: donation.user_id,
      recipientOrganization: donation.recipient_organization
    }));

    res.json({ data: formattedDonations });
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new donation
router.post('/', authenticateToken, validateDonation, (req: AuthRequest, res) => {
  try {
    const { foodItems, recipientOrganization, pickupDate, notes } = req.body;

    const donationId = uuidv4();
    const insertDonation = db.prepare(`
      INSERT INTO donations (id, user_id, food_items, recipient_organization, pickup_date, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertDonation.run(
      donationId,
      req.user!.id,
      JSON.stringify(foodItems),
      recipientOrganization,
      pickupDate,
      notes || null
    );

    const newDonation = db.prepare('SELECT * FROM donations WHERE id = ?').get(donationId);

    res.status(201).json({
      message: 'Donation created successfully',
      donation: {
        ...newDonation,
        foodItems: JSON.parse(newDonation.food_items),
        pickupDate: new Date(newDonation.pickup_date),
        createdAt: new Date(newDonation.created_at),
        userId: newDonation.user_id,
        recipientOrganization: newDonation.recipient_organization
      }
    });
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update donation status
router.put('/:id/status', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if donation belongs to user
    const existingDonation = db.prepare('SELECT user_id FROM donations WHERE id = ?').get(id);
    if (!existingDonation || existingDonation.user_id !== req.user!.id) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    const updateDonation = db.prepare(`
      UPDATE donations 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);

    updateDonation.run(status, id);

    res.json({ message: 'Donation status updated successfully' });
  } catch (error) {
    console.error('Update donation status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;