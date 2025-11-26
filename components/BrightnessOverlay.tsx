import React, { useEffect, useState, useCallback } from 'react';
import { Settings } from 'lucide-react';

interface BrightnessOverlayProps {
  maxBrightness: number; // 0 to 100
  minBrightness: number; // 0 to 100
  timeoutSeconds: number;
  onSettingsClick: () => void;
}

export const BrightnessOverlay: React.FC<BrightnessOverlayProps> = ({ maxBrightness, minBrightness, timeoutSeconds, onSettingsClick }) => {
  const [isIdle, setIsIdle] = useState(false);
  
  // Calculate opacity: 
  // 1. Convert brightness (0-100) to opacity (1-0). 100% brightness = 0 opacity. 0% brightness = 1 opacity.
  const activeOpacity = 1 - (Math.max(5, maxBrightness) / 100);
  const idleOpacity = 1 - (Math.max(0, minBrightness) / 100);

  const currentOpacity = isIdle ? idleOpacity : activeOpacity;

  const resetTimer = useCallback(() => {
    setIsIdle(false);
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const handleActivity = () => {
      resetTimer();
      clearTimeout(timeout);
      
      // Set idle after the configured number of seconds
      timeout = setTimeout(() => {
        setIsIdle(true);
      }, timeoutSeconds * 1000);
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('keydown', handleActivity);

    // Initial trigger
    handleActivity();

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      clearTimeout(timeout);
    };
  }, [resetTimer, timeoutSeconds]);

  return (
    <>
       {/* Settings trigger area (top right hidden trigger or visual icon) */}
      <button 
        onClick={(e) => { e.stopPropagation(); onSettingsClick(); }}
        className={`absolute top-4 right-4 z-50 p-2 rounded-full bg-black/30 text-white/70 hover:bg-black/60 hover:text-white transition-opacity duration-300 ${isIdle ? 'opacity-0' : 'opacity-100'}`}
      >
        <Settings size={24} />
      </button>

      {/* The Dimming Layer */}
      <div 
        className="fixed inset-0 bg-black z-40 pointer-events-none transition-all duration-1000 ease-in-out"
        style={{ opacity: currentOpacity }}
      />
    </>
  );
};