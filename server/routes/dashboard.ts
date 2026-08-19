import { Router, Response } from 'express';
import { db } from '../db.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';

export const dashboardRouter = Router();

dashboardRouter.use(authMiddleware);

// GET /api/dashboard
dashboardRouter.get('/', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.userId!;
    const profile = db.getProfileByUserId(userId);
    const stats = db.calculateStats(userId);
    const logs = db.getSmokingLogs(userId);
    const cravings = db.getCravings(userId);
    const achievements = db.getAchievements(userId);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayLog = logs.find(l => l.date === todayStr);

    // Recent 5 cravings
    const recentCravings = cravings.slice(0, 5);

    // Top triggers
    const triggerMap: Record<string, number> = {};
    cravings.forEach(c => {
      triggerMap[c.trigger] = (triggerMap[c.trigger] || 0) + 1;
    });
    const topTriggers = Object.entries(triggerMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Health overview progress (hours since quit)
    const quitDate = profile?.quitDate ? new Date(profile.quitDate) : new Date();
    const hoursSinceQuit = Math.max(0, (Date.now() - quitDate.getTime()) / (1000 * 60 * 60));

    res.json({
      success: true,
      data: {
        profile,
        stats,
        todayLog: todayLog || null,
        recentCravings,
        topTriggers,
        achievementsCount: achievements.length,
        hoursSinceQuit: Math.round(hoursSinceQuit)
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Error generating dashboard' });
  }
});
