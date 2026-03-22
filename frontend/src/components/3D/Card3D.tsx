"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

// 3D Interactive Card with Hover Effects
export function Card3D({
  children,
  className = "",
  style = {},
  glowColor = "#CAFF33",
  height = 200,
  tooltip,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  glowColor?: string;
  height?: number;
  tooltip?: string;
  onClick?: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    cardRef.current.style.setProperty("--mouse-x", `${x}%`);
    cardRef.current.style.setProperty("--mouse-y", `${y}%`);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`card-3d glass-card ${className}`}
      style={{
        ...style,
        height,
        cursor: onClick ? "pointer" : "default",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ 
        scale: 1.02,
        z: 20
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 30 
      }}
    >
      <div className="card-3d-glow" style={{ 
        background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${glowColor}25 0%, transparent 80%)` 
      }} />
      
      {/* Content */}
      <div className="card-glow-content" style={{ padding: "24px" }}>
        {children}
      </div>

      {/* Floating Particles */}
      {isHovered && (
        <div className="particle-container" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="particle"
              style={{
                position: "absolute",
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                background: glowColor,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-10, -30, -10],
                opacity: [0, 0.8, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
      )}

      {/* Tooltip */}
      {isHovered && tooltip && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: "absolute",
            bottom: "12px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--bg-secondary)",
            color: "white",
            padding: "6px 14px",
            borderRadius: "8px",
            fontSize: "0.75rem",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 100,
            border: `1px solid ${glowColor}40`,
            boxShadow: `0 8px 24px ${glowColor}20`,
            fontWeight: "600"
          }}
        >
          {tooltip}
        </motion.div>
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
  tooltip,
}: {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  change?: number;
  changeType?: "positive" | "negative" | "neutral";
  icon?: string;
  color?: string;
  tooltip?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const start = Date.now();
    const animate = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4); // Quartic ease out
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
    <Card3D glowColor={color} height={180} tooltip={tooltip}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <h4 style={{ color: "var(--text-dim)", fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {title}
          </h4>
          {icon && (
            <div style={{ 
              width: "36px", 
              height: "36px", 
              borderRadius: "10px", 
              background: `${color}15`, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              fontSize: "1.2rem",
              border: `1px solid ${color}33`,
              boxShadow: `0 0 15px ${color}10`
            }}>
              {icon}
            </div>
          )}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <motion.div
            style={{
              fontSize: "2.5rem",
              fontWeight: "900",
              color: "white",
              fontFamily: "Outfit",
              marginBottom: "8px",
              letterSpacing: "-0.02em"
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <span style={{ color: color, marginRight: "4px" }}>{prefix}</span>
            {displayValue.toLocaleString("en-US", { 
              minimumFractionDigits: suffix === " ETH" ? (value < 0.1 ? 6 : 4) : 1,
              maximumFractionDigits: suffix === " ETH" ? (value < 0.1 ? 6 : 4) : 1,
            })}
            <span style={{ fontSize: "1rem", color: "var(--text-dim)", marginLeft: "4px", fontWeight: "600" }}>{suffix}</span>
          </motion.div>

          {change !== undefined && (
            <motion.div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.9rem",
                color: changeColor,
                fontWeight: "700",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <div style={{ 
                width: "20px", 
                height: "20px", 
                borderRadius: "50%", 
                background: `${changeColor}15`, 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                fontSize: "0.7rem"
              }}>
                {changeType === "positive" ? "↗" : changeType === "negative" ? "↘" : "→"}
              </div>
              {Math.abs(change).toFixed(1)}%
              <span style={{ color: "var(--text-dark)", fontWeight: "500", fontSize: "0.8rem" }}>vs last week</span>
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
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; tx: number; ty: number }>>([]);

  const handleClick = (e: React.MouseEvent) => {
    if (disabled || !onClick) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Create particles for "Burst" effect
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      tx: (Math.random() - 0.5) * 150,
      ty: (Math.random() - 0.5) * 150,
    }));
    
    setParticles(newParticles);
    
    setTimeout(() => {
      setParticles([]);
    }, 800);
    
    onClick();
  };

  const btnClass = variant === "primary" ? "btn-3d-premium" : "btn";
  
  const customStyles: React.CSSProperties = {
    ...style,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
  };

  if (variant === "secondary") {
    customStyles.background = "var(--gradient-surface)";
    customStyles.color = "white";
    customStyles.border = "1px solid var(--glass-border)";
    customStyles.backdropFilter = "blur(10px)";
  } else if (variant === "outline") {
    customStyles.background = "transparent";
    customStyles.color = "var(--neon-green)";
    customStyles.border = "2px solid var(--neon-green)";
    customStyles.boxShadow = "none";
  }

  const sizeStyles = {
    sm: { padding: "10px 20px", fontSize: "0.80rem" },
    md: { padding: "14px 28px", fontSize: "0.95rem" },
    lg: { padding: "18px 36px", fontSize: "1.1rem" },
  };

  return (
    <motion.button
      className={`${btnClass} ${className}`}
      style={{
        ...customStyles,
        ...sizeStyles[size],
        position: "relative",
        overflow: "hidden"
      }}
      onClick={handleClick}
      whileHover={!disabled ? { 
        translateY: -5,
        scale: 1.05,
        translateZ: 20
      } : {}}
      whileTap={!disabled ? { scale: 0.96 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <span style={{ position: "relative", zIndex: 3 }}>{children}</span>
      
      {/* Particle Burst */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="burst-particle"
          style={{
            position: "absolute",
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            left: particle.x,
            top: particle.y,
            background: variant === "primary" ? "white" : "var(--neon-green)",
          }}
          initial={{ scale: 1, opacity: 1 }}
          animate={{
            scale: 0,
            opacity: 0,
            x: particle.tx,
            y: particle.ty,
          }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      ))}

      {variant === "primary" && (
        <motion.div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
          transform: "translateX(-100%)",
          zIndex: 2,
        }} 
        animate={{ translateX: ["-100%", "200%"] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
        />
      )}
    </motion.button>
  );
}