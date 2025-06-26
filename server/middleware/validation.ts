import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

export const validateRegistration = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('userType').isIn(['household', 'business']).withMessage('User type must be household or business'),
  handleValidationErrors
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

export const validateFoodItem = [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('category').isIn(['vegetables', 'fruits', 'meats', 'dairy', 'grains', 'canned', 'frozen', 'snacks', 'beverages', 'other']).withMessage('Invalid category'),
  body('quantity').isFloat({ min: 0.1 }).withMessage('Quantity must be greater than 0'),
  body('unit').trim().isLength({ min: 1 }).withMessage('Unit is required'),
  body('purchaseDate').isISO8601().withMessage('Valid purchase date is required'),
  body('expirationDate').isISO8601().withMessage('Valid expiration date is required'),
  body('storageLocation').isIn(['refrigerator', 'freezer', 'pantry', 'counter']).withMessage('Invalid storage location'),
  body('cost').optional().isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
  body('barcode').optional().trim(),
  handleValidationErrors
];

export const validateDonation = [
  body('foodItems').isArray({ min: 1 }).withMessage('At least one food item is required'),
  body('recipientOrganization').trim().isLength({ min: 1 }).withMessage('Recipient organization is required'),
  body('pickupDate').isISO8601().withMessage('Valid pickup date is required'),
  body('notes').optional().trim(),
  handleValidationErrors
];