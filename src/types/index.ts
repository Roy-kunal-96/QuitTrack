export interface User {
  id: string;
  name: string;
  email: string;
}

export interface SmokingProfile {
  _id?: string;
  userId?: string;
  cigarettesPerDay: number;
  cigarettesPerPack: number;
  pricePerPack: number;
  currency: string;
  yearsSmoked: number;
  smokingType: 'Cigarette' | 'Bidi' | 'Vape' | 'Other';
  quitDate: string;
  hasAlreadyQuit: boolean;
  previousQuitAttempts: number;
  longestSmokeFreePeriod: number;
  triggers: string[];
  motivation: string[];
  goals: string[];
  onboardingCompleted: boolean;
}

export interface SmokingLog {
  _id: string;
  userId: string;
  date: string;
  smoked: boolean;
  cigarettes: number;
  trigger?: string;
  cravingIntensity?: number;
  notes?: string;
  time?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Craving {
  _id: string;
  userId: string;
  timestamp: string;
  intensity: number;
  trigger: string;
  environment?: string;
  intervention: 'Walk' | 'Water' | 'Breathing' | 'Quick Exercise' | 'Delay' | 'Other';
  interventionDuration: number;
  result: 'gone' | 'reduced' | 'strong';
  smokedAfterCraving: boolean;
  notes?: string;
  createdAt: string;
}

export interface AchievementItem {
  id?: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  progress: number;
  category?: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export type Achievement = AchievementItem;

export interface SavingsGoalItem {
  _id: string;
  userId?: string;
  name: string;
  targetAmount: number;
  icon?: string;
  category?: string;
  currentSaved: number;
  savedTowardsGoal: number;
  progressPercent: number;
  remainingAmount: number;
  daysToGoal: number;
  monthsToGoal: number;
  isCompleted: boolean;
}

export interface UserStats {
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
}

export interface DashboardData {
  profile: SmokingProfile;
  stats: UserStats;
  todayLog: SmokingLog | null;
  recentCravings: Craving[];
  topTriggers: { name: string; count: number }[];
  achievementsCount: number;
  hoursSinceQuit: number;
}

export interface HealthMilestone {
  id: string;
  title: string;
  timeLabel: string;
  targetMinutes: number;
  category: string;
  description: string;
  benefit: string;
  progress: number;
  isCompleted: boolean;
}

export interface CravingAnalytics {
  totalCravings: number;
  averageIntensity: number;
  cravingsResisted: number;
  cravingsSmoked: number;
  resistanceSuccessRate: number;
  mostCommonTrigger: string;
  mostCommonTimeSlot: string;
  mostSuccessfulIntervention: string;
  worstTrigger: string;
  triggerDistribution: { name: string; value: number; percentage: number }[];
  interventionStats: Record<string, { total: number; resisted: number }>;
  timeSlots: { Morning: number; Afternoon: number; Evening: number; Night: number };
  insights: string[];
}
