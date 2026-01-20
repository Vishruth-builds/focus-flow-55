import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar, Section } from '@/components/Sidebar';
import { Timer } from '@/components/Timer';
import { TaskList } from '@/components/TaskList';
import { StatsPanel } from '@/components/StatsPanel';
import { CalendarView } from '@/components/CalendarView';
import { Leaderboard } from '@/components/Leaderboard';
import { BackgroundOverlay } from '@/components/BackgroundOverlay';
import { ProfileEditModal } from '@/components/ProfileEditModal';
import { ProductivityReportModal } from '@/components/ProductivityReport';
import { SectionWrapper } from '@/components/SectionWrapper';
import { usePomodoro } from '@/hooks/usePomodoro';
import { useTheme } from '@/hooks/useTheme';
import { useStats } from '@/hooks/useStats';
import { useAuth } from '@/hooks/useAuth';
import { useBackground } from '@/hooks/useBackground';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { toast } from 'sonner';

const Index = () => {
  const [activeSection, setActiveSection] = useState<Section>('timer');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, profile, loading: authLoading, signOut, updateProfile } = useAuth();
  const { currentBackground, isLoaded } = useBackground();
  const navigate = useNavigate();
  
  const sectionRefs = {
    timer: useRef<HTMLElement>(null),
    tasks: useRef<HTMLElement>(null),
    stats: useRef<HTMLElement>(null),
    calendar: useRef<HTMLElement>(null),
    leaderboard: useRef<HTMLElement>(null),
  };

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

  const { 
    leaderboard, 
    userStats, 
    loading: leaderboardLoading,
    updateUserStats,
  } = useLeaderboard(user?.id);

  // Scroll-based section tracking
  useEffect(() => {
    const handleScroll = () => {
      const sections = Object.entries(sectionRefs) as [Section, React.RefObject<HTMLElement>][];
      let currentSection: Section = 'timer';
      
      for (const [id, ref] of sections) {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          // Check if section is in the viewport (with some offset)
          if (rect.top <= 200 && rect.bottom >= 200) {
            currentSection = id;
          }
        }
      }
      
      if (currentSection !== activeSection) {
        setActiveSection(currentSection);
      }
    };

    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (mainContent) {
        mainContent.removeEventListener('scroll', handleScroll);
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [activeSection]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [authLoading, user, navigate]);

  // Update leaderboard when a focus session completes
  useEffect(() => {
    if (user && sessions.length > 0) {
      const lastSession = sessions[sessions.length - 1];
      if (lastSession.type === 'focus') {
        // Check if this is a new session (completed within last 2 seconds)
        const sessionTime = new Date(lastSession.completedAt).getTime();
        const now = Date.now();
        if (now - sessionTime < 2000) {
          updateUserStats(lastSession.duration);
        }
      }
    }
  }, [sessions, user, updateUserStats]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
          handleSectionChange('timer');
          break;
        case '2':
          handleSectionChange('tasks');
          break;
        case '3':
          handleSectionChange('stats');
          break;
        case '4':
          handleSectionChange('calendar');
          break;
        case '5':
          handleSectionChange('leaderboard');
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
    const modeLabel = mode === 'focus' ? '🎯 Focus' : mode === 'break' ? '☕ Break' : '🌴 Long Break';
    document.title = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} - ${modeLabel} | Focuux`;
  }, [timeLeft, mode]);

  const handleSectionChange = useCallback((section: Section) => {
    setActiveSection(section);
    sectionRefs[section].current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start',
    });
  }, []);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/auth');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <BackgroundOverlay imageUrl={currentBackground} isLoaded={isLoaded} />
      
      <Sidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        theme={theme}
        onToggleTheme={toggleTheme}
        sessionsCompleted={sessionsCompleted}
        profile={profile}
        onSignOut={handleSignOut}
        onEditProfile={() => setShowProfileModal(true)}
        onOpenReport={() => setShowReportModal(true)}
      />

      <main className="main-content min-h-screen py-8 px-4 lg:px-8" style={{ perspective: '1200px' }}>
        <div className="max-w-4xl mx-auto space-y-24" style={{ transformStyle: 'preserve-3d' }}>
          {/* Timer Section */}
          <SectionWrapper ref={sectionRefs.timer} id="timer" isCard={false}>
            <Timer
              mode={mode}
              timeLeft={timeLeft}
              isRunning={isRunning}
              progress={progress}
              settings={settings}
              onStart={start}
              onPause={pause}
              onReset={reset}
              onSkip={skip}
              onSwitchMode={switchMode}
              onUpdateSettings={updateSettings}
            />
          </SectionWrapper>

          {/* Tasks Section */}
          <SectionWrapper ref={sectionRefs.tasks} id="tasks">
            <TaskList
              tasks={tasks}
              activeTaskId={activeTaskId}
              onSelectTask={setActiveTaskId}
              onAddTask={addTask}
              onToggleComplete={toggleTaskComplete}
              onDeleteTask={deleteTask}
              onUpdateTask={updateTask}
              formatTime={formatTime}
            />
          </SectionWrapper>

          {/* Stats Section */}
          <SectionWrapper ref={sectionRefs.stats} id="stats">
            <StatsPanel
              todayStats={todayStats}
              weeklyStats={weeklyStats}
              last7Days={last7Days}
              averageDailyFocusTime={averageDailyFocusTime}
              formatTime={formatTime}
            />
          </SectionWrapper>

          {/* Calendar Section */}
          <SectionWrapper ref={sectionRefs.calendar} id="calendar">
            <CalendarView
              sessions={sessions}
              tasks={tasks}
              formatTime={formatTime}
            />
          </SectionWrapper>

          {/* Leaderboard Section */}
          <SectionWrapper ref={sectionRefs.leaderboard} id="leaderboard" className="pb-16" isCard={false}>
            <Leaderboard
              entries={leaderboard}
              currentUserId={user?.id}
              loading={leaderboardLoading}
              formatTime={formatTime}
            />
          </SectionWrapper>
        </div>
      </main>

      {/* Active Task Indicator */}
      {activeTaskId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 glass-card rounded-full shadow-lg ml-10 lg:ml-32"
        >
          <span className="text-sm text-muted-foreground">Working on: </span>
          <span className="text-sm font-medium text-foreground">
            {tasks.find(t => t.id === activeTaskId)?.title}
          </span>
        </motion.div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-4 right-4 text-xs text-muted-foreground hidden lg:block glass-card px-3 py-2 rounded-lg">
        <span className="px-2 py-1 bg-secondary rounded">Space</span> start/pause
        <span className="ml-2 px-2 py-1 bg-secondary rounded">1-5</span> navigate
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={profile}
        onUpdate={updateProfile}
      />

      {/* Productivity Report Modal */}
      <ProductivityReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        tasks={tasks}
        sessions={sessions}
        formatTime={formatTime}
      />
    </div>
  );
};

export default Index;
