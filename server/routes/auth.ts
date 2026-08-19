import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { generateToken, authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';

export const authRouter = Router();

// POST /api/auth/register
authRouter.post('/register', (req, res: Response): void => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email and password are required' });
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Passwords do not match' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ success: false, message: 'Please provide a valid email address' });
      return;
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      res.status(409).json({ success: false, message: 'An account with this email already exists' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const user = db.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash
    });

    const token = generateToken({ userId: user._id, email: user.email });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        hasCompletedOnboarding: false
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Server registration error' });
  }
});

// POST /api/auth/login
authRouter.post('/login', (req, res: Response): void => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const valid = bcrypt.compareSync(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const token = generateToken({ userId: user._id, email: user.email });
    const profile = db.getProfileByUserId(user._id);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        hasCompletedOnboarding: !!profile?.onboardingCompleted
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Login error' });
  }
});

// POST /api/auth/demo (One-click realistic demo login)
authRouter.post('/demo', (_req, res: Response): void => {
  try {
    db.seedDemoUser();
    const demoUser = db.findUserByEmail('demo@quittrack.app');
    if (!demoUser) {
      res.status(500).json({ success: false, message: 'Demo user not available' });
      return;
    }

    const token = generateToken({ userId: demoUser._id, email: demoUser.email });
    const profile = db.getProfileByUserId(demoUser._id);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: demoUser._id,
          name: demoUser.name,
          email: demoUser.email
        },
        hasCompletedOnboarding: !!profile?.onboardingCompleted
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Demo login error' });
  }
});

// GET /api/auth/me
authRouter.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = db.findUserById(req.userId!);
    if (!user) {
      res.status(404).json({ success: false, message: 'User profile not found' });
      return;
    }

    const profile = db.getProfileByUserId(user._id);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        profile,
        hasCompletedOnboarding: !!profile?.onboardingCompleted
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Failed to fetch user profile' });
  }
});
