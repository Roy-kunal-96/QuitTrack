import { Router, Response } from 'express';
import { db } from '../db.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';

export const analyticsRouter = Router();

analyticsRouter.use(authMiddleware);

// GET /api/analytics/smoking
analyticsRouter.get('/smoking', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.userId!;
    const profile = db.getProfileByUserId(userId);
    const logs = db.getSmokingLogs(userId);
    const cravings = db.getCravings(userId);

    const now = new Date();
    const quitDate = profile?.quitDate ? new Date(profile.quitDate) : now;

    // Build 30-day timeline
    const timeline = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      const log = logs.find(l => l.date === dateStr);
      const dayCravings = cravings.filter(c => c.timestamp.startsWith(dateStr));
      const avgCravingIntensity = dayCravings.length > 0
        ? Number((dayCravings.reduce((acc, c) => acc + c.intensity, 0) / dayCravings.length).toFixed(1))
        : 0;

      let status: 'smoke_free' | 'smoked' | 'unrecorded';
      let cigarettes = 0;

      if (log) {
        status = log.smoked ? 'smoked' : 'smoke_free';
        cigarettes = log.cigarettes || 0;
      } else {
        status = d >= quitDate ? 'smoke_free' : 'unrecorded';
      }

      timeline.push({
        date: dateStr,
        dayLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        status,
        cigarettes,
        baseline: profile?.cigarettesPerDay || 10,
        cravingsCount: dayCravings.length,
        avgCravingIntensity
      });
    }

    res.json({
      success: true,
      data: {
        timeline,
        baselinePerDay: profile?.cigarettesPerDay || 10
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Error fetching smoking analytics' });
  }
});

// GET /api/analytics/financial
analyticsRouter.get('/financial', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.userId!;
    const profile = db.getProfileByUserId(userId);
    const stats = db.calculateStats(userId);

    const cigarettesPerDay = profile?.cigarettesPerDay || 10;
    const cigarettesPerPack = profile?.cigarettesPerPack || 20;
    const pricePerPack = profile?.pricePerPack || 100;
    const currency = profile?.currency || '₹';
    const costPerCigarette = pricePerPack / (cigarettesPerPack || 1);

    const dailyCost = cigarettesPerDay * costPerCigarette;
    const weeklyCost = dailyCost * 7;
    const monthlyCost = dailyCost * 30;
    const yearlyCost = dailyCost * 365;
    const fiveYearCost = yearlyCost * 5;

    // Projected savings curve
    const projections = [
      { period: '1 Month', days: 30, amount: Math.round(dailyCost * 30) },
      { period: '3 Months', days: 90, amount: Math.round(dailyCost * 90) },
      { period: '6 Months', days: 180, amount: Math.round(dailyCost * 180) },
      { period: '1 Year', days: 365, amount: Math.round(dailyCost * 365) },
      { period: '5 Years', days: 1825, amount: Math.round(dailyCost * 1825) }
    ];

    res.json({
      success: true,
      data: {
        currency,
        costPerCigarette: Number(costPerCigarette.toFixed(2)),
        currentSaved: stats.moneySaved,
        dailyCost: Math.round(dailyCost),
        weeklyCost: Math.round(weeklyCost),
        monthlyCost: Math.round(monthlyCost),
        yearlyCost: Math.round(yearlyCost),
        fiveYearCost: Math.round(fiveYearCost),
        projections
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Error fetching financial analytics' });
  }
});

// GET /api/analytics/health
analyticsRouter.get('/health', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.userId!;
    const profile = db.getProfileByUserId(userId);
    const stats = db.calculateStats(userId);

    let quitDateObj = profile?.quitDate ? new Date(profile.quitDate) : new Date();
    if (isNaN(quitDateObj.getTime())) quitDateObj = new Date();

    const diffMs = Math.max(0, Date.now() - quitDateObj.getTime());
    let totalMinutes = diffMs / (1000 * 60);

    // Sync with smokeFreeDays if confirmed streak or logs exceed raw calendar diff
    if (stats.smokeFreeDays > 0) {
      const recordedMinutes = stats.smokeFreeDays * 24 * 60;
      if (recordedMinutes > totalMinutes) {
        totalMinutes = recordedMinutes;
      }
    }

    const totalHours = totalMinutes / 60;
    const totalDays = totalHours / 24;

    const milestones = [
      {
        id: '20_min',
        title: 'Heart Rate & Blood Pressure Drop',
        timeLabel: '20 Minutes',
        targetMinutes: 20,
        category: 'Cardiovascular',
        description: 'Within just 20 minutes of your last cigarette, your pulse and arterial blood pressure begin dropping back to baseline resting levels.',
        benefit: 'Peripheral circulation in hands and feet begins warming up immediately.'
      },
      {
        id: '8_hours',
        title: 'Oxygen Level Normalization',
        timeLabel: '8 Hours',
        targetMinutes: 8 * 60,
        category: 'Blood Chemistry',
        description: 'Carbon monoxide in your bloodstream drops by over 50%, allowing oxygen levels to rise back to healthy normal saturation.',
        benefit: 'Tissues, muscles, and brain cells receive substantially richer oxygen.'
      },
      {
        id: '12_hours',
        title: 'Carbon Monoxide Clears',
        timeLabel: '12 Hours',
        targetMinutes: 12 * 60,
        category: 'Blood Chemistry',
        description: 'Carbon monoxide level in your blood drops completely to non-smoker normal range. Red blood cells bind freely with fresh oxygen.',
        benefit: 'Heart workload decreases noticeably; cellular energy production improves.'
      },
      {
        id: '24_hours',
        title: 'Heart Attack Risk Drops',
        timeLabel: '24 Hours (1 Day)',
        targetMinutes: 24 * 60,
        category: 'Cardiovascular',
        description: 'Excess toxic gases are cleared. Your sudden risk of smoking-induced myocardial infarction (heart attack) begins to plummet.',
        benefit: 'Lungs start expelling residual smoke mucus, tar particles, and debris.'
      },
      {
        id: '48_hours',
        title: 'Nerve Regeneration & Taste Rebound',
        timeLabel: '48 Hours (2 Days)',
        targetMinutes: 48 * 60,
        category: 'Sensory',
        description: 'Damaged sensory nerve endings begin actively regenerating. Olfactory and gustatory receptors regain acuity.',
        benefit: 'Food aromas and subtle flavor profiles become rich, vibrant, and distinct.'
      },
      {
        id: '72_hours',
        title: 'Nicotine Cleared & Easier Breathing',
        timeLabel: '72 Hours (3 Days)',
        targetMinutes: 72 * 60,
        category: 'Respiratory',
        description: '100% of chemical nicotine has been metabolized and excreted from your body. Bronchial tree tubes relax and open wider.',
        benefit: 'Peak chemical withdrawal ends; breathing depth increases significantly.'
      },
      {
        id: '2_weeks',
        title: 'Circulation & Athletic Stamina Rebound',
        timeLabel: '2 Weeks',
        targetMinutes: 14 * 24 * 60,
        category: 'Circulation',
        description: 'Cardiovascular circulation and blood flow to extremities improve by up to 25%. Walking, stairs, and exercise require less effort.',
        benefit: 'Physical stamina rebounds; leg cramps and shortness of breath diminish.'
      },
      {
        id: '1_month',
        title: 'Cilia Regrowth & Deep Lung Cleaning',
        timeLabel: '1 Month',
        targetMinutes: 30 * 24 * 60,
        category: 'Respiratory',
        description: 'Microscopic hair-like cilia lining your airways are fully reactivated and growing, sweeping away trapped contaminants and phlegm.',
        benefit: 'Chest congestion decreases; natural lung self-cleaning defense is restored.'
      },
      {
        id: '3_months',
        title: 'Lung Capacity & Function Surge',
        timeLabel: '3 Months',
        targetMinutes: 90 * 24 * 60,
        category: 'Respiratory',
        description: 'Spirometry lung function tests show an improvement of up to 10%. Overall immune resistance to seasonal respiratory bugs strengthens.',
        benefit: 'Wheezing, sinus congestion, and chronic morning smoker cough vanish.'
      },
      {
        id: '9_months',
        title: 'Airway Remodeling & Full Cilia Healing',
        timeLabel: '9 Months',
        targetMinutes: 270 * 24 * 60,
        category: 'Respiratory',
        description: 'Airway inflammation has subsided. The cilia throughout the bronchial tree are entirely healed and operating at full biological capacity.',
        benefit: 'Risk of bronchitis, pneumonia, and respiratory infections drops sharply.'
      },
      {
        id: '1_year',
        title: 'Coronary Disease Risk Cut in Half',
        timeLabel: '1 Year',
        targetMinutes: 365 * 24 * 60,
        category: 'Cardiovascular',
        description: 'Your excess risk of developing coronary heart disease, angina, and heart attack drops to 50% compared to an active smoker.',
        benefit: 'Major structural arterial repair and plaque stabilization achieved.'
      },
      {
        id: '5_years',
        title: 'Stroke Risk Normalizes to Non-Smoker',
        timeLabel: '5 Years',
        targetMinutes: 5 * 365 * 24 * 60,
        category: 'Long-term',
        description: 'Arterial blood vessels widen and loosen stiffened muscular walls. Your risk of ischemic stroke drops to that of a non-smoker.',
        benefit: 'Risk of mouth, throat, esophagus, and bladder cancers is cut by 50%.'
      },
      {
        id: '10_years',
        title: 'Lung Cancer Mortality Cut in Half',
        timeLabel: '10 Years',
        targetMinutes: 10 * 365 * 24 * 60,
        category: 'Long-term',
        description: 'Your risk of dying from lung cancer is roughly 50% that of someone who still smokes. Precancerous cells are replaced with healthy cells.',
        benefit: 'Dramatic reduction in pancreatic, kidney, and laryngeal cancer risks.'
      },
      {
        id: '15_years',
        title: 'Heart Disease Risk Matches Non-Smoker',
        timeLabel: '15 Years',
        targetMinutes: 15 * 365 * 24 * 60,
        category: 'Long-term',
        description: 'Your risk of coronary heart disease and coronary death is now exactly identical to someone who has never smoked a single cigarette in their life.',
        benefit: 'Complete cardiovascular lifespan parity restored.'
      }
    ];

    const milestonesWithProgress = milestones.map(m => {
      const progress = Math.min(100, Math.round((totalMinutes / m.targetMinutes) * 100));
      return {
        ...m,
        progress,
        isCompleted: progress >= 100
      };
    });

    const completedCount = milestonesWithProgress.filter(m => m.isCompleted).length;

    res.json({
      success: true,
      data: {
        totalMinutes: Math.round(totalMinutes),
        totalHours: Number(totalHours.toFixed(1)),
        totalDays: Number(totalDays.toFixed(1)),
        completedCount,
        totalMilestones: milestones.length,
        milestones: milestonesWithProgress,
        disclaimer: 'This app provides tracking and general educational information based on standard public health guidelines. It does not measure your actual health or provide medical advice.'
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Error fetching health analytics' });
  }
});
