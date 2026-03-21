"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function FloatingNode({ position, color, size }: { position: [number, number, number]; color: string; size: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3 + position[0]) * 0.2;
      meshRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.2 + position[1]) * 0.3;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={meshRef} position={position}>
        <octahedronGeometry args={[size, 0]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.15}
          wireframe
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>
    </Float>
  );
}

function ConnectionLine({ start, end, color }: { start: [number, number, number]; end: [number, number, number]; color: string }) {
  const points = useMemo(() => {
    return [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  }, [start, end]);

  const lineObject = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.06 });
    return new THREE.Line(geo, mat);
  }, [points, color]);

  return <primitive object={lineObject} />;
}

function Particles({ count = 60 }: { count?: number }) {
  const meshRef = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
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
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#8B5CF6"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

function Scene() {
  const nodes: { pos: [number, number, number]; color: string; size: number }[] = [
    { pos: [-4, 2, -3], color: "#CAFF33", size: 0.5 },
    { pos: [3, -1, -4], color: "#8B5CF6", size: 0.7 },
    { pos: [-2, -3, -5], color: "#06D6A0", size: 0.4 },
    { pos: [5, 3, -6], color: "#CAFF33", size: 0.3 },
    { pos: [-5, 0, -4], color: "#8B5CF6", size: 0.6 },
    { pos: [1, 4, -5], color: "#06D6A0", size: 0.35 },
    { pos: [4, -3, -3], color: "#CAFF33", size: 0.45 },
    { pos: [-3, 3, -6], color: "#FF4D6A", size: 0.3 },
  ];

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#CAFF33" />
      <pointLight position={[-5, -5, 5]} intensity={0.3} color="#8B5CF6" />

      {nodes.map((node, i) => (
        <FloatingNode key={i} position={node.pos} color={node.color} size={node.size} />
      ))}

      <ConnectionLine start={nodes[0].pos} end={nodes[1].pos} color="#CAFF33" />
      <ConnectionLine start={nodes[1].pos} end={nodes[2].pos} color="#8B5CF6" />
      <ConnectionLine start={nodes[2].pos} end={nodes[3].pos} color="#06D6A0" />
      <ConnectionLine start={nodes[4].pos} end={nodes[5].pos} color="#8B5CF6" />
      <ConnectionLine start={nodes[5].pos} end={nodes[6].pos} color="#CAFF33" />

      <Particles count={80} />
    </>
  );
}

export default function Background3D() {
  return (
    <div className="scene-bg">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
