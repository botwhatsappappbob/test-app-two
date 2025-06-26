import express from 'express';
import { db } from '../config/database.js';

const router = express.Router();

// Get all food banks
router.get('/', (req, res) => {
  try {
    const { search, country, city } = req.query;
    
    let query = 'SELECT * FROM food_banks';
    const params: any[] = [];
    const conditions: string[] = [];

    if (search) {
      conditions.push('(name LIKE ? OR city LIKE ? OR country LIKE ? OR address LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (country) {
      conditions.push('country LIKE ?');
      params.push(`%${country}%`);
    }

    if (city) {
      conditions.push('city LIKE ?');
      params.push(`%${city}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY country, city, name';

    const foodBanks = db.prepare(query).all(...params);

    const formattedFoodBanks = foodBanks.map(bank => ({
      ...bank,
      acceptedItems: JSON.parse(bank.accepted_items),
      coordinates: bank.latitude && bank.longitude ? {
        lat: bank.latitude,
        lng: bank.longitude
      } : undefined
    }));

    res.json(formattedFoodBanks);
  } catch (error) {
    console.error('Get food banks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get food banks near location
router.get('/nearby', (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const radiusKm = parseFloat(radius as string);

    // Simple distance calculation (not perfectly accurate but good enough for demo)
    const foodBanks = db.prepare(`
      SELECT *, 
        (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * 
        cos(radians(longitude) - radians(?)) + sin(radians(?)) * 
        sin(radians(latitude)))) AS distance
      FROM food_banks 
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      HAVING distance < ?
      ORDER BY distance
    `).all(latitude, longitude, latitude, radiusKm);

    const formattedFoodBanks = foodBanks.map(bank => ({
      ...bank,
      acceptedItems: JSON.parse(bank.accepted_items),
      coordinates: {
        lat: bank.latitude,
        lng: bank.longitude
      },
      distance: Math.round(bank.distance * 100) / 100 // Round to 2 decimal places
    }));

    res.json(formattedFoodBanks);
  } catch (error) {
    console.error('Get nearby food banks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;