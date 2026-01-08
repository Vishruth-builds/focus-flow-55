import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerMode, Task, PomodoroSession, Settings } from '@/types/pomodoro';
import { storage } from '@/lib/storage';

export function usePomodoro() {
  const [settings, setSettings] = useState<Settings>(storage.getSettings());
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(settings.focusDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [tasks, setTasks] = useState<Task[]>(storage.getTasks());
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<PomodoroSession[]>(storage.getSessions());
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const getDuration = useCallback((timerMode: TimerMode) => {
    switch (timerMode) {
      case 'focus':
        return settings.focusDuration * 60;
      case 'break':
        return settings.breakDuration * 60;
      case 'longBreak':
        return settings.longBreakDuration * 60;
    }
  }, [settings]);

  const totalTime = getDuration(mode);
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    storage.saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    storage.saveSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    storage.saveSettings(settings);
    if (!isRunning) {
      setTimeLeft(getDuration(mode));
    }
  }, [settings, mode, isRunning, getDuration]);

  const playSound = useCallback(() => {
    if (settings.soundEnabled) {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }
  }, [settings.soundEnabled]);

  const showNotification = useCallback((title: string, body: string) => {
    if (settings.notificationsEnabled && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/favicon.ico' });
      }
    }
  }, [settings.notificationsEnabled]);

  const completeSession = useCallback(() => {
    const session: PomodoroSession = {
      id: crypto.randomUUID(),
      taskId: activeTaskId || undefined,
      type: mode,
      duration: getDuration(mode),
      completedAt: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
    };
    
    setSessions(prev => [...prev, session]);

    if (mode === 'focus') {
      const newSessionsCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newSessionsCompleted);

      if (activeTaskId) {
        setTasks(prev => prev.map(task => 
          task.id === activeTaskId
            ? {
                ...task,
                completedPomodoros: task.completedPomodoros + 1,
                totalTimeSpent: task.totalTimeSpent + getDuration('focus'),
              }
            : task
        ));
      }

      playSound();
      
      if (newSessionsCompleted % settings.sessionsUntilLongBreak === 0) {
        setMode('longBreak');
        setTimeLeft(settings.longBreakDuration * 60);
        showNotification('Time for a long break!', 'Great work! Take a 15 minute break.');
      } else {
        setMode('break');
        setTimeLeft(settings.breakDuration * 60);
        showNotification('Time for a break!', 'Take a 5 minute break.');
      }

      if (settings.autoStartBreaks) {
        setIsRunning(true);
      } else {
        setIsRunning(false);
      }
    } else {
      playSound();
      setMode('focus');
      setTimeLeft(settings.focusDuration * 60);
      showNotification('Break is over!', 'Ready to focus again?');
      
      if (settings.autoStartFocus) {
        setIsRunning(true);
      } else {
        setIsRunning(false);
      }
    }
  }, [mode, sessionsCompleted, activeTaskId, settings, getDuration, playSound, showNotification]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            completeSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, completeSession]);

  const start = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    startTimeRef.current = Date.now();
    setIsRunning(true);
  };

  const pause = () => {
    setIsRunning(false);
  };

  const reset = () => {
    setIsRunning(false);
    setTimeLeft(getDuration(mode));
    startTimeRef.current = null;
  };

  const skip = () => {
    setIsRunning(false);
    if (mode === 'focus') {
      setMode('break');
      setTimeLeft(settings.breakDuration * 60);
    } else {
      setMode('focus');
      setTimeLeft(settings.focusDuration * 60);
    }
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(getDuration(newMode));
  };

  const addTask = (title: string, estimatedPomodoros: number = 1, scheduledDate?: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      estimatedPomodoros,
      completedPomodoros: 0,
      totalTimeSpent: 0,
      createdAt: new Date().toISOString(),
      scheduledDate,
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    if (activeTaskId === id) {
      setActiveTaskId(null);
    }
  };

  const toggleTaskComplete = (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return {
    // Timer state
    mode,
    timeLeft,
    isRunning,
    progress,
    sessionsCompleted,
    
    // Timer actions
    start,
    pause,
    reset,
    skip,
    switchMode,
    
    // Tasks
    tasks,
    activeTaskId,
    setActiveTaskId,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    
    // Sessions
    sessions,
    
    // Settings
    settings,
    updateSettings,
  };
}
