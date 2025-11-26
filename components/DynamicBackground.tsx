import React from 'react';
import { WeatherState } from '../types';
import { BACKGROUND_IMAGES } from '../constants';

interface DynamicBackgroundProps {
  weather: WeatherState;
}

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ weather }) => {
  const bgImage = BACKGROUND_IMAGES[weather.condition] || BACKGROUND_IMAGES.sunny;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden transition-all duration-1000 ease-in-out">
      {/* Base Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
    </div>
  );
};