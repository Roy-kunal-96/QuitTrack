import { Router, Response } from 'express';
import { db } from '../db.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';

export const achievementsRouter = Router();

achievementsRouter.use(authMiddleware);

// GET /api/achievements
achievementsRouter.get('/', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.userId!;
    db.checkAndAwardAchievements(userId);

    const stats = db.calculateStats(userId);
    const unlocked = db.getAchievements(userId);
    const unlockedTypes = new Set(unlocked.map(a => a.achievementType));

    // Full catalog of all possible achievements with current progress
    const allAchievements = [
      {
        id: 'first_day',
        type: 'first_day',
        title: 'First Step',
        description: 'Completed your first 24 smoke-free hours.',
        icon: '🏅',
        points: 20,
        category: 'Streak',
        progress: Math.min(100, Math.round((stats.smokeFreeDays / 1) * 100)),
        unlocked: unlockedTypes.has('first_day'),
        unlockedAt: unlocked.find(a => a.achievementType === 'first_day')?.unlockedAt
      },
      {
        id: 'streak_3',
        type: 'streak_3',
        title: '3-Day Momentum',
        description: '72 hours nicotine-free. Physical cravings start dropping.',
        icon: '⚡',
        points: 40,
        category: 'Streak',
        progress: Math.min(100, Math.round((stats.currentStreak / 3) * 100)),
        unlocked: unlockedTypes.has('streak_3'),
        unlockedAt: unlocked.find(a => a.achievementType === 'streak_3')?.unlockedAt
      },
      {
        id: 'streak_7',
        type: 'streak_7',
        title: '7-Day Champion',
        description: 'Reaching a full week free of smoking!',
        icon: '🔥',
        points: 100,
        category: 'Streak',
        progress: Math.min(100, Math.round((stats.currentStreak / 7) * 100)),
        unlocked: unlockedTypes.has('streak_7'),
        unlockedAt: unlocked.find(a => a.achievementType === 'streak_7')?.unlockedAt
      },
      {
        id: 'streak_14',
        type: 'streak_14',
        title: 'Two Weeks Strong',
        description: '14 consecutive smoke-free days achieved.',
        icon: '🌟',
        points: 200,
        category: 'Streak',
        progress: Math.min(100, Math.round((stats.currentStreak / 14) * 100)),
        unlocked: unlockedTypes.has('streak_14'),
        unlockedAt: unlocked.find(a => a.achievementType === 'streak_14')?.unlockedAt
      },
      {
        id: 'streak_30',
        type: 'streak_30',
        title: '30-Day Master',
        description: 'One month milestone! Your circulation and lung cilia are healing.',
        icon: '🚭',
        points: 500,
        category: 'Streak',
        progress: Math.min(100, Math.round((stats.currentStreak / 30) * 100)),
        unlocked: unlockedTypes.has('streak_30'),
        unlockedAt: unlocked.find(a => a.achievementType === 'streak_30')?.unlockedAt
      },
      {
        id: 'avoided_100',
        type: 'avoided_100',
        title: 'Century Milestone',
        description: 'Successfully avoided smoking 100 cigarettes.',
        icon: '🛡️',
        points: 50,
        category: 'Avoidance',
        progress: Math.min(100, Math.round((stats.cigarettesAvoided / 100) * 100)),
        unlocked: unlockedTypes.has('avoided_100'),
        unlockedAt: unlocked.find(a => a.achievementType === 'avoided_100')?.unlockedAt
      },
      {
        id: 'avoided_500',
        type: 'avoided_500',
        title: 'Half a Thousand',
        description: '500 cigarettes avoided from entering your body.',
        icon: '🎯',
        points: 150,
        category: 'Avoidance',
        progress: Math.min(100, Math.round((stats.cigarettesAvoided / 500) * 100)),
        unlocked: unlockedTypes.has('avoided_500'),
        unlockedAt: unlocked.find(a => a.achievementType === 'avoided_500')?.unlockedAt
      },
      {
        id: 'cravings_5',
        type: 'cravings_5',
        title: 'Craving Tamer',
        description: 'Resisted 5 cravings using active rescue interventions.',
        icon: '🧠',
        points: 40,
        category: 'Craving Rescue',
        progress: Math.min(100, Math.round((stats.cravingsResisted / 5) * 100)),
        unlocked: unlockedTypes.has('cravings_5'),
        unlockedAt: unlocked.find(a => a.achievementType === 'cravings_5')?.unlockedAt
      },
      {
        id: 'cravings_25',
        type: 'cravings_25',
        title: 'Iron Will',
        description: 'Successfully conquered 25 cravings.',
        icon: '💪',
        points: 150,
        category: 'Craving Rescue',
        progress: Math.min(100, Math.round((stats.cravingsResisted / 25) * 100)),
        unlocked: unlockedTypes.has('cravings_25'),
        unlockedAt: unlocked.find(a => a.achievementType === 'cravings_25')?.unlockedAt
      },
      {
        id: 'cravings_100',
        type: 'cravings_100',
        title: 'Unstoppable Mindset',
        description: 'Overcame 100 cravings without smoking.',
        icon: '🏆',
        points: 500,
        category: 'Craving Rescue',
        progress: Math.min(100, Math.round((stats.cravingsResisted / 100) * 100)),
        unlocked: unlockedTypes.has('cravings_100'),
        unlockedAt: unlocked.find(a => a.achievementType === 'cravings_100')?.unlockedAt
      },
      {
        id: 'saved_1000',
        type: 'saved_1000',
        title: 'Pocket Guardian',
        description: 'Saved over ₹1,000 / $100 by not buying tobacco.',
        icon: '💰',
        points: 50,
        category: 'Financial',
        progress: Math.min(100, Math.round((stats.moneySaved / 1000) * 100)),
        unlocked: unlockedTypes.has('saved_1000'),
        unlockedAt: unlocked.find(a => a.achievementType === 'saved_1000')?.unlockedAt
      },
      {
        id: 'saved_5000',
        type: 'saved_5000',
        title: 'Wealth Builder',
        description: 'Saved over ₹5,000 from avoided cigarettes.',
        icon: '💎',
        points: 200,
        category: 'Financial',
        progress: Math.min(100, Math.round((stats.moneySaved / 5000) * 100)),
        unlocked: unlockedTypes.has('saved_5000'),
        unlockedAt: unlocked.find(a => a.achievementType === 'saved_5000')?.unlockedAt
      }
    ];

    // User Level determination
    // Novice (0-100 pts), Resilient (101-300 pts), Champion (301-700 pts), Master (701-1500 pts), Legend (1500+ pts)
    const points = stats.totalPoints;
    let levelTitle = 'Novice Starter';
    let levelNumber = 1;
    let nextLevelPoints = 150;
    let currentLevelFloor = 0;

    if (points >= 1500) {
      levelTitle = 'Smoke-Free Legend';
      levelNumber = 5;
      nextLevelPoints = 2500;
      currentLevelFloor = 1500;
    } else if (points >= 700) {
      levelTitle = 'Resilience Master';
      levelNumber = 4;
      nextLevelPoints = 1500;
      currentLevelFloor = 700;
    } else if (points >= 300) {
      levelTitle = 'Habit Champion';
      levelNumber = 3;
      nextLevelPoints = 700;
      currentLevelFloor = 300;
    } else if (points >= 100) {
      levelTitle = 'Determined Fighter';
      levelNumber = 2;
      nextLevelPoints = 300;
      currentLevelFloor = 100;
    }

    const levelProgress = Math.min(100, Math.round(((points - currentLevelFloor) / (nextLevelPoints - currentLevelFloor)) * 100));

    res.json({
      success: true,
      data: {
        totalPoints: points,
        levelNumber,
        levelTitle,
        levelProgress,
        nextLevelPoints,
        unlockedCount: unlocked.length,
        totalAchievements: allAchievements.length,
        achievements: allAchievements
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Error fetching achievements' });
  }
});
