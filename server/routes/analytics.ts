import express from 'express';
import { db } from '../config/database.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get user analytics
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    // Get basic stats
    const totalItems = db.prepare('SELECT COUNT(*) as count FROM food_items WHERE user_id = ?').get(userId) as { count: number };
    const consumedItems = db.prepare('SELECT COUNT(*) as count FROM food_items WHERE user_id = ? AND is_consumed = TRUE').get(userId) as { count: number };
    const expiredItems = db.prepare(`
      SELECT COUNT(*) as count FROM food_items 
      WHERE user_id = ? AND is_consumed = FALSE AND expiration_date < date('now')
    `).get(userId) as { count: number };

    // Get financial stats
    const totalValue = db.prepare('SELECT COALESCE(SUM(cost), 0) as total FROM food_items WHERE user_id = ?').get(userId) as { total: number };
    const savedValue = db.prepare('SELECT COALESCE(SUM(cost), 0) as total FROM food_items WHERE user_id = ? AND is_consumed = TRUE').get(userId) as { total: number };
    const wastedValue = db.prepare(`
      SELECT COALESCE(SUM(cost), 0) as total FROM food_items 
      WHERE user_id = ? AND is_consumed = FALSE AND expiration_date < date('now')
    `).get(userId) as { total: number };

    // Get category breakdown
    const categoryBreakdown = db.prepare(`
      SELECT category, COUNT(*) as count 
      FROM food_items 
      WHERE user_id = ? 
      GROUP BY category 
      ORDER BY count DESC
    `).all(userId) as Array<{ category: string; count: number }>;

    // Get monthly consumption trend (last 6 months)
    const monthlyTrend = db.prepare(`
      SELECT 
        strftime('%Y-%m', consumed_date) as month,
        COUNT(*) as consumed,
        COALESCE(SUM(cost), 0) as saved
      FROM food_items 
      WHERE user_id = ? AND is_consumed = TRUE AND consumed_date >= date('now', '-6 months')
      GROUP BY strftime('%Y-%m', consumed_date)
      ORDER BY month
    `).all(userId) as Array<{ month: string; consumed: number; saved: number }>;

    // Get donation stats
    const donationStats = db.prepare(`
      SELECT 
        COUNT(*) as total_donations,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_donations
      FROM donations 
      WHERE user_id = ?
    `).get(userId) as { total_donations: number; completed_donations: number };

    const analytics = {
      overview: {
        totalItems: totalItems.count,
        consumedItems: consumedItems.count,
        expiredItems: expiredItems.count,
        wasteReduction: totalItems.count > 0 ? (consumedItems.count / totalItems.count) * 100 : 0
      },
      financial: {
        totalValue: totalValue.total,
        savedValue: savedValue.total,
        wastedValue: wastedValue.total,
        savingsRate: totalValue.total > 0 ? (savedValue.total / totalValue.total) * 100 : 0
      },
      categoryBreakdown: categoryBreakdown.map(item => ({
        name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
        value: item.count
      })),
      monthlyTrend: monthlyTrend.map(item => ({
        month: item.month,
        consumed: item.consumed,
        saved: item.saved
      })),
      donations: {
        totalDonations: donationStats.total_donations,
        completedDonations: donationStats.completed_donations
      },
      environmental: {
        co2Saved: consumedItems.count * 0.5, // Estimated kg CO2 saved
        waterSaved: consumedItems.count * 2.5, // Estimated liters saved
        mealsDonated: donationStats.completed_donations * 3 // Estimated meals per donation
      }
    };

    res.json({ data: analytics });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get waste report
router.get('/waste-report', authenticateToken, (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { period = '30' } = req.query;
    const days = parseInt(period as string);

    const wasteReport = db.prepare(`
      SELECT 
        name,
        category,
        quantity,
        unit,
        cost,
        expiration_date,
        JULIANDAY('now') - JULIANDAY(expiration_date) as days_expired
      FROM food_items 
      WHERE user_id = ? 
        AND is_consumed = FALSE 
        AND expiration_date < date('now')
        AND expiration_date >= date('now', '-${days} days')
      ORDER BY expiration_date DESC
    `).all(userId) as Array<any>;

    const summary = {
      totalWastedItems: wasteReport.length,
      totalWastedValue: wasteReport.reduce((sum, item) => sum + (item.cost || 0), 0),
      averageDaysExpired: wasteReport.length > 0 
        ? wasteReport.reduce((sum, item) => sum + item.days_expired, 0) / wasteReport.length 
        : 0,
      categoryBreakdown: wasteReport.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    res.json({
      data: {
        summary,
        items: wasteReport.map(item => ({
          ...item,
          expirationDate: new Date(item.expiration_date),
          daysExpired: Math.round(item.days_expired)
        }))
      }
    });
  } catch (error) {
    console.error('Get waste report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;