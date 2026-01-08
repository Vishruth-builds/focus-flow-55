import { motion } from 'framer-motion';
import { Timer, Moon, Sun, BarChart3, Calendar, Settings, ListTodo } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'timer' | 'tasks' | 'stats' | 'calendar' | 'settings';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  sessionsCompleted: number;
}

export function Header({ 
  theme, 
  onToggleTheme, 
  activeTab, 
  onTabChange,
  sessionsCompleted,
}: HeaderProps) {
  const tabs = [
    { id: 'timer' as Tab, icon: Timer, label: 'Timer' },
    { id: 'tasks' as Tab, icon: ListTodo, label: 'Tasks' },
    { id: 'stats' as Tab, icon: BarChart3, label: 'Stats' },
    { id: 'calendar' as Tab, icon: Calendar, label: 'Calendar' },
    { id: 'settings' as Tab, icon: Settings, label: 'Settings' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Timer size={18} className="text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-foreground hidden sm:block">
              Pomodoro
            </span>
            {sessionsCompleted > 0 && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                🍅 {sessionsCompleted}
              </span>
            )}
          </motion.div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'relative px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                  activeTab === tab.id
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <tab.icon size={18} />
                <span className="hidden md:block">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-secondary rounded-lg -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </nav>

          {/* Theme Toggle */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleTheme}
            className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </motion.button>
        </div>
      </div>
    </header>
  );
}
