import React from 'react';

interface TemperatureSliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
}

export const TemperatureSlider: React.FC<TemperatureSliderProps> = ({ value, min, max, onChange }) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="relative w-full h-12 flex items-center justify-center">
        {/* Background Track with Gradient */}
        <div className="absolute w-full h-4 rounded-full overflow-hidden shadow-inner bg-gray-700/50 backdrop-blur-sm border border-white/10">
            <div 
                className="w-full h-full opacity-80"
                style={{
                    background: `linear-gradient(90deg, 
                        #3b82f6 0%, 
                        #22c55e 40%, 
                        #eab308 60%, 
                        #ef4444 100%)`
                }}
            />
        </div>

        {/* Custom Input Range overlaid on top */}
        <input 
            type="range"
            min={min}
            max={max}
            step={0.5}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="absolute w-full h-12 opacity-0 cursor-pointer z-10"
        />

        {/* Visual Thumb Indicator (follows the value) */}
        <div 
            className="absolute h-8 w-8 bg-white rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] border-4 border-gray-200 pointer-events-none transition-all duration-75 ease-out flex items-center justify-center"
            style={{ 
                left: `calc(${percentage}% - 16px)` 
            }}
        >
            <div className="w-2 h-2 bg-gray-400 rounded-full" />
        </div>
    </div>
  );
};