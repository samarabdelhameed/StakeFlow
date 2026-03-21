"use client";

import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Text, OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import * as THREE from "three";

// 3D Floating Card Component
function FloatingCard({ 
  position, 
  rotation = [0, 0, 0], 
  color = "#8B5CF6", 
  children,
  onClick 
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh
        ref={meshRef}
        position={position}
        rotation={rotation}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.1 : 1}
      >
        <boxGeometry args={[2, 1.2, 0.1]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.8}
          emissive={color}
          emissiveIntensity={hovered ? 0.3 : 0.1}
          roughness={0.2}
          metalness={0.8}
        />
        {children}
      </mesh>
    </Float>
  );
}

// 3D Particle System for Background
function ParticleField({ count = 200 }: { count?: number }) {
  const meshRef = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.01;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.005) * 0.1;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#CAFF33"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// 3D Chart Visualization
function Chart3D({ data, type = "bar" }: { data: any[]; type?: "bar" | "pie" | "line" }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  if (type === "bar") {
    return (
      <group ref={groupRef}>
        {data.map((item, i) => (
          <Float key={i} speed={1.5} rotationIntensity={0.1}>
            <mesh position={[i * 0.8 - (data.length * 0.4), item.value * 0.01, 0]}>
              <boxGeometry args={[0.6, item.value * 0.02, 0.6]} />
              <meshStandardMaterial
                color={item.color || "#CAFF33"}
                emissive={item.color || "#CAFF33"}
                emissiveIntensity={0.2}
                roughness={0.3}
                metalness={0.7}
              />
            </mesh>
            <Text
              position={[i * 0.8 - (data.length * 0.4), -0.5, 0]}
              fontSize={0.2}
              color="#F1F5F9"
              anchorX="center"
              anchorY="middle"
            >
              {item.name}
            </Text>
          </Float>
        ))}
      </group>
    );
  }

  return null;
}

// Main 3D Scene Component
export function Scene3D({ 
  children, 
  cameraPosition = [0, 0, 10],
  enableControls = false 
}: {
  children?: React.ReactNode;
  cameraPosition?: [number, number, number];
  enableControls?: boolean;
}) {
  return (
    <Canvas
      style={{ background: "transparent" }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <PerspectiveCamera makeDefault position={cameraPosition} fov={60} />
      
      {enableControls && (
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={true}
          autoRotate
          autoRotateSpeed={0.5}
        />
      )}

      {/* Lighting Setup */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#CAFF33" />
      <pointLight position={[-10, -10, 10]} intensity={0.5} color="#8B5CF6" />
      <spotLight
        position={[0, 20, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.8}
        color="#06D6A0"
        castShadow
      />

      {/* Environment */}
      <Environment preset="night" />
      
      {/* Background Particles */}
      <ParticleField count={150} />
      
      {children}
    </Canvas>
  );
}

export { FloatingCard, Chart3D, ParticleField };