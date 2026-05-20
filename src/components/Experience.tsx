import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';

function FloatyDust({ count = 100 }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        p[i * 3] = (Math.random() - 0.5) * 20;
        p[i * 3 + 1] = (Math.random() - 0.5) * 20;
        p[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return p;
  }, [count]);

  const ref = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (ref.current) {
        ref.current.rotation.y += 0.001;
        ref.current.rotation.x += 0.0005;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#ffd700"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

function CinematicCamera() {
    const ref = useRef<THREE.PerspectiveCamera>(null);
    
    useFrame((state) => {
        if (ref.current) {
            // Gentle slow orbit movement
            const t = state.clock.getElapsedTime() * 0.1;
            ref.current.position.x = Math.sin(t) * 2;
            ref.current.position.y = Math.cos(t * 0.5) * 0.5 + 2;
            ref.current.lookAt(0, 0, 0);
        }
    });

    return <PerspectiveCamera ref={ref} makeDefault position={[0, 2, 10]} fov={45} />;
}

export default function Experience() {
  return (
    <div id="experience-container" className="fixed inset-0 z-0">
      <Canvas dpr={[1, 2]}>
        <color attach="background" args={['#050505']} />
        
        {/* Atmosphere */}
        <fog attach="fog" args={['#050505', 5, 15]} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <CinematicCamera />
        
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffaa44" />
        <spotLight 
            position={[-5, 5, 0]} 
            angle={0.3} 
            penumbra={1} 
            intensity={2} 
            color="#4488ff" 
            castShadow 
        />

        {/* Abstract "World" Elements */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh position={[0, 0, -2]}>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="#222" roughness={0.1} metalness={0.8} />
          </mesh>
        </Float>

        <FloatyDust />
        
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}
