import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Clock, Bell, Volume2 } from 'lucide-react';
import { Settings } from '@/types/pomodoro';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface SettingsPanelProps {
  settings: Settings;
  onUpdateSettings: (settings: Partial<Settings>) => void;
}

export function SettingsPanel({ settings, onUpdateSettings }: SettingsPanelProps) {
  return (
    <div className="w-full max-w-md space-y-6">
      <div className="flex items-center gap-2">
        <SettingsIcon size={20} className="text-muted-foreground" />
        <h2 className="text-xl font-semibold text-foreground">Settings</h2>
      </div>

      {/* Timer Durations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-card rounded-lg border border-border space-y-6"
      >
        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          <Clock size={16} />
          <span className="text-sm font-medium">Timer Durations</span>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <Label>Focus Duration</Label>
              <span className="text-sm text-muted-foreground">{settings.focusDuration} min</span>
            </div>
            <Slider
              value={[settings.focusDuration]}
              onValueChange={([value]) => onUpdateSettings({ focusDuration: value })}
              min={5}
              max={60}
              step={5}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label>Break Duration</Label>
              <span className="text-sm text-muted-foreground">{settings.breakDuration} min</span>
            </div>
            <Slider
              value={[settings.breakDuration]}
              onValueChange={([value]) => onUpdateSettings({ breakDuration: value })}
              min={1}
              max={15}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label>Long Break Duration</Label>
              <span className="text-sm text-muted-foreground">{settings.longBreakDuration} min</span>
            </div>
            <Slider
              value={[settings.longBreakDuration]}
              onValueChange={([value]) => onUpdateSettings({ longBreakDuration: value })}
              min={10}
              max={30}
              step={5}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label>Sessions until long break</Label>
              <span className="text-sm text-muted-foreground">{settings.sessionsUntilLongBreak}</span>
            </div>
            <Slider
              value={[settings.sessionsUntilLongBreak]}
              onValueChange={([value]) => onUpdateSettings({ sessionsUntilLongBreak: value })}
              min={2}
              max={6}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Auto Start */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 bg-card rounded-lg border border-border space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <Label>Auto-start Breaks</Label>
            <p className="text-xs text-muted-foreground">Automatically start break timer</p>
          </div>
          <Switch
            checked={settings.autoStartBreaks}
            onCheckedChange={(checked) => onUpdateSettings({ autoStartBreaks: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Auto-start Focus</Label>
            <p className="text-xs text-muted-foreground">Automatically start focus timer</p>
          </div>
          <Switch
            checked={settings.autoStartFocus}
            onCheckedChange={(checked) => onUpdateSettings({ autoStartFocus: checked })}
          />
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-4 bg-card rounded-lg border border-border space-y-4"
      >
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Bell size={16} />
          <span className="text-sm font-medium">Notifications</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Sound Effects</Label>
            <p className="text-xs text-muted-foreground">Play sound when timer ends</p>
          </div>
          <Switch
            checked={settings.soundEnabled}
            onCheckedChange={(checked) => onUpdateSettings({ soundEnabled: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Browser Notifications</Label>
            <p className="text-xs text-muted-foreground">Show desktop notifications</p>
          </div>
          <Switch
            checked={settings.notificationsEnabled}
            onCheckedChange={(checked) => onUpdateSettings({ notificationsEnabled: checked })}
          />
        </div>
      </motion.div>
    </div>
  );
}
