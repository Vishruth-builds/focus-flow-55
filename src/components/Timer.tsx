import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { TimerMode } from '@/types/pomodoro';
import { cn } from '@/lib/utils';

interface TimerProps {
  mode: TimerMode;
  timeLeft: number;
  isRunning: boolean;
  progress: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onSwitchMode: (mode: TimerMode) => void;
}

export function Timer({
  mode,
  timeLeft,
  isRunning,
  progress,
  onStart,
  onPause,
  onReset,
  onSkip,
  onSwitchMode,
}: TimerProps) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const modeConfig = {
    focus: {
      label: 'Focus',
      ringClass: 'timer-ring-focus',
      bgClass: 'bg-primary/10',
    },
    break: {
      label: 'Break',
      ringClass: 'timer-ring-break',
      bgClass: 'bg-success/10',
    },
    longBreak: {
      label: 'Long Break',
      ringClass: 'timer-ring-long-break',
      bgClass: 'bg-blue-500/10',
    },
  };

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Mode Selector */}
      <div className="flex gap-2 p-1 bg-secondary rounded-full">
        {(['focus', 'break', 'longBreak'] as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => onSwitchMode(m)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
              mode === m
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {modeConfig[m].label}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <motion.div 
        className="relative"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <svg width="320" height="320" className="transform -rotate-90">
          {/* Background Circle */}
          <circle
            cx="160"
            cy="160"
            r="140"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-secondary"
          />
          {/* Progress Circle */}
          <motion.circle
            cx="160"
            cy="160"
            r="140"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className={cn('timer-ring', modeConfig[mode].ringClass)}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            initial={false}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </svg>

        {/* Timer Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={`${minutes}-${seconds}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="font-mono text-7xl font-semibold text-foreground tracking-tight"
            >
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </motion.span>
          </AnimatePresence>
          <span className="text-muted-foreground text-lg mt-2">
            {modeConfig[mode].label}
          </span>
        </div>

        {/* Pulse Animation when Running */}
        {isRunning && (
          <motion.div
            className={cn(
              'absolute inset-0 rounded-full',
              modeConfig[mode].bgClass
            )}
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.1, opacity: 0 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        )}
      </motion.div>

      {/* Control Buttons */}
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReset}
          className="p-3 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
          title="Reset (R)"
        >
          <RotateCcw size={24} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isRunning ? onPause : onStart}
          className={cn(
            'p-6 rounded-full text-primary-foreground shadow-lg transition-all',
            mode === 'focus' && 'bg-primary hover:bg-primary/90',
            mode === 'break' && 'bg-success hover:bg-success/90',
            mode === 'longBreak' && 'bg-blue-500 hover:bg-blue-600'
          )}
          title={isRunning ? 'Pause (Space)' : 'Start (Space)'}
        >
          {isRunning ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSkip}
          className="p-3 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
          title="Skip (S)"
        >
          <SkipForward size={24} />
        </motion.button>
      </div>
    </div>
  );
}
