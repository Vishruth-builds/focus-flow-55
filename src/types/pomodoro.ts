export type TimerMode = 'focus' | 'break' | 'longBreak';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  estimatedPomodoros: number;
  completedPomodoros: number;
  totalTimeSpent: number; // in seconds
  createdAt: string;
  scheduledDate?: string;
  deadline?: string; // ISO date string for when task should be completed
  notes?: string;
}

export interface PomodoroSession {
  id: string;
  taskId?: string;
  type: TimerMode;
  duration: number; // in seconds
  completedAt: string;
  date: string; // YYYY-MM-DD format
}

export interface Settings {
  focusDuration: number; // in minutes
  breakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface DailyStats {
  date: string;
  totalFocusTime: number; // in seconds
  sessionsCompleted: number;
  tasksCompleted: number;
}

export interface WeeklyStats {
  weekStart: string;
  totalFocusTime: number;
  sessionsCompleted: number;
  tasksCompleted: number;
  dailyBreakdown: DailyStats[];
}

export interface ProductivityReport {
  period: 'daily' | 'weekly';
  date: string;
  totalFocusTime: number;
  sessionsCompleted: number;
  tasksScheduled: number;
  tasksCompleted: number;
  goalsMet: boolean;
  completionRate: number;
  feedback: string;
  suggestions: string[];
}
