import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward, Settings2, Minus, Plus } from 'lucide-react';
import { TimerMode, Settings } from '@/types/pomodoro';
import { cn } from '@/lib/utils';

interface TimerProps {
  mode: TimerMode;
  timeLeft: number;
  isRunning: boolean;
  progress: number;
  settings: Settings;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onSwitchMode: (mode: TimerMode) => void;
  onUpdateSettings: (settings: Partial<Settings>) => void;
}

export function Timer({
  mode,
  timeLeft,
  isRunning,
  progress,
  settings,
  onStart,
  onPause,
  onReset,
  onSkip,
  onSwitchMode,
  onUpdateSettings,
}: TimerProps) {
  const [showSettings, setShowSettings] = useState(false);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const modeConfig = {
    focus: {
      label: 'Focus',
      ringClass: 'timer-ring-focus',
      bgClass: 'bg-primary/10',
      buttonClass: 'bg-primary hover:bg-primary/90',
    },
    break: {
      label: 'Break',
      ringClass: 'timer-ring-break',
      bgClass: 'bg-success/10',
      buttonClass: 'bg-success hover:bg-success/90',
    },
    longBreak: {
      label: 'Long Break',
      ringClass: 'timer-ring-long-break',
      bgClass: 'bg-[hsl(200_80%_55%)]',
      buttonClass: 'bg-[hsl(200_80%_55%)] hover:bg-[hsl(200_80%_50%)]',
    },
  };

  const adjustDuration = (type: 'focus' | 'break' | 'longBreak', delta: number) => {
    const key = type === 'focus' ? 'focusDuration' : type === 'break' ? 'breakDuration' : 'longBreakDuration';
    const currentValue = settings[key];
    const newValue = Math.max(1, Math.min(120, currentValue + delta));
    onUpdateSettings({ [key]: newValue });
  };

  return (
    <div className="section-card flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
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
        <svg width="280" height="280" className="transform -rotate-90">
          {/* Background Circle */}
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-secondary"
          />
          {/* Progress Circle */}
          <motion.circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className={cn('timer-ring', modeConfig[mode].ringClass)}
            strokeDasharray={2 * Math.PI * 120}
            strokeDashoffset={2 * Math.PI * 120 - (progress / 100) * 2 * Math.PI * 120}
            initial={false}
            animate={{ strokeDashoffset: 2 * Math.PI * 120 - (progress / 100) * 2 * Math.PI * 120 }}
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
              className="font-mono text-6xl font-semibold text-foreground tracking-tight"
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
            'p-6 rounded-full text-white shadow-lg transition-all',
            modeConfig[mode].buttonClass
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

      {/* Inline Settings Toggle */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Settings2 size={16} />
        {showSettings ? 'Hide' : 'Customize'} Timer
      </button>

      {/* Inline Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full space-y-4 overflow-hidden"
          >
            <div className="grid grid-cols-3 gap-4">
              {/* Focus Duration */}
              <div className="text-center">
                <label className="text-xs text-muted-foreground block mb-2">Focus</label>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => adjustDuration('focus', -5)}
                    className="p-1 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-mono text-lg font-semibold w-8">
                    {settings.focusDuration}
                  </span>
                  <button
                    onClick={() => adjustDuration('focus', 5)}
                    className="p-1 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Break Duration */}
              <div className="text-center">
                <label className="text-xs text-muted-foreground block mb-2">Break</label>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => adjustDuration('break', -1)}
                    className="p-1 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-mono text-lg font-semibold w-8">
                    {settings.breakDuration}
                  </span>
                  <button
                    onClick={() => adjustDuration('break', 1)}
                    className="p-1 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Long Break Duration */}
              <div className="text-center">
                <label className="text-xs text-muted-foreground block mb-2">Long Break</label>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => adjustDuration('longBreak', -5)}
                    className="p-1 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-mono text-lg font-semibold w-8">
                    {settings.longBreakDuration}
                  </span>
                  <button
                    onClick={() => adjustDuration('longBreak', 5)}
                    className="p-1 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Auto-start toggles */}
            <div className="flex justify-center gap-6 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoStartBreaks}
                  onChange={(e) => onUpdateSettings({ autoStartBreaks: e.target.checked })}
                  className="rounded border-border"
                />
                <span className="text-muted-foreground">Auto-start breaks</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoStartFocus}
                  onChange={(e) => onUpdateSettings({ autoStartFocus: e.target.checked })}
                  className="rounded border-border"
                />
                <span className="text-muted-foreground">Auto-start focus</span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
