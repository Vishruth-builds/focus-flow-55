import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const BACKGROUNDS = [
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1920&q=80', // Abstract painting
  'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1920&q=80', // Monet style water lilies
  'https://images.unsplash.com/photo-1549490349-8643362247b5?w=1920&q=80', // Abstract art blue
  'https://images.unsplash.com/photo-1518173946687-a4c036bc4f54?w=1920&q=80', // Dreamy clouds
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80', // Serene lake
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80', // Foggy mountains
  'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?w=1920&q=80', // Starry sky
  'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1920&q=80', // Aurora borealis
];

const STORAGE_KEY = 'focuux_background';
const LAST_CHANGE_KEY = 'focuux_last_bg_change';
const CHANGE_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

export function useBackground() {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });

  const [isLoaded, setIsLoaded] = useState(false);

  const changeBackground = useCallback((showNotification = true) => {
    const newIndex = (currentIndex + 1) % BACKGROUNDS.length;
    setCurrentIndex(newIndex);
    localStorage.setItem(STORAGE_KEY, String(newIndex));
    localStorage.setItem(LAST_CHANGE_KEY, String(Date.now()));
    
    if (showNotification) {
      toast.success('Wallpaper changed!', {
        duration: 3000,
        position: 'bottom-right',
      });
    }
  }, [currentIndex]);

  // Check if we need to change background based on time
  useEffect(() => {
    const checkAndChangeBackground = () => {
      const lastChange = localStorage.getItem(LAST_CHANGE_KEY);
      const now = Date.now();
      
      if (!lastChange) {
        localStorage.setItem(LAST_CHANGE_KEY, String(now));
        return;
      }

      const timeSinceLastChange = now - parseInt(lastChange, 10);
      if (timeSinceLastChange >= CHANGE_INTERVAL) {
        changeBackground(true);
      }
    };

    // Check immediately
    checkAndChangeBackground();

    // Set up interval to check every minute
    const interval = setInterval(checkAndChangeBackground, 60000);

    return () => clearInterval(interval);
  }, [changeBackground]);

  // Preload background image
  useEffect(() => {
    const img = new Image();
    img.src = BACKGROUNDS[currentIndex];
    img.onload = () => setIsLoaded(true);
  }, [currentIndex]);

  return {
    currentBackground: BACKGROUNDS[currentIndex],
    isLoaded,
    changeBackground,
    backgroundIndex: currentIndex,
    totalBackgrounds: BACKGROUNDS.length,
  };
}
