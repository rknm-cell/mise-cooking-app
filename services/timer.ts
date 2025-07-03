// Timer service for frontend API calls

const API_BASE = __DEV__ 
  ? 'http://localhost:8080' 
  : 'https://mise-cooking-app-production.up.railway.app';

export interface TimerData {
  id: string;
  duration: number;
  description: string;
  stage: string;
  isRunning: boolean;
  timeLeft: number;
}

export interface CreateTimerRequest {
  duration: number;
  description: string;
  stage?: string;
  recipeId?: string;
  stepNumber?: number;
}

export interface TimerResponse {
  timerId: string;
  duration: number;
  description: string;
  stage: string;
  message: string;
  action: "created" | "started" | "stopped" | "completed";
}

// Create a new timer
export async function createTimer(timerData: CreateTimerRequest): Promise<TimerResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/timer/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(timerData),
    });

    if (!response.ok) {
      throw new Error('Failed to create timer');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating timer:', error);
    throw error;
  }
}

// Start a timer
export async function startTimer(timerId: string): Promise<TimerResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/timer/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ timerId }),
    });

    if (!response.ok) {
      throw new Error('Failed to start timer');
    }

    return await response.json();
  } catch (error) {
    console.error('Error starting timer:', error);
    throw error;
  }
}

// Stop a timer
export async function stopTimer(timerId: string): Promise<TimerResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/timer/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ timerId }),
    });

    if (!response.ok) {
      throw new Error('Failed to stop timer');
    }

    return await response.json();
  } catch (error) {
    console.error('Error stopping timer:', error);
    throw error;
  }
}

// Get all active timers
export async function getActiveTimers(): Promise<TimerData[]> {
  try {
    const response = await fetch(`${API_BASE}/api/timer/list`);

    if (!response.ok) {
      throw new Error('Failed to get timers');
    }

    const data = await response.json();
    return data.timers || [];
  } catch (error) {
    console.error('Error getting timers:', error);
    throw error;
  }
}

// Get a specific timer
export async function getTimer(timerId: string): Promise<TimerData> {
  try {
    const response = await fetch(`${API_BASE}/api/timer/${timerId}`);

    if (!response.ok) {
      throw new Error('Failed to get timer');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting timer:', error);
    throw error;
  }
}

// Delete a timer
export async function deleteTimer(timerId: string): Promise<{ message: string; action: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/timer/${timerId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete timer');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting timer:', error);
    throw error;
  }
} 