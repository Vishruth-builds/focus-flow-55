import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Flame, Star, Zap } from 'lucide-react';
import { LeaderboardEntry, Tier, getTierInfo } from '@/hooks/useLeaderboard';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  loading: boolean;
  formatTime: (seconds: number) => string;
}

const tierIcons: Record<Tier, React.ReactNode> = {
  rookie: <Star size={14} />,
  amateur: <Zap size={14} />,
  pro: <Flame size={14} />,
  expert: <Medal size={14} />,
  master: <Crown size={14} />,
};

const rankIcons = [
  <Crown key="1" className="text-yellow-500" size={24} />,
  <Medal key="2" className="text-gray-400" size={22} />,
  <Medal key="3" className="text-amber-600" size={20} />,
];

export function Leaderboard({ 
  entries, 
  currentUserId, 
  loading, 
  formatTime 
}: LeaderboardProps) {
  if (loading) {
    return (
      <div className="section-card w-full max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="text-primary" size={24} />
          <h2 className="text-2xl font-bold text-foreground">Leaderboard</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-secondary/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="section-card w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="text-primary" size={24} />
          <h2 className="text-2xl font-bold text-foreground">Weekly Leaderboard</h2>
        </div>
        <span className="text-sm text-muted-foreground">This week</span>
      </div>

      {/* Tier Legend */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['rookie', 'amateur', 'pro', 'expert', 'master'] as Tier[]).map((tier) => (
          <div key={tier} className={cn('tier-badge flex items-center gap-1', `tier-${tier}`)}>
            {tierIcons[tier]}
            {getTierInfo(tier).label}
          </div>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No entries yet</p>
          <p className="text-sm">Complete focus sessions to appear on the leaderboard!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => {
            const isCurrentUser = entry.user_id === currentUserId;
            const tierInfo = getTierInfo(entry.tier);

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl transition-all',
                  isCurrentUser
                    ? 'bg-primary/10 border-2 border-primary/30'
                    : 'bg-secondary/50 hover:bg-secondary/80'
                )}
              >
                {/* Rank */}
                <div className="w-8 text-center">
                  {index < 3 ? (
                    rankIcons[index]
                  ) : (
                    <span className="text-lg font-bold text-muted-foreground">
                      {entry.rank}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <Avatar className="w-10 h-10">
                  <AvatarImage src={entry.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-sm">
                    {entry.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Name & Tier */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'font-semibold truncate',
                      isCurrentUser && 'text-primary'
                    )}>
                      {entry.username}
                    </span>
                    {isCurrentUser && (
                      <span className="text-xs text-primary">(You)</span>
                    )}
                  </div>
                  <div className={cn('tier-badge inline-flex items-center gap-1 mt-1', `tier-${entry.tier}`)}>
                    {tierIcons[entry.tier]}
                    {tierInfo.label}
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <p className="font-bold text-foreground">{formatTime(entry.total_focus_time)}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.sessions_completed} sessions
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
