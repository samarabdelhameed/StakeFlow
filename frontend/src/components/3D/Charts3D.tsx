"use client";

import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Text, OrbitControls } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";

// 3D Bar Chart Component
function Bar3D({ 
  position, 
  height, 
  color, 
  label, 
  value,
  onClick 
}: {
  position: [number, number, number];
  height: number;
  color: string;
  label: string;
  value: number;
  onClick?: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      meshRef.current.scale.y = THREE.MathUtils.lerp(
        meshRef.current.scale.y,
        hovered ? height * 1.1 : height,
        0.1
      );
    }
  });

  return (
    <group>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
        <mesh
          ref={meshRef}
          position={[position[0], position[1] + height / 2, position[2]]}
          onClick={onClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          scale={[1, height, 1]}
        >
          <boxGeometry args={[0.8, 1, 0.8]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={hovered ? 0.3 : 0.1}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      </Float>
      
      {/* Label */}
      <Text
        position={[position[0], position[1] - 0.5, position[2]]}
        fontSize={0.3}
        color="#F1F5F9"
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI / 2, 0, 0]}
      >
        {label}
      </Text>
      
      {/* Value Display */}
      {hovered && (
        <Text
          position={[position[0], position[1] + height + 0.5, position[2]]}
          fontSize={0.25}
          color={color}
          anchorX="center"
          anchorY="middle"
        >
          {value.toFixed(2)}%
        </Text>
      )}
    </group>
  );
}

// 3D Donut Chart Component
function DonutSlice3D({
  startAngle,
  endAngle,
  innerRadius = 1.5,
  outerRadius = 2.5,
  color,
  label,
  value,
  onClick,
}: {
  startAngle: number;
  endAngle: number;
  innerRadius?: number;
  outerRadius?: number;
  color: string;
  label: string;
  value: number;
  onClick?: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const angle = endAngle - startAngle;
    
    // Create donut shape
    shape.absarc(0, 0, outerRadius, startAngle, endAngle, false);
    shape.absarc(0, 0, innerRadius, endAngle, startAngle, true);
    
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.3,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
    });
  }, [startAngle, endAngle, innerRadius, outerRadius]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(hovered ? 1.05 : 1);
    }
  });

  const midAngle = (startAngle + endAngle) / 2;
  const labelRadius = (innerRadius + outerRadius) / 2;
  const labelX = Math.cos(midAngle) * labelRadius;
  const labelY = Math.sin(midAngle) * labelRadius;

  return (
    <group>
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.1}>
        <mesh
          ref={meshRef}
          geometry={geometry}
          onClick={onClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={hovered ? 0.3 : 0.1}
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>
      </Float>
      
      {hovered && (
        <Text
          position={[labelX, labelY, 0.5]}
          fontSize={0.2}
          color="#F1F5F9"
          anchorX="center"
          anchorY="middle"
        >
          {label}: {value.toFixed(1)}%
        </Text>
      )}
    </group>
  );
}

// 3D Line Chart Component
function LineChart3D({ 
  data, 
  color = "#CAFF33",
  animated = true 
}: {
  data: Array<{ x: number; y: number; z?: number }>;
  color?: string;
  animated?: boolean;
}) {
  const lineRef = useRef<THREE.Line>(null);
  const pointsRef = useRef<THREE.Points>(null);

  const { lineGeometry, pointsGeometry } = useMemo(() => {
    const points = data.map(d => new THREE.Vector3(d.x, d.y, d.z || 0));
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    
    const positions = new Float32Array(points.length * 3);
    points.forEach((point, i) => {
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
    });
    
    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    return { lineGeometry: lineGeo, pointsGeometry: pointsGeo };
  }, [data]);

  useFrame((state) => {
    if (animated && lineRef.current) {
      lineRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  return (
    <group>
      <line ref={lineRef} geometry={lineGeometry}>
        <lineBasicMaterial color={color} linewidth={3} />
      </line>
      
      <points ref={pointsRef} geometry={pointsGeometry}>
        <pointsMaterial
          size={0.1}
          color={color}
          sizeAttenuation={false}
        />
      </points>
      
      {/* Data Points as Spheres */}
      {data.map((point, i) => (
        <Float key={i} speed={2} rotationIntensity={0.2}>
          <mesh position={[point.x, point.y, point.z || 0]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.3}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

// Main 3D Chart Container
export function Chart3DContainer({
  children,
  height = 400,
  enableControls = true,
  cameraPosition = [5, 5, 5],
}: {
  children: React.ReactNode;
  height?: number;
  enableControls?: boolean;
  cameraPosition?: [number, number, number];
}) {
  return (
    <div style={{ height, width: "100%", position: "relative" }}>
      <Canvas
        camera={{ position: cameraPosition, fov: 60 }}
        style={{ background: "transparent" }}
      >
        {enableControls && (
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            autoRotate={false}
            maxDistance={15}
            minDistance={3}
          />
        )}
        
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#CAFF33" />
        <pointLight position={[-10, -10, 10]} intensity={0.5} color="#8B5CF6" />
        
        {children}
      </Canvas>
    </div>
  );
}

// Allocation Chart 3D
export function AllocationChart3D({ 
  data,
  onValidatorClick 
}: {
  data: Array<{ name: string; value: number; color: string }>;
  onValidatorClick?: (validator: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Chart3DContainer height={350} cameraPosition={[4, 3, 4]}>
        {data.map((item, i) => (
          <Bar3D
            key={item.name}
            position={[i * 1.2 - (data.length * 0.6), 0, 0]}
            height={item.value / 10}
            color={item.color}
            label={item.name}
            value={item.value}
            onClick={() => onValidatorClick?.(item.name)}
          />
        ))}
      </Chart3DContainer>
    </motion.div>
  );
}

// Portfolio Distribution 3D Donut
export function PortfolioDonut3D({ 
  data,
  onSliceClick 
}: {
  data: Array<{ name: string; value: number; color: string }>;
  onSliceClick?: (item: string) => void;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  return (
    <motion.div
      initial={{ opacity: 0, rotateY: -90 }}
      animate={{ opacity: 1, rotateY: 0 }}
      transition={{ duration: 0.8 }}
    >
      <Chart3DContainer height={400} cameraPosition={[0, 0, 6]}>
        {data.map((item, i) => {
          const angle = (item.value / total) * Math.PI * 2;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          currentAngle += angle;

          return (
            <DonutSlice3D
              key={item.name}
              startAngle={startAngle}
              endAngle={endAngle}
              color={item.color}
              label={item.name}
              value={(item.value / total) * 100}
              onClick={() => onSliceClick?.(item.name)}
            />
          );
        })}
      </Chart3DContainer>
    </motion.div>
  );
}

// Performance Timeline 3D
export function PerformanceTimeline3D({ 
  data,
  selectedMetric = "score" 
}: {
  data: Array<{ month: string; [key: string]: any }>;
  selectedMetric?: string;
}) {
  const chartData = data.map((item, i) => ({
    x: i * 0.8 - (data.length * 0.4),
    y: (item[selectedMetric] || 0) * 0.02,
    z: 0,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7 }}
    >
      <Chart3DContainer height={300} cameraPosition={[6, 4, 6]}>
        <LineChart3D
          data={chartData}
          color="#06D6A0"
          animated={true}
        />
      </Chart3DContainer>
    </motion.div>
  );
}

export { Bar3D, DonutSlice3D, LineChart3D };