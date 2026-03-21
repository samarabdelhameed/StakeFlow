"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface ConfettiButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function ConfettiButton({ children, className = "", onClick, ...props }: ConfettiButtonProps) {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 600);
    
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <motion.button
      className={className}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      animate={isClicked ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
      {isClicked && (
        <motion.div
          className="confetti-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="confetti-piece"
              initial={{
                x: 0,
                y: 0,
                scale: 0,
                rotate: 0,
              }}
              animate={{
                x: (Math.random() - 0.5) * 100,
                y: (Math.random() - 0.5) * 100,
                scale: [0, 1, 0],
                rotate: Math.random() * 360,
              }}
              transition={{
                duration: 0.6,
                ease: "easeOut",
                delay: i * 0.02,
              }}
              style={{
                position: "absolute",
                width: "6px",
                height: "6px",
                backgroundColor: ["#CAFF33", "#8B5CF6", "#06D6A0", "#FF4D6A", "#FFB800"][i % 5],
                borderRadius: "2px",
              }}
            />
          ))}
        </motion.div>
      )}
    </motion.button>
  );
}