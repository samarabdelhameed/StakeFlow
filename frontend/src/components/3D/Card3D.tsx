"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Text } from "@react-three/drei";
import * as THREE from "three";

// 3D Interactive Card with Hover Effects
export function Card3D({
  children,
  className = "",
  style = {},
  glowColor = "#8B5CF6",
  height = 200,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  glowColor?: string;
  height?: number;
  onClick?: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x: x * 100, y: y * 100 });
  };

  return (
    <motion.div
      ref={cardRef}
      className={`card-3d ${className}`}
      style={{
        ...style,
        height,
        position: "relative",
        background: `
          radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, 
            ${glowColor}15, transparent 60%),
          linear-gradient(135deg, 
            rgba(26, 26, 62, 0.8) 0%, 
            rgba(37, 37, 80, 0.6) 100%)
        `,
        backdropFilter: "blur(24px)",
        border: `1px solid ${isHovered ? glowColor + "40" : "rgba(255,255,255,0.1)"}`,
        borderRadius: "16px",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        boxShadow: isHovered 
          ? `0 20px 60px ${glowColor}20, 0 0 0 1px ${glowColor}30`
          : "0 8px 32px rgba(0,0,0,0.3)",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ 
        scale: 1.02,
        rotateX: 2,
        rotateY: 2,
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }}
    >
      {/* Animated Border Gradient */}
      <motion.div
        className="card-border-glow"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `conic-gradient(from 0deg, ${glowColor}, transparent, ${glowColor})`,
          borderRadius: "16px",
          padding: "1px",
          opacity: isHovered ? 0.6 : 0,
        }}
        animate={{ rotate: isHovered ? 360 : 0 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "var(--bg-card)",
            borderRadius: "15px",
          }}
        />
      </motion.div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, padding: "24px", height: "100%" }}>
        {children}
      </div>

      {/* Floating Particles */}
      {isHovered && (
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              style={{
                position: "absolute",
                width: "4px",
                height: "4px",
                background: glowColor,
                borderRadius: "50%",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, -40, -20],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// 3D Stats Card with Animated Counter
export function StatsCard3D({
  title,
  value,
  suffix = "",
  prefix = "",
  change,
  changeType = "positive",
  icon,
  color = "#CAFF33",
}: {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  change?: number;
  changeType?: "positive" | "negative" | "neutral";
  icon?: string;
  color?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const start = Date.now();
    const animate = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(value * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    animate();
  }, [value]);

  const changeColor = {
    positive: "#06D6A0",
    negative: "#FF4D6A",
    neutral: "#94A3B8",
  }[changeType];

  return (
    <Card3D glowColor={color} height={160}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h4 style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: 500 }}>
            {title}
          </h4>
          {icon && (
            <span style={{ fontSize: "1.5rem", opacity: 0.8 }}>
              {icon}
            </span>
          )}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <motion.div
            style={{
              fontSize: "2.2rem",
              fontWeight: 800,
              color: color,
              fontFamily: "JetBrains Mono",
              marginBottom: "8px",
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {prefix}{displayValue.toLocaleString("en-US", { 
              minimumFractionDigits: suffix === "ETH" ? 2 : 0,
              maximumFractionDigits: suffix === "ETH" ? 4 : 0,
            })}{suffix}
          </motion.div>

          {change !== undefined && (
            <motion.div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.85rem",
                color: changeColor,
                fontWeight: 600,
              }}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <span>{changeType === "positive" ? "↗" : changeType === "negative" ? "↘" : "→"}</span>
              {Math.abs(change).toFixed(1)}%
            </motion.div>
          )}
        </div>
      </div>
    </Card3D>
  );
}

// 3D Button with Particle Effects
export function Button3D({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [isPressed, setIsPressed] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (e: React.MouseEvent) => {
    if (disabled || !onClick) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Create particles
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
    }));
    
    setParticles(newParticles);
    setIsPressed(true);
    
    setTimeout(() => {
      setParticles([]);
      setIsPressed(false);
    }, 600);
    
    onClick();
  };

  const variants = {
    primary: {
      background: "linear-gradient(135deg, #CAFF33, #8B5CF6)",
      color: "#0d0d1a",
      border: "none",
    },
    secondary: {
      background: "linear-gradient(135deg, #8B5CF6, #06D6A0)",
      color: "#F1F5F9",
      border: "none",
    },
    outline: {
      background: "transparent",
      color: "#CAFF33",
      border: "2px solid #CAFF33",
    },
  };

  const sizes = {
    sm: { padding: "8px 16px", fontSize: "0.85rem" },
    md: { padding: "12px 24px", fontSize: "0.95rem" },
    lg: { padding: "16px 32px", fontSize: "1.1rem" },
  };

  return (
    <motion.button
      className={`btn-3d ${className}`}
      style={{
        ...variants[variant],
        ...sizes[size],
        ...style,
        position: "relative",
        borderRadius: "12px",
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        overflow: "hidden",
        opacity: disabled ? 0.5 : 1,
        boxShadow: variant === "primary" 
          ? "0 8px 32px rgba(202, 255, 51, 0.3)"
          : "0 8px 32px rgba(139, 92, 246, 0.2)",
      }}
      onClick={handleClick}
      whileHover={!disabled ? { 
        scale: 1.05,
        boxShadow: variant === "primary"
          ? "0 12px 48px rgba(202, 255, 51, 0.4)"
          : "0 12px 48px rgba(139, 92, 246, 0.3)",
      } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      animate={isPressed ? { scale: [1, 1.1, 1] } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
      
      {/* Particle Effects */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          style={{
            position: "absolute",
            left: particle.x,
            top: particle.y,
            width: "6px",
            height: "6px",
            background: variant === "primary" ? "#8B5CF6" : "#CAFF33",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
          initial={{ scale: 0, x: 0, y: 0 }}
          animate={{
            scale: [0, 1, 0],
            x: (Math.random() - 0.5) * 100,
            y: (Math.random() - 0.5) * 100,
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}
    </motion.button>
  );
}