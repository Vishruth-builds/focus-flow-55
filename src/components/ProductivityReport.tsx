import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, TrendingUp, Target, Clock, CheckCircle2, AlertTriangle, Sparkles, Trophy } from 'lucide-react';
import { ProductivityReport as Report, Task, PomodoroSession } from '@/types/pomodoro';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
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
    
    const weekSessions = sessions.filter(s => {
      const sessionDate = parseISO(s.date);
      return s.type === 'focus' && isWithinInterval(sessionDate, { start: weekStart, end: weekEnd });
    });
    
    const weekTasks = tasks.filter(t => {
      const taskDate = parseISO(t.createdAt);
      return isWithinInterval(taskDate, { start: weekStart, end: weekEnd });
    });
    
    const totalFocusTime = weekSessions.reduce((acc, s) => acc + s.duration, 0);
    const sessionsCompleted = weekSessions.length;
    const tasksScheduled = weekTasks.length;
    const tasksCompleted = weekTasks.filter(t => t.completed).length;
    const completionRate = tasksScheduled > 0 ? (tasksCompleted / tasksScheduled) * 100 : 0;
    
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative h-full flex flex-col overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center gap-4 p-6 border-b border-border sticky top-0 bg-background/80 backdrop-blur-lg z-10">
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-secondary transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
                  <Trophy size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Weekly Report</h1>
                  <p className="text-sm text-muted-foreground">
                    Week of {format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'MMM d')} - {format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'MMM d')}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-6 rounded-2xl bg-secondary/50 backdrop-blur-sm border border-border/50"
                >
                  <Clock size={28} className="text-primary mb-3" />
                  <p className="text-3xl font-bold text-foreground">{formatTime(report.totalFocusTime)}</p>
                  <p className="text-sm text-muted-foreground mt-1">Total Focus Time</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="p-6 rounded-2xl bg-secondary/50 backdrop-blur-sm border border-border/50"
                >
                  <Target size={28} className="text-success mb-3" />
                  <p className="text-3xl font-bold text-foreground">{report.sessionsCompleted}</p>
                  <p className="text-sm text-muted-foreground mt-1">Sessions Completed</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-6 rounded-2xl bg-secondary/50 backdrop-blur-sm border border-border/50"
                >
                  <CheckCircle2 size={28} className="text-accent mb-3" />
                  <p className="text-3xl font-bold text-foreground">
                    {report.tasksCompleted}/{report.tasksScheduled}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Tasks Completed</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="p-6 rounded-2xl bg-secondary/50 backdrop-blur-sm border border-border/50"
                >
                  <TrendingUp size={28} className={cn("mb-3", getCompletionColor(report.completionRate))} />
                  <p className={cn("text-3xl font-bold", getCompletionColor(report.completionRate))}>
                    {Math.round(report.completionRate)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Completion Rate</p>
                </motion.div>
              </div>

              {/* Feedback */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/20">
                    <Sparkles size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Your Weekly Summary</h3>
                    <p className="text-foreground leading-relaxed">{report.feedback}</p>
                  </div>
                </div>
              </motion.div>

              {/* Suggestions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="p-6 rounded-2xl bg-secondary/30 border border-border/50"
              >
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-amber-500" />
                  Tips for Next Week
                </h3>
                <ul className="space-y-3">
                  {report.suggestions.map((suggestion, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="flex items-start gap-3 text-foreground"
                    >
                      <span className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent text-white text-xs flex items-center justify-center shrink-0 mt-0.5 font-medium">
                        {index + 1}
                      </span>
                      {suggestion}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
