import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    userType: string;
    subscriptionPlan: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Get user from database
    const user = db.prepare('SELECT id, email, name, user_type, subscription_plan FROM users WHERE id = ?').get(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.user_type,
      subscriptionPlan: user.subscription_plan
    };

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = db.prepare('SELECT id, email, name, user_type, subscription_plan FROM users WHERE id = ?').get(decoded.userId);
    
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.user_type,
        subscriptionPlan: user.subscription_plan
      };
    }
  } catch (error) {
    // Continue without authentication
  }

  next();
};