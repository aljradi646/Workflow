'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from 'next-themes';

function ParticleField() {
  const meshRef = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  const particlesCount = 1500;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  const colors = useMemo(() => {
    const cols = new Float32Array(particlesCount * 3);
    const emerald = new THREE.Color('#10B981');
    const teal = new THREE.Color('#14B8A6');
    for (let i = 0; i < particlesCount; i++) {
      const t = Math.random();
      const color = emerald.clone().lerp(teal, t);
      cols[i * 3] = color.r;
      cols[i * 3 + 1] = color.g;
      cols[i * 3 + 2] = color.b;
    }
    return cols;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += 0.0003;
    meshRef.current.rotation.x += 0.0001;

    // Mouse interaction
    const { pointer } = state;
    mouseRef.current.x += (pointer.x * 0.3 - mouseRef.current.x) * 0.02;
    mouseRef.current.y += (pointer.y * 0.3 - mouseRef.current.y) * 0.02;
    meshRef.current.rotation.y += mouseRef.current.x * 0.001;
    meshRef.current.rotation.x += mouseRef.current.y * 0.001;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particlesCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function ThreeBackground() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div className="fixed inset-0 -z-10" style={{ position: 'fixed' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: 'transparent', position: 'relative' }}
      >
        <Stars
          radius={50}
          depth={50}
          count={1500}
          factor={3}
          saturation={0.5}
          fade
          speed={0.5}
        />
        <ParticleField />
        <ambientLight intensity={0.3} />
      </Canvas>
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.08) 0%, transparent 60%)'
            : 'radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.05) 0%, transparent 60%)',
        }}
      />
    </div>
  );
}
