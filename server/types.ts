export interface User {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface SmokingProfile {
  _id: string;
  userId: string;
  cigarettesPerDay: number;
  cigarettesPerPack: number;
  pricePerPack: number;
  currency: string;
  yearsSmoked: number;
  smokingType: 'Cigarette' | 'Bidi' | 'Vape' | 'Other';
  quitDate: string; // ISO date string or YYYY-MM-DD
  hasAlreadyQuit: boolean;
  previousQuitAttempts: number;
  longestSmokeFreePeriod: number; // in days
  triggers: string[];
  motivation: string[];
  goals: string[];
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SmokingLog {
  _id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  smoked: boolean;
  cigarettes: number;
  trigger?: string;
  cravingIntensity?: number; // 1-10
  notes?: string;
  time?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Craving {
  _id: string;
  userId: string;
  timestamp: string; // ISO string
  intensity: number; // 1 - 10
  trigger: string;
  environment?: string;
  intervention: 'Walk' | 'Water' | 'Breathing' | 'Quick Exercise' | 'Delay' | 'Other';
  interventionDuration: number; // in seconds
  result: 'gone' | 'reduced' | 'strong';
  smokedAfterCraving: boolean;
  notes?: string;
  createdAt: string;
}

export interface Achievement {
  _id: string;
  userId: string;
  achievementType: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt: string;
}

export interface SavingsGoal {
  _id: string;
  userId: string;
  name: string;
  targetAmount: number;
  icon?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  points: number;
  smokeFreeDays: number;
  cigarettesAvoided: number;
  moneySaved: number;
  currentStreak: number;
  longestStreak: number;
  cravingsResisted: number;
  cravingsTotal: number;
  successRate: number;
}
