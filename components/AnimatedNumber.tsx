import React, { useEffect, useState, useRef } from 'react';

interface AnimatedNumberProps {
  value: number;
  className?: string;
  duration?: number;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, className, duration = 400 }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const startValue = useRef(value);
  const startTime = useRef<number | null>(null);
  const finalValue = useRef(value);

  useEffect(() => {
    startValue.current = displayValue;
    finalValue.current = value;
    startTime.current = null;

    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = timestamp - startTime.current;

      if (progress < duration) {
        // Ease out quartic formula for smooth settling
        const ease = 1 - Math.pow(1 - progress / duration, 4);
        const current = startValue.current + (finalValue.current - startValue.current) * ease;
        setDisplayValue(current);
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayValue(finalValue.current);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return (
    <span className={className}>
      {displayValue.toFixed(1)}
    </span>
  );
};