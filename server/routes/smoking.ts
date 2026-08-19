import { Router, Response } from 'express';
import { db } from '../db.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';

export const smokingRouter = Router();

smokingRouter.use(authMiddleware);

// GET /api/smoking/logs
smokingRouter.get('/logs', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const logs = db.getSmokingLogs(req.userId!);
    res.json({
      success: true,
      data: logs
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Error fetching smoking logs' });
  }
});

// POST /api/smoking/log (Daily check-in / manual log)
smokingRouter.post('/log', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { date, smoked, cigarettes, trigger, cravingIntensity, notes, time } = req.body;

    const logDate = date || new Date().toISOString().split('T')[0];
    const isSmoked = Boolean(smoked);
    const count = isSmoked ? (Number(cigarettes) || 1) : 0;

    const log = db.addOrUpdateSmokingLog(req.userId!, {
      date: logDate,
      smoked: isSmoked,
      cigarettes: count,
      trigger: isSmoked ? trigger : undefined,
      cravingIntensity: cravingIntensity ? Number(cravingIntensity) : undefined,
      notes,
      time: time || new Date().toTimeString().split(' ')[0]
    });

    const stats = db.calculateStats(req.userId!);

    res.json({
      success: true,
      data: {
        log,
        stats
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Error saving smoking log' });
  }
});

// PUT /api/smoking/log/:id
smokingRouter.put('/log/:id', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { smoked, cigarettes, trigger, cravingIntensity, notes, time } = req.body;

    const logs = db.getSmokingLogs(req.userId!);
    const existing = logs.find(l => l._id === id);

    if (!existing) {
      res.status(404).json({ success: false, message: 'Smoking log not found' });
      return;
    }

    const isSmoked = smoked !== undefined ? Boolean(smoked) : existing.smoked;
    const count = isSmoked ? (cigarettes !== undefined ? Number(cigarettes) : existing.cigarettes) : 0;

    const updated = db.addOrUpdateSmokingLog(req.userId!, {
      date: existing.date,
      smoked: isSmoked,
      cigarettes: count,
      trigger: trigger !== undefined ? trigger : existing.trigger,
      cravingIntensity: cravingIntensity !== undefined ? Number(cravingIntensity) : existing.cravingIntensity,
      notes: notes !== undefined ? notes : existing.notes,
      time: time || existing.time
    });

    res.json({
      success: true,
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Error updating smoking log' });
  }
});

// DELETE /api/smoking/log/:id
smokingRouter.delete('/log/:id', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const deleted = db.deleteSmokingLog(req.userId!, id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Log not found or unauthorized' });
      return;
    }
    res.json({
      success: true,
      message: 'Log deleted successfully'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Error deleting smoking log' });
  }
});
