import { motion } from 'framer-motion';
import { 
  Timer, 
  ListTodo, 
  BarChart3, 
  Calendar, 
  Trophy, 
  Moon, 
  Sun, 
  LogOut,
  User,
  Sparkles,
  Settings,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Profile } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export type Section = 'timer' | 'tasks' | 'stats' | 'calendar' | 'leaderboard';

interface SidebarProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  sessionsCompleted: number;
  profile: Profile | null;
  onSignOut: () => void;
  onEditProfile: () => void;
  onOpenReport: () => void;
}

const navItems = [
  { id: 'timer' as Section, icon: Timer, label: 'Timer' },
  { id: 'tasks' as Section, icon: ListTodo, label: 'Tasks' },
  { id: 'stats' as Section, icon: BarChart3, label: 'Stats' },
  { id: 'calendar' as Section, icon: Calendar, label: 'Calendar' },
  { id: 'leaderboard' as Section, icon: Trophy, label: 'Leaderboard' },
];

export function Sidebar({
  activeSection,
  onSectionChange,
  theme,
  onToggleTheme,
  sessionsCompleted,
  profile,
  onSignOut,
  onEditProfile,
  onOpenReport,
}: SidebarProps) {
  return (
    <aside className="sidebar-nav flex flex-col">
      {/* Logo */}
      <div className="p-4 lg:p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <Sparkles size={20} className="text-white" />
          </div>
          <span className="font-bold text-xl text-sidebar-foreground hidden lg:block gradient-text">
            Focuux
          </span>
        </div>
        {sessionsCompleted > 0 && (
          <div className="mt-3 hidden lg:block">
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
              🎯 {sessionsCompleted} sessions today
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 lg:p-4 space-y-1">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSectionChange(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all relative',
              activeSection === item.id
                ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg'
                : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
            )}
          >
            <item.icon size={20} />
            <span className="hidden lg:block">{item.label}</span>
            
            {/* Active indicator */}
            {activeSection === item.id && (
              <motion.div
                layoutId="activeSection"
                className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </nav>

      {/* User Profile & Actions */}
      <div className="p-3 lg:p-4 border-t border-sidebar-border space-y-2">
        {/* Weekly Report */}
        <button
          onClick={onOpenReport}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all"
        >
          <FileText size={20} />
          <span className="hidden lg:block">Weekly Report</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          <span className="hidden lg:block">
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </span>
        </button>

        {/* User Profile */}
        {profile && (
          <>
            <button
              onClick={onEditProfile}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-sidebar-accent transition-all group"
            >
              <Avatar className="w-8 h-8 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {profile.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex items-center gap-2 flex-1">
                <span className="text-sm font-medium text-sidebar-foreground truncate">
                  {profile.username}
                </span>
                <Settings size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
            
            <button
              onClick={onSignOut}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
            >
              <LogOut size={20} />
              <span className="hidden lg:block">Sign Out</span>
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
