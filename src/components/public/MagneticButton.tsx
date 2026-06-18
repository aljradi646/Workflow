'use client';

import { useRef, useCallback, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  radius?: number;
}

export function MagneticButton({
  children,
  className = '',
  strength = 0.3,
  radius = 150,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInRange, setIsInRange] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;

      const distance = Math.sqrt(distX * distX + distY * distY);

      if (distance < radius) {
        setIsInRange(true);
        x.set(distX * strength);
        y.set(distY * strength);
      } else {
        setIsInRange(false);
        x.set(0);
        y.set(0);
      }
    },
    [radius, strength, x, y]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
    setIsInRange(false);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      className={`magnetic-area inline-block ${className}`}
      style={{
        x: xSpring,
        y: ySpring,
        willChange: 'transform',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        scale: isInRange ? 1.05 : 1,
      }}
      transition={{ scale: { duration: 0.2 } }}
    >
      {children}
    </motion.div>
  );
}
