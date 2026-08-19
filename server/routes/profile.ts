import { Router, Response } from 'express';
import { db } from '../db.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';

export const profileRouter = Router();

profileRouter.use(authMiddleware);

// GET /api/user/profile
profileRouter.get('/', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const profile = db.getProfileByUserId(req.userId!);
    const user = db.findUserById(req.userId!);
    
    res.json({
      success: true,
      data: {
        profile,
        user: user ? { id: user._id, name: user.name, email: user.email } : null
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Error getting profile' });
  }
});

// PUT /api/user/profile
profileRouter.put('/', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const {
      name,
      cigarettesPerDay,
      cigarettesPerPack,
      pricePerPack,
      currency,
      yearsSmoked,
      smokingType,
      quitDate,
      hasAlreadyQuit,
      previousQuitAttempts,
      longestSmokeFreePeriod,
      triggers,
      motivation,
      goals,
      onboardingCompleted
    } = req.body;

    if (name) {
      const user = db.findUserById(req.userId!);
      if (user) {
        user.name = name.trim();
        user.updatedAt = new Date().toISOString();
        db.save();
      }
    }

    const updatedProfile = db.createOrUpdateProfile(req.userId!, {
      cigarettesPerDay: Number(cigarettesPerDay) || 10,
      cigarettesPerPack: Number(cigarettesPerPack) || 20,
      pricePerPack: Number(pricePerPack) || 100,
      currency: currency || '₹',
      yearsSmoked: Number(yearsSmoked) || 1,
      smokingType: smokingType || 'Cigarette',
      quitDate: quitDate || new Date().toISOString().split('T')[0],
      hasAlreadyQuit: Boolean(hasAlreadyQuit),
      previousQuitAttempts: Number(previousQuitAttempts) || 0,
      longestSmokeFreePeriod: Number(longestSmokeFreePeriod) || 0,
      triggers: Array.isArray(triggers) ? triggers : [],
      motivation: Array.isArray(motivation) ? motivation : [],
      goals: Array.isArray(goals) ? goals : [],
      onboardingCompleted: onboardingCompleted !== undefined ? Boolean(onboardingCompleted) : true
    });

    res.json({
      success: true,
      data: updatedProfile
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Error updating profile' });
  }
});
