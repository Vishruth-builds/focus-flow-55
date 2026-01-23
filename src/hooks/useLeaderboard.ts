import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, format } from 'date-fns';
import { logger } from '@/lib/logger';

export type Tier = 'rookie' | 'amateur' | 'pro' | 'expert' | 'master';

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  total_focus_time: number;
  sessions_completed: number;
  tier: Tier;
  rank: number;
}

// Tier thresholds in seconds for weekly focus time
const TIER_THRESHOLDS = {
  rookie: 0,           // 0+ hours
  amateur: 5 * 3600,   // 5+ hours
  pro: 15 * 3600,      // 15+ hours
  expert: 30 * 3600,   // 30+ hours
  master: 50 * 3600,   // 50+ hours
};

export function calculateTier(focusTimeSeconds: number): Tier {
  if (focusTimeSeconds >= TIER_THRESHOLDS.master) return 'master';
  if (focusTimeSeconds >= TIER_THRESHOLDS.expert) return 'expert';
  if (focusTimeSeconds >= TIER_THRESHOLDS.pro) return 'pro';
  if (focusTimeSeconds >= TIER_THRESHOLDS.amateur) return 'amateur';
  return 'rookie';
}

export function getTierInfo(tier: Tier) {
  const info = {
    rookie: { label: 'Rookie', minHours: 0, nextTier: 'amateur' as Tier, nextMinHours: 5 },
    amateur: { label: 'Amateur', minHours: 5, nextTier: 'pro' as Tier, nextMinHours: 15 },
    pro: { label: 'Pro', minHours: 15, nextTier: 'expert' as Tier, nextMinHours: 30 },
    expert: { label: 'Expert', minHours: 30, nextTier: 'master' as Tier, nextMinHours: 50 },
    master: { label: 'Master', minHours: 50, nextTier: null, nextMinHours: null },
  };
  return info[tier];
}

export function useLeaderboard(userId?: string) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const currentWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    
    // Fetch all user stats for current week with profiles
    const { data: stats, error } = await supabase
      .from('user_stats')
      .select(`
        *,
        profiles:profiles!user_stats_user_id_fkey (
          username,
          avatar_url
        )
      `)
      .eq('week_start', currentWeekStart)
      .order('total_focus_time', { ascending: false });

    if (error) {
      logger.error('Error fetching leaderboard:', error);
      setLoading(false);
      return;
    }

    // Transform and rank entries
    const entries: LeaderboardEntry[] = (stats || []).map((stat: any, index: number) => ({
      id: stat.id,
      user_id: stat.user_id,
      username: stat.profiles?.username || 'Anonymous',
      avatar_url: stat.profiles?.avatar_url || null,
      total_focus_time: stat.total_focus_time,
      sessions_completed: stat.sessions_completed,
      tier: calculateTier(stat.total_focus_time),
      rank: index + 1,
    }));

    setLeaderboard(entries);

    // Find current user's stats
    if (userId) {
      const userEntry = entries.find(e => e.user_id === userId);
      setUserStats(userEntry || null);
    }

    setLoading(false);
  }, [currentWeekStart, userId]);

  const updateUserStats = useCallback(async (focusTime: number) => {
    if (!userId) return;

    // First, try to get existing stats for this week
    const { data: existing } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start', currentWeekStart)
      .maybeSingle();

    if (existing) {
      // Update existing record
      const newTotalTime = existing.total_focus_time + focusTime;
      const newTier = calculateTier(newTotalTime);

      await supabase
        .from('user_stats')
        .update({
          total_focus_time: newTotalTime,
          sessions_completed: existing.sessions_completed + 1,
          tier: newTier,
        })
        .eq('id', existing.id);
    } else {
      // Create new record for this week
      const tier = calculateTier(focusTime);
      
      await supabase
        .from('user_stats')
        .insert({
          user_id: userId,
          week_start: currentWeekStart,
          total_focus_time: focusTime,
          sessions_completed: 1,
          tier,
        });
    }

    // Refresh leaderboard
    fetchLeaderboard();
  }, [userId, currentWeekStart, fetchLeaderboard]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    leaderboard,
    userStats,
    loading,
    updateUserStats,
    fetchLeaderboard,
  };
}
