import { Sparkles } from 'lucide-react';

interface FocuuxLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function FocuuxLogo({ size = 'md', showText = true }: FocuuxLogoProps) {
  const sizes = {
    sm: { icon: 16, container: 'w-8 h-8', text: 'text-lg' },
    md: { icon: 24, container: 'w-12 h-12', text: 'text-2xl' },
    lg: { icon: 32, container: 'w-16 h-16', text: 'text-3xl' },
  };

  const config = sizes[size];

  return (
    <div className="flex items-center gap-3">
      <div className={`${config.container} rounded-2xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-lg shadow-primary/25`}>
        <Sparkles size={config.icon} className="text-white" />
      </div>
      {showText && (
        <span className={`font-bold ${config.text} gradient-text`}>
          Focuux
        </span>
      )}
    </div>
  );
}
