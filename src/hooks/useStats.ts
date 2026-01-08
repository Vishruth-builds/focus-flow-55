import { useMemo } from 'react';
import { PomodoroSession, Task, DailyStats } from '@/types/pomodoro';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval, parseISO } from 'date-fns';

export function useStats(sessions: PomodoroSession[], tasks: Task[]) {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const todayStats = useMemo(() => {
    const todaySessions = sessions.filter(s => s.date === today && s.type === 'focus');
    return {
      totalFocusTime: todaySessions.reduce((acc, s) => acc + s.duration, 0),
      sessionsCompleted: todaySessions.length,
      tasksCompleted: tasks.filter(t => t.completed && t.createdAt.startsWith(today)).length,
    };
  }, [sessions, tasks, today]);

  const weeklyStats = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    
    const weekSessions = sessions.filter(s => {
      const sessionDate = parseISO(s.date);
      return s.type === 'focus' && isWithinInterval(sessionDate, { start: weekStart, end: weekEnd });
    });

    return {
      totalFocusTime: weekSessions.reduce((acc, s) => acc + s.duration, 0),
      sessionsCompleted: weekSessions.length,
      avgFocusTimePerDay: weekSessions.reduce((acc, s) => acc + s.duration, 0) / 7,
    };
  }, [sessions]);

  const last7Days = useMemo((): DailyStats[] => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    });

    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const daySessions = sessions.filter(s => s.date === dateStr && s.type === 'focus');
      
      return {
        date: dateStr,
        totalFocusTime: daySessions.reduce((acc, s) => acc + s.duration, 0),
        sessionsCompleted: daySessions.length,
        tasksCompleted: tasks.filter(t => 
          t.completed && t.createdAt.startsWith(dateStr)
        ).length,
      };
    });
  }, [sessions, tasks]);

  const averageDailyFocusTime = useMemo(() => {
    const daysWithSessions = last7Days.filter(d => d.totalFocusTime > 0);
    if (daysWithSessions.length === 0) return 0;
    return daysWithSessions.reduce((acc, d) => acc + d.totalFocusTime, 0) / daysWithSessions.length;
  }, [last7Days]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return {
    todayStats,
    weeklyStats,
    last7Days,
    averageDailyFocusTime,
    formatTime,
  };
}
