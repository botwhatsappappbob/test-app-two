import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database.js';
import { validateRegistration, validateLogin } from '../middleware/validation.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { email, password, name, userType } = req.body;

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = uuidv4();
    const insertUser = db.prepare(`
      INSERT INTO users (id, email, password_hash, name, user_type)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertUser.run(userId, email, passwordHash, name, userType);

    // Create default notification settings
    const insertSettings = db.prepare(`
      INSERT INTO notification_settings (id, user_id)
      VALUES (?, ?)
    `);
    insertSettings.run(uuidv4(), userId);

    // Generate JWT token
    const token = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Get user data for response
    const user = db.prepare(`
      SELECT id, email, name, user_type, subscription_plan, created_at
      FROM users WHERE id = ?
    `).get(userId);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.user_type,
        subscriptionPlan: user.subscription_plan,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user from database
    const user = db.prepare(`
      SELECT id, email, password_hash, name, user_type, subscription_plan, created_at
      FROM users WHERE email = ?
    `).get(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.user_type,
        subscriptionPlan: user.subscription_plan,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', authenticateToken, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

// Upgrade subscription
router.post('/upgrade', authenticateToken, (req: AuthRequest, res) => {
  try {
    const updateUser = db.prepare(`
      UPDATE users SET subscription_plan = 'premium', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateUser.run(req.user!.id);

    res.json({ message: 'Subscription upgraded successfully' });
  } catch (error) {
    console.error('Upgrade error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;