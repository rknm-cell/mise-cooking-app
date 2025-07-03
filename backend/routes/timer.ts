import express, { Request, Response } from 'express';
import { z } from "zod";

const router = express.Router();

// Schema for timer creation request
const createTimerSchema = z.object({
  duration: z.number().min(1, "Duration must be at least 1 second"),
  description: z.string().min(1, "Description is required"),
  stage: z.string().optional(),
  recipeId: z.string().optional(),
  stepNumber: z.number().optional(),
});

// Schema for timer response
const timerResponseSchema = z.object({
  timerId: z.string(),
  duration: z.number(),
  description: z.string(),
  stage: z.string(),
  message: z.string(),
  action: z.enum(["created", "started", "stopped", "completed"]),
});

// In-memory timer storage (in production, this would be in a database)
const activeTimers = new Map<string, {
  id: string;
  duration: number;
  description: string;
  stage: string;
  recipeId?: string;
  stepNumber?: number;
  startTime?: Date;
  isRunning: boolean;
  timeLeft: number;
}>();

// POST /api/timer/create - Create a new timer
router.post('/create', async (req: Request, res: Response) => {
  try {
    const validatedData = createTimerSchema.parse(req.body);
    const { duration, description, stage, recipeId, stepNumber } = validatedData;

    const timerId = `timer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const timer = {
      id: timerId,
      duration,
      description,
      stage: stage || `Step ${stepNumber || 1}`,
      recipeId,
      stepNumber,
      isRunning: true,
      startTime: new Date(),
      timeLeft: duration,
    };

    activeTimers.set(timerId, timer);

    const response = {
      timerId,
      duration,
      description,
      stage: timer.stage,
      message: `Timer started for ${description} (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')})`,
      action: "created" as const,
    };

    res.json(response);
  } catch (error) {
    console.error('Error creating timer:', error);
    res.status(400).json({ 
      error: 'Failed to create timer',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// POST /api/timer/start - Start a timer
router.post('/start', async (req: Request, res: Response) => {
  try {
    const { timerId } = req.body;

    if (!timerId) {
      return res.status(400).json({ error: 'Timer ID is required' });
    }

    const timer = activeTimers.get(timerId);
    if (!timer) {
      return res.status(404).json({ error: 'Timer not found' });
    }

    timer.isRunning = true;
    timer.startTime = new Date();

    const response = {
      timerId,
      duration: timer.duration,
      description: timer.description,
      stage: timer.stage,
      message: `Timer started for ${timer.description}`,
      action: "started" as const,
    };

    res.json(response);
  } catch (error) {
    console.error('Error starting timer:', error);
    res.status(500).json({ error: 'Failed to start timer' });
  }
});

// POST /api/timer/stop - Stop a timer
router.post('/stop', async (req: Request, res: Response) => {
  try {
    const { timerId } = req.body;

    if (!timerId) {
      return res.status(400).json({ error: 'Timer ID is required' });
    }

    const timer = activeTimers.get(timerId);
    if (!timer) {
      return res.status(404).json({ error: 'Timer not found' });
    }

    timer.isRunning = false;
    activeTimers.delete(timerId);

    const response = {
      timerId,
      duration: timer.duration,
      description: timer.description,
      stage: timer.stage,
      message: `Timer stopped for ${timer.description}`,
      action: "stopped" as const,
    };

    res.json(response);
  } catch (error) {
    console.error('Error stopping timer:', error);
    res.status(500).json({ error: 'Failed to stop timer' });
  }
});

// GET /api/timer/list - Get all active timers
router.get('/list', async (req: Request, res: Response) => {
  try {
    const timers = Array.from(activeTimers.values()).map(timer => ({
      id: timer.id,
      duration: timer.duration,
      description: timer.description,
      stage: timer.stage,
      isRunning: timer.isRunning,
      timeLeft: timer.timeLeft,
    }));

    res.json({ timers });
  } catch (error) {
    console.error('Error listing timers:', error);
    res.status(500).json({ error: 'Failed to list timers' });
  }
});

// GET /api/timer/:id - Get specific timer
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const timer = activeTimers.get(id);

    if (!timer) {
      return res.status(404).json({ error: 'Timer not found' });
    }

    res.json({
      id: timer.id,
      duration: timer.duration,
      description: timer.description,
      stage: timer.stage,
      isRunning: timer.isRunning,
      timeLeft: timer.timeLeft,
    });
  } catch (error) {
    console.error('Error getting timer:', error);
    res.status(500).json({ error: 'Failed to get timer' });
  }
});

// DELETE /api/timer/:id - Delete a timer
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const timer = activeTimers.get(id);

    if (!timer) {
      return res.status(404).json({ error: 'Timer not found' });
    }

    activeTimers.delete(id);

    res.json({
      message: `Timer for ${timer.description} has been removed`,
      action: "deleted" as const,
    });
  } catch (error) {
    console.error('Error deleting timer:', error);
    res.status(500).json({ error: 'Failed to delete timer' });
  }
});

export default router; 