import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import AnimatedProgressBar from "./AnimatedProgressBar";

const RiskBadge = ({ risk, score, maxScore = 100 }) => {
  let bgColor = "bg-green-100";
  let textColor = "text-green-800";
  let borderColor = "border-green-300";
  let icon = CheckCircle;
  let riskLabel = risk || "Safe";
  let percentage = 0;

  if (typeof risk === "number") {
    score = risk;
    if (score < 40) {
      riskLabel = "Safe";
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      borderColor = "border-green-300";
      icon = CheckCircle;
    } else if (score < 70) {
      riskLabel = "Warning";
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
      borderColor = "border-yellow-300";
      icon = AlertTriangle;
    } else {
      riskLabel = "Danger";
      bgColor = "bg-red-100";
      textColor = "text-red-800";
      borderColor = "border-red-300";
      icon = AlertCircle;
    }
    percentage = (score / maxScore) * 100;
  } else {
    if (risk === "safe" || risk === "Safe" || risk === "✅ Clean") {
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      borderColor = "border-green-300";
      icon = CheckCircle;
    } else if (risk === "warning" || risk === "Warning") {
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
      borderColor = "border-yellow-300";
      icon = AlertTriangle;
    } else {
      bgColor = "bg-red-100";
      textColor = "text-red-800";
      borderColor = "border-red-300";
      icon = AlertCircle;
    }
  }

  const Icon = icon;

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  const iconVariants = {
    hidden: { rotate: -20, opacity: 0 },
    visible: {
      rotate: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        delay: 0.1
      }
    },
    animate: {
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop"
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.15,
        duration: 0.3
      }
    }
  };

  return (
    <motion.div
      className={`${bgColor} ${borderColor} border px-4 py-3 rounded-lg flex items-center gap-3`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <motion.div variants={iconVariants} initial="hidden" animate="visible" whileHover="animate">
        <Icon className={`w-5 h-5 ${textColor} flex-shrink-0`} />
      </motion.div>
      <motion.div className="flex-1" variants={textVariants} initial="hidden" animate="visible">
        <motion.p
          className={`${textColor} font-semibold`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {riskLabel}
        </motion.p>
        {score !== undefined && (
          <div className="w-full mt-1">
            <AnimatedProgressBar
              value={score}
              max={maxScore}
              color={
                score < 40
                  ? "bg-green-500"
                  : score < 70
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }
              label={`Score: ${score}/${maxScore}`}
            />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default RiskBadge;
