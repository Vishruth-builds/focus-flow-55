import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { Timer } from '@/components/Timer';
import { TaskList } from '@/components/TaskList';
import { StatsPanel } from '@/components/StatsPanel';
import { CalendarView } from '@/components/CalendarView';
import { SettingsPanel } from '@/components/SettingsPanel';
import { usePomodoro } from '@/hooks/usePomodoro';
import { useTheme } from '@/hooks/useTheme';
import { useStats } from '@/hooks/useStats';

type Tab = 'timer' | 'tasks' | 'stats' | 'calendar' | 'settings';

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>('timer');
  const { theme, toggleTheme } = useTheme();
  
  const {
    mode,
    timeLeft,
    isRunning,
    progress,
    sessionsCompleted,
    start,
    pause,
    reset,
    skip,
    switchMode,
    tasks,
    activeTaskId,
    setActiveTaskId,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    sessions,
    settings,
    updateSettings,
  } = usePomodoro();

  const {
    todayStats,
    weeklyStats,
    last7Days,
    averageDailyFocusTime,
    formatTime,
  } = useStats(sessions, tasks);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          isRunning ? pause() : start();
          break;
        case 'r':
          reset();
          break;
        case 's':
          skip();
          break;
        case '1':
          setActiveTab('timer');
          break;
        case '2':
          setActiveTab('tasks');
          break;
        case '3':
          setActiveTab('stats');
          break;
        case '4':
          setActiveTab('calendar');
          break;
        case '5':
          setActiveTab('settings');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, start, pause, reset, skip]);

  // Update document title with timer
  useEffect(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const modeLabel = mode === 'focus' ? '🍅 Focus' : mode === 'break' ? '☕ Break' : '🌴 Long Break';
    document.title = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} - ${modeLabel}`;
  }, [timeLeft, mode]);

  const renderContent = () => {
    switch (activeTab) {
      case 'timer':
        return (
          <div className="flex flex-col lg:flex-row items-start justify-center gap-8 lg:gap-16">
            <Timer
              mode={mode}
              timeLeft={timeLeft}
              isRunning={isRunning}
              progress={progress}
              onStart={start}
              onPause={pause}
              onReset={reset}
              onSkip={skip}
              onSwitchMode={switchMode}
            />
            <div className="lg:hidden w-full">
              <TaskList
                tasks={tasks}
                activeTaskId={activeTaskId}
                onSelectTask={setActiveTaskId}
                onAddTask={addTask}
                onToggleComplete={toggleTaskComplete}
                onDeleteTask={deleteTask}
                formatTime={formatTime}
              />
            </div>
          </div>
        );
      case 'tasks':
        return (
          <TaskList
            tasks={tasks}
            activeTaskId={activeTaskId}
            onSelectTask={setActiveTaskId}
            onAddTask={addTask}
            onToggleComplete={toggleTaskComplete}
            onDeleteTask={deleteTask}
            formatTime={formatTime}
          />
        );
      case 'stats':
        return (
          <StatsPanel
            todayStats={todayStats}
            weeklyStats={weeklyStats}
            last7Days={last7Days}
            averageDailyFocusTime={averageDailyFocusTime}
            formatTime={formatTime}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            sessions={sessions}
            tasks={tasks}
            formatTime={formatTime}
          />
        );
      case 'settings':
        return (
          <SettingsPanel
            settings={settings}
            onUpdateSettings={updateSettings}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sessionsCompleted={sessionsCompleted}
      />
      
      <main className="pt-24 pb-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="flex justify-center"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Active Task Indicator */}
      {activeTaskId && activeTab === 'timer' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-card border border-border rounded-full shadow-lg"
        >
          <span className="text-sm text-muted-foreground">Working on: </span>
          <span className="text-sm font-medium text-foreground">
            {tasks.find(t => t.id === activeTaskId)?.title}
          </span>
        </motion.div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-4 right-4 text-xs text-muted-foreground hidden lg:block">
        <span className="px-2 py-1 bg-secondary rounded">Space</span> to start/pause
      </div>
    </div>
  );
};

export default Index;
