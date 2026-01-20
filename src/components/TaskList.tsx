import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Trash2, Clock, Target, CalendarIcon, AlertCircle } from 'lucide-react';
import { Task } from '@/types/pomodoro';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format, isPast, isToday, isTomorrow, parseISO } from 'date-fns';

interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  onSelectTask: (id: string | null) => void;
  onAddTask: (title: string, estimatedPomodoros: number, scheduledDate?: string) => void;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  formatTime: (seconds: number) => string;
}

export function TaskList({
  tasks,
  activeTaskId,
  onSelectTask,
  onAddTask,
  onToggleComplete,
  onDeleteTask,
  onUpdateTask,
  formatTime,
}: TaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);
  const [deadline, setDeadline] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle.trim(), estimatedPomodoros, deadline || undefined);
      setNewTaskTitle('');
      setEstimatedPomodoros(1);
      setDeadline('');
      setIsAdding(false);
    }
  };

  const getDeadlineLabel = (deadlineStr: string) => {
    const date = parseISO(deadlineStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const isOverdue = (task: Task) => {
    if (!task.deadline || task.completed) return false;
    return isPast(parseISO(task.deadline));
  };

  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  // Sort by deadline (overdue first, then by date)
  const sortedIncompleteTasks = [...incompleteTasks].sort((a, b) => {
    if (!a.deadline && !b.deadline) return 0;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Tasks</h2>
        <span className="text-sm text-muted-foreground">
          {incompleteTasks.length} remaining
        </span>
      </div>

      {/* Add Task Form */}
      <AnimatePresence>
        {isAdding ? (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="mb-4 p-4 bg-card rounded-xl border border-border"
          >
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What are you working on?"
              className="mb-3"
              autoFocus
            />
            
            {/* Deadline picker */}
            <div className="flex items-center gap-2 mb-3">
              <CalendarIcon size={16} className="text-muted-foreground" />
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="flex-1"
                min={format(new Date(), 'yyyy-MM-dd')}
              />
              {deadline && (
                <button
                  type="button"
                  onClick={() => setDeadline('')}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm text-muted-foreground">Est. Pomodoros:</span>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setEstimatedPomodoros(num)}
                    className={cn(
                      'w-8 h-8 rounded-full text-sm font-medium transition-all',
                      estimatedPomodoros === num
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    )}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">Add Task</Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </Button>
            </div>
          </motion.form>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsAdding(true)}
            className="w-full mb-4 p-4 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add Task
          </motion.button>
        )}
      </AnimatePresence>

      {/* Task List */}
      <div className="space-y-2">
        <AnimatePresence>
          {sortedIncompleteTasks.map((task) => {
            const overdue = isOverdue(task);
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                layout
                onClick={() => onSelectTask(activeTaskId === task.id ? null : task.id)}
                className={cn(
                  'task-item group p-4 bg-card rounded-xl border cursor-pointer',
                  activeTaskId === task.id
                    ? 'border-primary ring-2 ring-primary/20'
                    : overdue 
                      ? 'border-destructive/50 bg-destructive/5'
                      : 'border-border hover:border-primary/30'
                )}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleComplete(task.id);
                    }}
                    className={cn(
                      'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                      task.completed
                        ? 'bg-success border-success text-success-foreground'
                        : 'border-border hover:border-primary'
                    )}
                  >
                    {task.completed && <Check size={12} />}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'font-medium truncate',
                      task.completed && 'line-through text-muted-foreground'
                    )}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Target size={12} />
                        {task.completedPomodoros}/{task.estimatedPomodoros}
                      </span>
                      {task.totalTimeSpent > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatTime(task.totalTimeSpent)}
                        </span>
                      )}
                      {task.deadline && (
                        <span className={cn(
                          'flex items-center gap-1 px-2 py-0.5 rounded-full',
                          overdue 
                            ? 'bg-destructive/20 text-destructive' 
                            : isToday(parseISO(task.deadline))
                              ? 'bg-primary/20 text-primary'
                              : 'bg-secondary text-muted-foreground'
                        )}>
                          {overdue && <AlertCircle size={12} />}
                          <CalendarIcon size={12} />
                          {getDeadlineLabel(task.deadline)}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTask(task.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Completed ({completedTasks.length})
            </h3>
            <AnimatePresence>
              {completedTasks.slice(0, 5).map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="task-item group p-3 bg-secondary/30 rounded-lg mb-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center">
                      <Check size={12} className="text-success-foreground" />
                    </div>
                    <span className="flex-1 text-sm text-muted-foreground line-through truncate">
                      {task.title}
                    </span>
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
