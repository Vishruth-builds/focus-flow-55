import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, Target } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { PomodoroSession, Task } from '@/types/pomodoro';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  sessions: PomodoroSession[];
  tasks: Task[];
  formatTime: (seconds: number) => string;
}

export function CalendarView({ sessions, tasks, formatTime }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getDayStats = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const daySessions = sessions.filter(s => s.date === dateStr && s.type === 'focus');
    const dayTasks = tasks.filter(t => t.scheduledDate === dateStr || t.createdAt.startsWith(dateStr));
    
    return {
      focusTime: daySessions.reduce((acc, s) => acc + s.duration, 0),
      sessions: daySessions.length,
      tasks: dayTasks.length,
      completedTasks: dayTasks.filter(t => t.completed).length,
    };
  };

  const selectedDayStats = selectedDate ? getDayStats(selectedDate) : null;
  const selectedDayTasks = selectedDate 
    ? tasks.filter(t => {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        return t.scheduledDate === dateStr || t.createdAt.startsWith(dateStr);
      })
    : [];

  return (
    <div className="w-full max-w-md space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Calendar</h2>

      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="text-lg font-medium">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-card rounded-lg border border-border p-4">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="text-center text-xs text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const stats = getDayStats(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const hasActivity = stats.sessions > 0;

            return (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  'relative aspect-square p-1 rounded-lg text-sm transition-all',
                  !isCurrentMonth && 'text-muted-foreground/30',
                  isCurrentMonth && 'text-foreground',
                  isToday && 'ring-2 ring-primary/50',
                  isSelected && 'bg-primary text-primary-foreground',
                  !isSelected && hasActivity && 'bg-primary/10',
                  !isSelected && !hasActivity && 'hover:bg-secondary'
                )}
              >
                <span className="font-medium">{format(day, 'd')}</span>
                {hasActivity && !isSelected && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {Array.from({ length: Math.min(stats.sessions, 4) }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 h-1 rounded-full bg-primary"
                      />
                    ))}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDate && selectedDayStats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-card rounded-lg border border-border"
        >
          <h4 className="font-medium mb-3">
            {format(selectedDate, 'EEEE, MMMM d')}
          </h4>
          
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock size={14} className="text-primary" />
              {formatTime(selectedDayStats.focusTime)}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target size={14} className="text-success" />
              {selectedDayStats.completedTasks}/{selectedDayStats.tasks} tasks
            </div>
          </div>

          {selectedDayTasks.length > 0 && (
            <div className="space-y-2">
              {selectedDayTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    'text-sm p-2 rounded-lg',
                    task.completed ? 'bg-success/10 text-muted-foreground line-through' : 'bg-secondary'
                  )}
                >
                  {task.title}
                </div>
              ))}
              {selectedDayTasks.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{selectedDayTasks.length - 3} more tasks
                </p>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
