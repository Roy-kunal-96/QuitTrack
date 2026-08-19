import { Router, Response } from 'express';
import { db } from '../db.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';

export const savingsRouter = Router();

savingsRouter.use(authMiddleware);

// GET /api/savings
savingsRouter.get('/', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.userId!;
    const profile = db.getProfileByUserId(userId);
    const stats = db.calculateStats(userId);
    const goals = db.getSavingsGoals(userId);

    const currency = profile?.currency || '₹';
    const dailySavingRate = stats.dailyExpense || 100;
    const currentSaved = stats.moneySaved;

    // Calculate goal projections
    const goalsWithProgress = goals.map(g => {
      const savedTowardsGoal = Math.min(g.targetAmount, currentSaved);
      const progressPercent = Math.min(100, Math.round((currentSaved / g.targetAmount) * 100));
      const remainingAmount = Math.max(0, g.targetAmount - currentSaved);
      const daysToGoal = dailySavingRate > 0 ? Math.ceil(remainingAmount / dailySavingRate) : 0;
      const monthsToGoal = Number((daysToGoal / 30).toFixed(1));

      return {
        ...g,
        currentSaved,
        savedTowardsGoal,
        progressPercent,
        remainingAmount,
        daysToGoal,
        monthsToGoal,
        isCompleted: currentSaved >= g.targetAmount
      };
    });

    res.json({
      success: true,
      data: {
        currency,
        currentSaved,
        dailySavingRate,
        monthlySavingRate: dailySavingRate * 30,
        yearlySavingRate: dailySavingRate * 365,
        goals: goalsWithProgress
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Error fetching savings' });
  }
});

// POST /api/savings/goals
savingsRouter.post('/goals', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { name, targetAmount, icon, category } = req.body;
    if (!name || !targetAmount) {
      res.status(400).json({ success: false, message: 'Goal name and target amount are required' });
      return;
    }

    const goal = db.addSavingsGoal(req.userId!, {
      name: name.trim(),
      targetAmount: Number(targetAmount),
      icon: icon || '🎯',
      category: category || 'General'
    });

    res.status(201).json({
      success: true,
      data: goal
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Error creating savings goal' });
  }
});

// PUT /api/savings/goals/:id
savingsRouter.put('/goals/:id', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { name, targetAmount, icon, category } = req.body;

    const updated = db.updateSavingsGoal(req.userId!, id, {
      ...(name ? { name: name.trim() } : {}),
      ...(targetAmount ? { targetAmount: Number(targetAmount) } : {}),
      ...(icon ? { icon } : {}),
      ...(category ? { category } : {})
    });

    if (!updated) {
      res.status(404).json({ success: false, message: 'Goal not found' });
      return;
    }

    res.json({
      success: true,
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Error updating savings goal' });
  }
});

// DELETE /api/savings/goals/:id
savingsRouter.delete('/goals/:id', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const deleted = db.deleteSavingsGoal(req.userId!, id);

    if (!deleted) {
      res.status(404).json({ success: false, message: 'Goal not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Error deleting savings goal' });
  }
});
