'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  velocity: number;
}

interface ParticleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  particleCount?: number;
  colors?: string[];
}

export function ParticleButton({
  children,
  onClick,
  className = '',
  particleCount = 15,
  colors = [
    'bg-emerald-400',
    'bg-emerald-500',
    'bg-teal-400',
    'bg-teal-500',
    'bg-green-400',
    'bg-cyan-400',
  ],
}: ParticleButtonProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  const generateParticles = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
        id: Date.now() + i,
        x,
        y,
        color: colors[i % colors.length],
        size: 3 + Math.random() * 4,
        angle: (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5,
        velocity: 60 + Math.random() * 80,
      }));

      setParticles(newParticles);

      // Clean up after animation
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
      }, 800);

      onClick?.();
    },
    [particleCount, colors, onClick]
  );

  return (
    <div
      className={`relative inline-flex overflow-visible ${className}`}
      onClick={generateParticles}
      data-cursor-hover
    >
      {children}

      {/* Particle container */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.span
            key={particle.id}
            className={`absolute rounded-full pointer-events-none ${particle.color}`}
            style={{
              width: particle.size,
              height: particle.size,
              left: particle.x,
              top: particle.y,
            }}
            initial={{
              x: 0,
              y: 0,
              opacity: 1,
              scale: 1,
            }}
            animate={{
              x: Math.cos(particle.angle) * particle.velocity,
              y: Math.sin(particle.angle) * particle.velocity + 40, // gravity
              opacity: 0,
              scale: 0.2,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.5 + Math.random() * 0.3,
              ease: 'easeOut',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
