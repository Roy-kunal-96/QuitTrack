import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User, SmokingProfile, SmokingLog, Craving, Achievement, SavingsGoal } from './types.js';

interface DatabaseSchema {
  users: User[];
  profiles: SmokingProfile[];
  smokingLogs: SmokingLog[];
  cravings: Craving[];
  achievements: Achievement[];
  savingsGoals: SavingsGoal[];
}

const DB_FILE = path.resolve(process.cwd(), 'data_quittrack.json');

const INITIAL_DB: DatabaseSchema = {
  users: [],
  profiles: [],
  smokingLogs: [],
  cravings: [],
  achievements: [],
  savingsGoals: []
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
    this.seedDemoUser();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Failed to load db file, using fresh db:', err);
    }
    return JSON.parse(JSON.stringify(INITIAL_DB));
  }

  public save(): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save db file:', err);
    }
  }

  public generateId(): string {
    return crypto.randomUUID();
  }

  // --- Seed Demo Data ---
  public seedDemoUser() {
    const existingDemo = this.data.users.find(u => u.email === 'demo@quittrack.app');
    if (existingDemo) return;

    const demoUserId = 'demo-user-101';
    const now = new Date();
    const quitDate = new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000); // 18 days ago

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('password123', salt);

    const demoUser: User = {
      _id: demoUserId,
      name: 'Alex Rivera',
      email: 'demo@quittrack.app',
      passwordHash,
      createdAt: quitDate.toISOString(),
      updatedAt: now.toISOString()
    };

    const demoProfile: SmokingProfile = {
      _id: 'demo-profile-101',
      userId: demoUserId,
      cigarettesPerDay: 20,
      cigarettesPerPack: 20,
      pricePerPack: 100, // e.g. ₹100 or $10 (price per cig = 5)
      currency: '₹',
      yearsSmoked: 7,
      smokingType: 'Cigarette',
      quitDate: quitDate.toISOString().split('T')[0],
      hasAlreadyQuit: true,
      previousQuitAttempts: 2,
      longestSmokeFreePeriod: 14,
      triggers: ['Stress', 'Tea/Coffee', 'After meals', 'Work pressure'],
      motivation: ['Health', 'Money', 'Fitness', 'Family'],
      goals: ['Quit completely', 'Improve fitness', 'Save money for emergency fund'],
      onboardingCompleted: true,
      createdAt: quitDate.toISOString(),
      updatedAt: now.toISOString()
    };

    // 18 days of logs: 18 smoke free days
    const logs: SmokingLog[] = [];
    for (let i = 18; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      // Day 5 had a minor craving of 7 intensity, but didn't smoke
      logs.push({
        _id: this.generateId(),
        userId: demoUserId,
        date: dateStr,
        smoked: false,
        cigarettes: 0,
        trigger: i === 12 ? 'Tea/Coffee' : undefined,
        cravingIntensity: i === 12 ? 6 : (i === 4 ? 7 : undefined),
        notes: i === 0 ? 'Feeling energized and clear-headed today!' : undefined,
        createdAt: d.toISOString(),
        updatedAt: d.toISOString()
      });
    }

    // Realistic cravings history
    const cravingsList: Craving[] = [
      {
        _id: this.generateId(),
        userId: demoUserId,
        timestamp: new Date(now.getTime() - 17 * 24 * 3600 * 1000 + 9 * 3600 * 1000).toISOString(),
        intensity: 8,
        trigger: 'Morning Tea',
        environment: 'At home',
        intervention: 'Water',
        interventionDuration: 180,
        result: 'gone',
        smokedAfterCraving: false,
        createdAt: new Date(now.getTime() - 17 * 24 * 3600 * 1000).toISOString()
      },
      {
        _id: this.generateId(),
        userId: demoUserId,
        timestamp: new Date(now.getTime() - 15 * 24 * 3600 * 1000 + 14 * 3600 * 1000).toISOString(),
        intensity: 9,
        trigger: 'Work Stress',
        environment: 'At work',
        intervention: 'Breathing',
        interventionDuration: 300,
        result: 'reduced',
        smokedAfterCraving: false,
        createdAt: new Date(now.getTime() - 15 * 24 * 3600 * 1000).toISOString()
      },
      {
        _id: this.generateId(),
        userId: demoUserId,
        timestamp: new Date(now.getTime() - 12 * 24 * 3600 * 1000 + 17 * 3600 * 1000).toISOString(),
        intensity: 7,
        trigger: 'After meals',
        environment: 'Outside',
        intervention: 'Walk',
        interventionDuration: 360,
        result: 'gone',
        smokedAfterCraving: false,
        createdAt: new Date(now.getTime() - 12 * 24 * 3600 * 1000).toISOString()
      },
      {
        _id: this.generateId(),
        userId: demoUserId,
        timestamp: new Date(now.getTime() - 10 * 24 * 3600 * 1000 + 19 * 3600 * 1000).toISOString(),
        intensity: 6,
        trigger: 'Social situations',
        environment: 'With friends',
        intervention: 'Delay',
        interventionDuration: 600,
        result: 'gone',
        smokedAfterCraving: false,
        createdAt: new Date(now.getTime() - 10 * 24 * 3600 * 1000).toISOString()
      },
      {
        _id: this.generateId(),
        userId: demoUserId,
        timestamp: new Date(now.getTime() - 7 * 24 * 3600 * 1000 + 11 * 3600 * 1000).toISOString(),
        intensity: 8,
        trigger: 'Stress',
        environment: 'At work',
        intervention: 'Quick Exercise',
        interventionDuration: 240,
        result: 'gone',
        smokedAfterCraving: false,
        createdAt: new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString()
      },
      {
        _id: this.generateId(),
        userId: demoUserId,
        timestamp: new Date(now.getTime() - 4 * 24 * 3600 * 1000 + 16 * 3600 * 1000).toISOString(),
        intensity: 7,
        trigger: 'Tea/Coffee',
        environment: 'At home',
        intervention: 'Breathing',
        interventionDuration: 300,
        result: 'reduced',
        smokedAfterCraving: false,
        createdAt: new Date(now.getTime() - 4 * 24 * 3600 * 1000).toISOString()
      },
      {
        _id: this.generateId(),
        userId: demoUserId,
        timestamp: new Date(now.getTime() - 2 * 24 * 3600 * 1000 + 18 * 3600 * 1000).toISOString(),
        intensity: 6,
        trigger: 'Boredom',
        environment: 'At home',
        intervention: 'Walk',
        interventionDuration: 400,
        result: 'gone',
        smokedAfterCraving: false,
        createdAt: new Date(now.getTime() - 2 * 24 * 3600 * 1000).toISOString()
      },
      {
        _id: this.generateId(),
        userId: demoUserId,
        timestamp: new Date(now.getTime() - 1 * 24 * 3600 * 1000 + 13 * 3600 * 1000).toISOString(),
        intensity: 5,
        trigger: 'After meals',
        environment: 'At home',
        intervention: 'Water',
        interventionDuration: 120,
        result: 'gone',
        smokedAfterCraving: false,
        createdAt: new Date(now.getTime() - 1 * 24 * 3600 * 1000).toISOString()
      }
    ];

    const initialAchievements: Achievement[] = [
      {
        _id: this.generateId(),
        userId: demoUserId,
        achievementType: 'first_day',
        title: 'First Step',
        description: 'Completed your first 24 smoke-free hours.',
        icon: '🏅',
        points: 20,
        unlockedAt: new Date(now.getTime() - 17 * 24 * 3600 * 1000).toISOString()
      },
      {
        _id: this.generateId(),
        userId: demoUserId,
        achievementType: 'streak_7',
        title: '7-Day Champion',
        description: 'Reached a full week free of smoking!',
        icon: '🔥',
        points: 100,
        unlockedAt: new Date(now.getTime() - 11 * 24 * 3600 * 1000).toISOString()
      },
      {
        _id: this.generateId(),
        userId: demoUserId,
        achievementType: 'avoided_100',
        title: 'Century Milestone',
        description: 'Successfully avoided smoking 100 cigarettes.',
        icon: '🚭',
        points: 50,
        unlockedAt: new Date(now.getTime() - 13 * 24 * 3600 * 1000).toISOString()
      },
      {
        _id: this.generateId(),
        userId: demoUserId,
        achievementType: 'cravings_5',
        title: 'Craving Conqueror',
        description: 'Resisted 5 cravings using active rescue interventions.',
        icon: '🧠',
        points: 40,
        unlockedAt: new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString()
      },
      {
        _id: this.generateId(),
        userId: demoUserId,
        achievementType: 'saved_1000',
        title: 'Pocket Guardian',
        description: 'Saved your first ₹1,000 / $100 from avoided cigarettes.',
        icon: '💰',
        points: 50,
        unlockedAt: new Date(now.getTime() - 8 * 24 * 3600 * 1000).toISOString()
      }
    ];

    const initialSavingsGoals: SavingsGoal[] = [
      {
        _id: this.generateId(),
        userId: demoUserId,
        name: 'Noise Cancelling Headphones',
        targetAmount: 5000,
        category: 'Gadget',
        icon: '🎧',
        createdAt: quitDate.toISOString(),
        updatedAt: quitDate.toISOString()
      },
      {
        _id: this.generateId(),
        userId: demoUserId,
        name: 'Weekend Mountain Trip',
        targetAmount: 15000,
        category: 'Travel',
        icon: '🏔️',
        createdAt: quitDate.toISOString(),
        updatedAt: quitDate.toISOString()
      }
    ];

    this.data.users.push(demoUser);
    this.data.profiles.push(demoProfile);
    this.data.smokingLogs.push(...logs);
    this.data.cravings.push(...cravingsList);
    this.data.achievements.push(...initialAchievements);
    this.data.savingsGoals.push(...initialSavingsGoals);
    this.save();
  }

  // --- Users ---
  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u._id === id);
  }

  public createUser(user: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): User {
    const newUser: User = {
      ...user,
      _id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  // --- Profile ---
  public getProfileByUserId(userId: string): SmokingProfile | undefined {
    return this.data.profiles.find(p => p.userId === userId);
  }

  public createOrUpdateProfile(userId: string, profileData: Partial<SmokingProfile>): SmokingProfile {
    let profile = this.data.profiles.find(p => p.userId === userId);
    if (!profile) {
      profile = {
        _id: this.generateId(),
        userId,
        cigarettesPerDay: profileData.cigarettesPerDay || 10,
        cigarettesPerPack: profileData.cigarettesPerPack || 20,
        pricePerPack: profileData.pricePerPack || 100,
        currency: profileData.currency || '₹',
        yearsSmoked: profileData.yearsSmoked || 3,
        smokingType: profileData.smokingType || 'Cigarette',
        quitDate: profileData.quitDate || new Date().toISOString().split('T')[0],
        hasAlreadyQuit: profileData.hasAlreadyQuit ?? true,
        previousQuitAttempts: profileData.previousQuitAttempts || 0,
        longestSmokeFreePeriod: profileData.longestSmokeFreePeriod || 0,
        triggers: profileData.triggers || [],
        motivation: profileData.motivation || [],
        goals: profileData.goals || [],
        onboardingCompleted: profileData.onboardingCompleted ?? false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.data.profiles.push(profile);
    } else {
      Object.assign(profile, profileData, { updatedAt: new Date().toISOString() });
    }
    this.save();
    this.checkAndAwardAchievements(userId);
    return profile;
  }

  // --- Smoking Logs ---
  public getSmokingLogs(userId: string): SmokingLog[] {
    return this.data.smokingLogs
      .filter(l => l.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public addOrUpdateSmokingLog(userId: string, logData: {
    date: string;
    smoked: boolean;
    cigarettes: number;
    trigger?: string;
    cravingIntensity?: number;
    notes?: string;
    time?: string;
  }): SmokingLog {
    let log = this.data.smokingLogs.find(l => l.userId === userId && l.date === logData.date);
    if (log) {
      Object.assign(log, logData, { updatedAt: new Date().toISOString() });
    } else {
      log = {
        _id: this.generateId(),
        userId,
        ...logData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.data.smokingLogs.push(log);
    }
    this.save();
    this.checkAndAwardAchievements(userId);
    return log;
  }

  public deleteSmokingLog(userId: string, id: string): boolean {
    const idx = this.data.smokingLogs.findIndex(l => l._id === id && l.userId === userId);
    if (idx !== -1) {
      this.data.smokingLogs.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // --- Cravings ---
  public getCravings(userId: string): Craving[] {
    return this.data.cravings
      .filter(c => c.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addCraving(userId: string, cravingData: Omit<Craving, '_id' | 'userId' | 'createdAt'>): Craving {
    const newCraving: Craving = {
      _id: this.generateId(),
      userId,
      ...cravingData,
      createdAt: new Date().toISOString()
    };
    this.data.cravings.push(newCraving);
    this.save();
    this.checkAndAwardAchievements(userId);
    return newCraving;
  }

  // --- Achievements ---
  public getAchievements(userId: string): Achievement[] {
    return this.data.achievements
      .filter(a => a.userId === userId)
      .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime());
  }

  // --- Savings Goals ---
  public getSavingsGoals(userId: string): SavingsGoal[] {
    return this.data.savingsGoals.filter(s => s.userId === userId);
  }

  public addSavingsGoal(userId: string, goal: { name: string; targetAmount: number; icon?: string; category?: string }): SavingsGoal {
    const newGoal: SavingsGoal = {
      _id: this.generateId(),
      userId,
      ...goal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.savingsGoals.push(newGoal);
    this.save();
    return newGoal;
  }

  public updateSavingsGoal(userId: string, goalId: string, updates: Partial<SavingsGoal>): SavingsGoal | null {
    const goal = this.data.savingsGoals.find(g => g._id === goalId && g.userId === userId);
    if (goal) {
      Object.assign(goal, updates, { updatedAt: new Date().toISOString() });
      this.save();
      return goal;
    }
    return null;
  }

  public deleteSavingsGoal(userId: string, goalId: string): boolean {
    const idx = this.data.savingsGoals.findIndex(g => g._id === goalId && g.userId === userId);
    if (idx !== -1) {
      this.data.savingsGoals.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // --- Calculations & Achievement Triggering ---
  public calculateStats(userId: string): {
    smokeFreeDays: number;
    cigarettesAvoided: number;
    moneySaved: number;
    currentStreak: number;
    longestStreak: number;
    cravingsResisted: number;
    cravingsTotal: number;
    successRate: number;
    totalPoints: number;
    costPerCigarette: number;
    dailyExpense: number;
    monthlyExpense: number;
    yearlyExpense: number;
  } {
    const profile = this.getProfileByUserId(userId);
    const logs = this.getSmokingLogs(userId);
    const cravings = this.getCravings(userId);

    const cigarettesPerDay = profile?.cigarettesPerDay || 10;
    const cigarettesPerPack = profile?.cigarettesPerPack || 20;
    const pricePerPack = profile?.pricePerPack || 100;
    const costPerCigarette = pricePerPack / (cigarettesPerPack || 1);

    // Calculate days smoke-free from quit date or logs
    const now = new Date();
    let rawDaysSinceQuit = 0;
    let quitDate = now;

    if (profile?.quitDate) {
      const parts = profile.quitDate.split('-').map(Number);
      if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
        quitDate = new Date(parts[0], parts[1] - 1, parts[2]);
        const todayD = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const diffMs = todayD.getTime() - quitDate.getTime();
        rawDaysSinceQuit = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
      } else {
        const qDate = new Date(profile.quitDate);
        if (!isNaN(qDate.getTime())) {
          quitDate = qDate;
          rawDaysSinceQuit = Math.max(0, Math.floor((now.getTime() - qDate.getTime()) / (1000 * 60 * 60 * 24)));
        }
      }
    }
    
    // Count days where smoked === false
    const smokeFreeLogsCount = logs.filter(l => !l.smoked).length;
    const smokeFreeDays = Math.max(rawDaysSinceQuit, smokeFreeLogsCount);

    // Calculate current streak & longest streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Streaks calculation from logs
    for (let i = 0; i <= 60; i++) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dStr = d.toISOString().split('T')[0];
      const found = logs.find(l => l.date === dStr);

      if (found) {
        if (!found.smoked) {
          tempStreak++;
          if (tempStreak > longestStreak) longestStreak = tempStreak;
        } else {
          tempStreak = 0;
        }
      } else {
        // If prior to quit date, ignore; if after quit date and no log, consider smoke free
        if (d >= quitDate) {
          tempStreak++;
          if (tempStreak > longestStreak) longestStreak = tempStreak;
        }
      }
    }

    currentStreak = tempStreak;
    if (smokeFreeDays > longestStreak) longestStreak = smokeFreeDays;
    if (smokeFreeDays > currentStreak) currentStreak = smokeFreeDays;

    const cigarettesAvoided = smokeFreeDays * cigarettesPerDay;
    const moneySaved = cigarettesAvoided * costPerCigarette;

    // Cravings
    const cravingsTotal = cravings.length;
    const cravingsResisted = cravings.filter(c => !c.smokedAfterCraving && (c.result === 'gone' || c.result === 'reduced')).length;
    const successRate = cravingsTotal > 0 ? Math.round((cravingsResisted / cravingsTotal) * 100) : 100;

    // Points system:
    // Smoke-free day: +20
    // Craving resisted: +10
    // Exercise: +5
    // Breathing: +5
    // Craving logged: +2
    // 7-day streak: +100
    // 30-day streak: +500
    let totalPoints = smokeFreeDays * 20;
    cravings.forEach(c => {
      totalPoints += 2; // logged
      if (!c.smokedAfterCraving) totalPoints += 10;
      if (c.intervention === 'Quick Exercise') totalPoints += 5;
      if (c.intervention === 'Breathing') totalPoints += 5;
    });
    if (currentStreak >= 7) totalPoints += 100;
    if (currentStreak >= 30) totalPoints += 500;

    const dailyExpense = cigarettesPerDay * costPerCigarette;
    const monthlyExpense = dailyExpense * 30;
    const yearlyExpense = dailyExpense * 365;

    return {
      smokeFreeDays,
      cigarettesAvoided,
      moneySaved: Math.round(moneySaved),
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      cravingsResisted,
      cravingsTotal,
      successRate,
      totalPoints,
      costPerCigarette,
      dailyExpense: Math.round(dailyExpense),
      monthlyExpense: Math.round(monthlyExpense),
      yearlyExpense: Math.round(yearlyExpense)
    };
  }

  public checkAndAwardAchievements(userId: string) {
    const stats = this.calculateStats(userId);
    const existing = this.getAchievements(userId).map(a => a.achievementType);
    const now = new Date().toISOString();

    const candidates: { type: string; title: string; desc: string; icon: string; pts: number; cond: boolean }[] = [
      {
        type: 'first_day',
        title: 'First Step',
        desc: 'Completed your first 24 smoke-free hours.',
        icon: '🏅',
        pts: 20,
        cond: stats.smokeFreeDays >= 1
      },
      {
        type: 'streak_3',
        title: '3-Day Momentum',
        desc: '72 hours nicotine-free. Physical cravings start dropping.',
        icon: '⚡',
        pts: 40,
        cond: stats.currentStreak >= 3
      },
      {
        type: 'streak_7',
        title: '7-Day Champion',
        desc: 'Reaching a full week free of smoking!',
        icon: '🔥',
        pts: 100,
        cond: stats.currentStreak >= 7 || stats.longestStreak >= 7
      },
      {
        type: 'streak_14',
        title: 'Two Weeks Strong',
        desc: '14 consecutive smoke-free days achieved.',
        icon: '🌟',
        pts: 200,
        cond: stats.currentStreak >= 14 || stats.longestStreak >= 14
      },
      {
        type: 'streak_30',
        title: '30-Day Master',
        desc: 'One month milestone! Your circulation and lung cilia are healing.',
        icon: '🚭',
        pts: 500,
        cond: stats.currentStreak >= 30 || stats.longestStreak >= 30
      },
      {
        type: 'avoided_100',
        title: 'Century Milestone',
        desc: 'Successfully avoided smoking 100 cigarettes.',
        icon: '🛡️',
        pts: 50,
        cond: stats.cigarettesAvoided >= 100
      },
      {
        type: 'avoided_500',
        title: 'Half a Thousand',
        desc: '500 cigarettes avoided from entering your body.',
        icon: '🎯',
        pts: 150,
        cond: stats.cigarettesAvoided >= 500
      },
      {
        type: 'cravings_5',
        title: 'Craving Tamer',
        desc: 'Resisted 5 cravings using active rescue interventions.',
        icon: '🧠',
        pts: 40,
        cond: stats.cravingsResisted >= 5
      },
      {
        type: 'cravings_25',
        title: 'Iron Will',
        desc: 'Successfully conquered 25 cravings.',
        icon: '💪',
        pts: 150,
        cond: stats.cravingsResisted >= 25
      },
      {
        type: 'cravings_100',
        title: 'Unstoppable Mindset',
        desc: 'Overcame 100 cravings without smoking.',
        icon: '🏆',
        pts: 500,
        cond: stats.cravingsResisted >= 100
      },
      {
        type: 'saved_1000',
        title: 'Pocket Guardian',
        desc: 'Saved over ₹1,000 / $100 by not buying tobacco.',
        icon: '💰',
        pts: 50,
        cond: stats.moneySaved >= 1000
      },
      {
        type: 'saved_5000',
        title: 'Wealth Builder',
        desc: 'Saved over ₹5,000 from avoided cigarettes.',
        icon: '💎',
        pts: 200,
        cond: stats.moneySaved >= 5000
      }
    ];

    for (const c of candidates) {
      if (c.cond && !existing.includes(c.type)) {
        this.data.achievements.push({
          _id: this.generateId(),
          userId,
          achievementType: c.type,
          title: c.title,
          description: c.desc,
          icon: c.icon,
          points: c.pts,
          unlockedAt: now
        });
      }
    }
    this.save();
  }
}

export const db = new Database();
