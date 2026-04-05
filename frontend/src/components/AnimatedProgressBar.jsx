import React from "react";
import { motion } from "framer-motion";

const AnimatedProgressBar = ({
  value = 0,
  max = 100,
  color = "bg-blue-500",
  animated = true,
  label = null
}) => {
  const percentage = (value / max) * 100;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const barVariants = {
    hidden: { width: 0 },
    visible: {
      width: `${percentage}%`,
      transition: {
        duration: 1.2,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">{label}</span>
          <span className="text-sm font-bold text-gray-600">
            {Math.round(percentage)}%
          </span>
        </div>
      )}

      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <motion.div
          className={`h-full ${color} rounded-full shadow-lg`}
          variants={barVariants}
          initial="hidden"
          animate="visible"
          style={{
            backgroundImage: animated
              ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)"
              : "none",
            backgroundSize: "200% 100%",
            animation: animated ? "shimmer 1.5s infinite" : "none"
          }}
        />
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </motion.div>
  );
};

export default AnimatedProgressBar;
