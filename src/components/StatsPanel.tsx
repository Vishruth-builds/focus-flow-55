import { motion } from 'framer-motion';
import { Clock, Target, TrendingUp, Calendar } from 'lucide-react';
import { DailyStats } from '@/types/pomodoro';
import { format, parseISO } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface StatsPanelProps {
  todayStats: {
    totalFocusTime: number;
    sessionsCompleted: number;
    tasksCompleted: number;
  };
  weeklyStats: {
    totalFocusTime: number;
    sessionsCompleted: number;
    avgFocusTimePerDay: number;
  };
  last7Days: DailyStats[];
  averageDailyFocusTime: number;
  formatTime: (seconds: number) => string;
}

export function StatsPanel({
  todayStats,
  weeklyStats,
  last7Days,
  averageDailyFocusTime,
  formatTime,
}: StatsPanelProps) {
  const chartData = last7Days.map((day) => ({
    name: format(parseISO(day.date), 'EEE'),
    minutes: Math.round(day.totalFocusTime / 60),
    sessions: day.sessionsCompleted,
    isToday: day.date === format(new Date(), 'yyyy-MM-dd'),
  }));

  const statCards = [
    {
      icon: Clock,
      label: 'Today',
      value: formatTime(todayStats.totalFocusTime),
      subLabel: `${todayStats.sessionsCompleted} sessions`,
      color: 'text-primary',
    },
    {
      icon: TrendingUp,
      label: 'This Week',
      value: formatTime(weeklyStats.totalFocusTime),
      subLabel: `${weeklyStats.sessionsCompleted} sessions`,
      color: 'text-success',
    },
    {
      icon: Target,
      label: 'Daily Average',
      value: formatTime(averageDailyFocusTime),
      subLabel: 'last 7 days',
      color: 'text-blue-500',
    },
  ];

  return (
    <div className="w-full max-w-md space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Statistics</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-card rounded-lg border border-border text-center"
          >
            <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
            <p className="text-lg font-semibold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Weekly Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-4 bg-card rounded-lg border border-border"
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Weekly Focus Time
        </h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                hide 
                domain={[0, 'auto']}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
                        <p className="text-sm font-medium">{payload[0].payload.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {payload[0].value} min • {payload[0].payload.sessions} sessions
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isToday ? 'hsl(var(--primary))' : 'hsl(var(--muted))'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
