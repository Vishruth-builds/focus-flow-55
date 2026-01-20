import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Target, Clock, CheckCircle2, AlertTriangle, Sparkles, Trophy } from 'lucide-react';
import { ProductivityReport as Report, Task, PomodoroSession } from '@/types/pomodoro';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO, subDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface ProductivityReportProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  sessions: PomodoroSession[];
  formatTime: (seconds: number) => string;
}

export function ProductivityReportModal({ isOpen, onClose, tasks, sessions, formatTime }: ProductivityReportProps) {
  const report = useMemo((): Report => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    
    // Filter sessions and tasks for this week
    const weekSessions = sessions.filter(s => {
      const sessionDate = parseISO(s.date);
      return s.type === 'focus' && isWithinInterval(sessionDate, { start: weekStart, end: weekEnd });
    });
    
    const weekTasks = tasks.filter(t => {
      const taskDate = parseISO(t.createdAt);
      return isWithinInterval(taskDate, { start: weekStart, end: weekEnd });
    });
    
    const tasksWithDeadlines = weekTasks.filter(t => t.deadline);
    const completedOnTime = tasksWithDeadlines.filter(t => 
      t.completed && t.deadline && new Date(t.createdAt) <= new Date(t.deadline)
    ).length;
    
    const totalFocusTime = weekSessions.reduce((acc, s) => acc + s.duration, 0);
    const sessionsCompleted = weekSessions.length;
    const tasksScheduled = weekTasks.length;
    const tasksCompleted = weekTasks.filter(t => t.completed).length;
    const completionRate = tasksScheduled > 0 ? (tasksCompleted / tasksScheduled) * 100 : 0;
    
    // Generate feedback based on performance
    let feedback = '';
    let suggestions: string[] = [];
    
    if (completionRate >= 80) {
      feedback = "🎉 Outstanding week! You've crushed your goals and shown incredible focus. Keep up the amazing momentum!";
      suggestions = [
        "Try challenging yourself with more complex tasks",
        "Consider mentoring others on your productivity habits",
        "Take time to celebrate your achievements!"
      ];
    } else if (completionRate >= 60) {
      feedback = "💪 Great progress this week! You're building solid habits and making consistent strides toward your goals.";
      suggestions = [
        "Break down larger tasks into smaller, manageable chunks",
        "Try the 2-minute rule: if it takes less than 2 minutes, do it now",
        "Schedule your most challenging tasks during peak energy hours"
      ];
    } else if (completionRate >= 40) {
      feedback = "📈 You're making progress! There's room for improvement, but every step counts. Let's optimize your workflow.";
      suggestions = [
        "Set realistic deadlines for your tasks",
        "Use time blocking to dedicate focus periods",
        "Eliminate distractions during focus sessions",
        "Start with your most important task each day"
      ];
    } else if (completionRate > 0) {
      feedback = "🌱 Every journey starts somewhere. Let's work on building stronger focus habits together.";
      suggestions = [
        "Start with just 2-3 tasks per day",
        "Break large goals into tiny, achievable steps",
        "Set reminders for your scheduled tasks",
        "Create a dedicated workspace free from distractions",
        "Try the Pomodoro technique with shorter sessions first"
      ];
    } else {
      feedback = "👋 Ready to start? Add some tasks and begin your productivity journey!";
      suggestions = [
        "Add your first task to get started",
        "Set a small, achievable goal for today",
        "Start with a single 25-minute focus session"
      ];
    }
    
    return {
      period: 'weekly',
      date: format(today, 'yyyy-MM-dd'),
      totalFocusTime,
      sessionsCompleted,
      tasksScheduled,
      tasksCompleted,
      goalsMet: completionRate >= 80,
      completionRate,
      feedback,
      suggestions
    };
  }, [tasks, sessions]);

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'text-success';
    if (rate >= 60) return 'text-primary';
    if (rate >= 40) return 'text-amber-500';
    return 'text-destructive';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 max-h-[90vh] overflow-y-auto"
          >
            <div className="glass-card p-6 rounded-2xl mx-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/20">
                    <Trophy size={24} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Weekly Report</h2>
                    <p className="text-sm text-muted-foreground">
                      Week of {format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'MMM d')} - {format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'MMM d')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-4 rounded-xl bg-secondary/50"
                >
                  <Clock size={20} className="text-primary mb-2" />
                  <p className="text-2xl font-bold text-foreground">{formatTime(report.totalFocusTime)}</p>
                  <p className="text-xs text-muted-foreground">Total Focus Time</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="p-4 rounded-xl bg-secondary/50"
                >
                  <Target size={20} className="text-success mb-2" />
                  <p className="text-2xl font-bold text-foreground">{report.sessionsCompleted}</p>
                  <p className="text-xs text-muted-foreground">Sessions Completed</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 rounded-xl bg-secondary/50"
                >
                  <CheckCircle2 size={20} className="text-accent mb-2" />
                  <p className="text-2xl font-bold text-foreground">
                    {report.tasksCompleted}/{report.tasksScheduled}
                  </p>
                  <p className="text-xs text-muted-foreground">Tasks Completed</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="p-4 rounded-xl bg-secondary/50"
                >
                  <TrendingUp size={20} className={cn("mb-2", getCompletionColor(report.completionRate))} />
                  <p className={cn("text-2xl font-bold", getCompletionColor(report.completionRate))}>
                    {Math.round(report.completionRate)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Completion Rate</p>
                </motion.div>
              </div>

              {/* Feedback */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 mb-6"
              >
                <div className="flex items-start gap-3">
                  <Sparkles size={20} className="text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground leading-relaxed">{report.feedback}</p>
                </div>
              </motion.div>

              {/* Suggestions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-500" />
                  Tips for Next Week
                </h3>
                <ul className="space-y-2">
                  {report.suggestions.map((suggestion, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      {suggestion}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
