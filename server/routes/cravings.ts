import { Router, Response } from 'express';
import { db } from '../db.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';

export const cravingsRouter = Router();

cravingsRouter.use(authMiddleware);

// GET /api/cravings
cravingsRouter.get('/', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const cravings = db.getCravings(req.userId!);
    res.json({
      success: true,
      data: cravings
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Error fetching cravings' });
  }
});

// POST /api/cravings (Record craving rescue event)
cravingsRouter.post('/', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const {
      intensity,
      trigger,
      environment,
      intervention,
      interventionDuration,
      result,
      smokedAfterCraving,
      notes,
      timestamp
    } = req.body;

    if (!trigger || !intervention || !result) {
      res.status(400).json({ success: false, message: 'Trigger, intervention and result are required' });
      return;
    }

    const craving = db.addCraving(req.userId!, {
      timestamp: timestamp || new Date().toISOString(),
      intensity: Number(intensity) || 5,
      trigger,
      environment: environment || 'Other',
      intervention: intervention || 'Breathing',
      interventionDuration: Number(interventionDuration) || 0,
      result: result || 'gone',
      smokedAfterCraving: Boolean(smokedAfterCraving),
      notes
    });

    const stats = db.calculateStats(req.userId!);
    const achievements = db.getAchievements(req.userId!);

    res.status(201).json({
      success: true,
      data: {
        craving,
        stats,
        achievements
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Error saving craving record' });
  }
});

// GET /api/cravings/analytics
cravingsRouter.get('/analytics', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const cravings = db.getCravings(req.userId!);
    const total = cravings.length;

    if (total === 0) {
      res.json({
        success: true,
        data: {
          totalCravings: 0,
          averageIntensity: 0,
          cravingsResisted: 0,
          cravingsSmoked: 0,
          resistanceSuccessRate: 100,
          mostCommonTrigger: 'None logged yet',
          mostCommonTimeSlot: 'None',
          mostSuccessfulIntervention: 'None',
          worstTrigger: 'None',
          triggerDistribution: [],
          interventionSuccessMap: {},
          timeDistribution: { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 },
          insights: ['Keep logging cravings to unlock personalized behavioral insights.']
        }
      });
      return;
    }

    // 1. Average intensity
    const avgIntensity = Number((cravings.reduce((sum, c) => sum + (c.intensity || 5), 0) / total).toFixed(1));

    // 2. Resisted vs Smoked
    const cravingsResisted = cravings.filter(c => !c.smokedAfterCraving && (c.result === 'gone' || c.result === 'reduced')).length;
    const cravingsSmoked = cravings.filter(c => c.smokedAfterCraving).length;
    const resistanceSuccessRate = Math.round((cravingsResisted / total) * 100);

    // 3. Trigger distribution
    const triggerCounts: Record<string, number> = {};
    const triggerSmokedCounts: Record<string, number> = {};

    cravings.forEach(c => {
      triggerCounts[c.trigger] = (triggerCounts[c.trigger] || 0) + 1;
      if (c.smokedAfterCraving) {
        triggerSmokedCounts[c.trigger] = (triggerSmokedCounts[c.trigger] || 0) + 1;
      }
    });

    const triggerDistribution = Object.entries(triggerCounts).map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / total) * 100)
    })).sort((a, b) => b.value - a.value);

    const mostCommonTrigger = triggerDistribution[0]?.name || 'Unknown';

    // Worst trigger
    let worstTrigger = 'None';
    let maxSmokedRate = -1;
    for (const [trig, smk] of Object.entries(triggerSmokedCounts)) {
      const rate = smk / (triggerCounts[trig] || 1);
      if (rate > maxSmokedRate) {
        maxSmokedRate = rate;
        worstTrigger = trig;
      }
    }

    // 4. Interventions effectiveness
    const interventionStats: Record<string, { total: number; resisted: number }> = {};
    cravings.forEach(c => {
      if (!interventionStats[c.intervention]) {
        interventionStats[c.intervention] = { total: 0, resisted: 0 };
      }
      interventionStats[c.intervention].total += 1;
      if (!c.smokedAfterCraving && (c.result === 'gone' || c.result === 'reduced')) {
        interventionStats[c.intervention].resisted += 1;
      }
    });

    let bestIntervention = 'Walk';
    let bestInterventionRate = -1;
    for (const [name, data] of Object.entries(interventionStats)) {
      const rate = data.resisted / data.total;
      if (rate > bestInterventionRate && data.total >= 1) {
        bestInterventionRate = rate;
        bestIntervention = name;
      }
    }

    // 5. Time of day analysis
    const timeSlots = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
    cravings.forEach(c => {
      const hour = new Date(c.timestamp).getHours();
      if (hour >= 5 && hour < 12) timeSlots.Morning++;
      else if (hour >= 12 && hour < 17) timeSlots.Afternoon++;
      else if (hour >= 17 && hour < 22) timeSlots.Evening++;
      else timeSlots.Night++;
    });

    let mostCommonTimeSlot = 'Evening (5 PM - 10 PM)';
    let maxSlotCount = -1;
    for (const [slot, count] of Object.entries(timeSlots)) {
      if (count > maxSlotCount) {
        maxSlotCount = count;
        mostCommonTimeSlot = slot;
      }
    }

    // 6. Generate Rule-Based Deterministic Insights
    const insights: string[] = [];
    if (total < 3) {
      insights.push('Keep logging cravings to unlock personalized behavioral insights.');
    } else {
      if (mostCommonTrigger) {
        insights.push(`"${mostCommonTrigger}" is your most frequent craving trigger (${triggerDistribution[0].percentage}% of logs).`);
      }
      if (bestIntervention && interventionStats[bestIntervention]) {
        const pct = Math.round((interventionStats[bestIntervention].resisted / interventionStats[bestIntervention].total) * 100);
        insights.push(`"${bestIntervention}" has been your most effective intervention with a ${pct}% resistance rate.`);
      }
      insights.push(`Most cravings strike during the ${mostCommonTimeSlot.toLowerCase()} hours.`);
      
      const last10 = cravings.slice(0, 10);
      const last10Resisted = last10.filter(c => !c.smokedAfterCraving).length;
      insights.push(`You successfully resisted ${last10Resisted} of your last ${last10.length} recorded cravings.`);
    }

    res.json({
      success: true,
      data: {
        totalCravings: total,
        averageIntensity: avgIntensity,
        cravingsResisted,
        cravingsSmoked,
        resistanceSuccessRate,
        mostCommonTrigger,
        mostCommonTimeSlot,
        mostSuccessfulIntervention: bestIntervention,
        worstTrigger,
        triggerDistribution,
        interventionStats,
        timeSlots,
        insights
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Error generating craving analytics' });
  }
});
