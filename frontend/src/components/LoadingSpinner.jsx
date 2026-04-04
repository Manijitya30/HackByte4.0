import React from "react";
import { motion } from "framer-motion";

const LoadingSpinner = ({ message = "Processing..." }) => {
  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const textVariants = {
    animate: {
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const dotVariants = {
    animate: (i) => ({
      y: [0, -10, 0],
      transition: {
        duration: 1,
        repeat: Infinity,
        delay: i * 0.1
      }
    })
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main Spinner */}
      <div className="relative w-16 h-16 mb-6">
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#C5A880] border-r-[#C5A880]"
          variants={spinnerVariants}
          animate="animate"
        />

        {/* Inner ring */}
        <motion.div
          className="absolute inset-2 rounded-full border-4 border-transparent border-b-[#C5A880] border-l-[#C5A880]"
          variants={spinnerVariants}
          animate="animate"
          style={{ animationDirection: "reverse" }}
        />

        {/* Pulse effect */}
        <motion.div
          className="absolute inset-4 rounded-full border-2 border-[#C5A880]/30"
          variants={pulseVariants}
          animate="animate"
        />
      </div>

      {/* Message with animation */}
      <motion.p
        className="text-gray-600 font-medium"
        variants={textVariants}
        animate="animate"
      >
        {message}
      </motion.p>

      {/* Animated dots */}
      <div className="flex gap-1 mt-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 bg-[#C5A880] rounded-full"
            custom={i}
            variants={dotVariants}
            animate="animate"
          />
        ))}
      </div>

      <motion.p
        className="text-xs text-gray-500 mt-3"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Analyzing evidence...
      </motion.p>
    </motion.div>
  );
};

export default LoadingSpinner;
