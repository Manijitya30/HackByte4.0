import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

const ResultCard = ({
  title,
  icon: Icon,
  children,
  variant = "default",
  status = "info",
  delay = 0
}) => {
  const statusConfig = {
    safe: {
      border: "border-green-200",
      bg: "bg-green-50",
      header: "bg-green-100",
      icon: CheckCircle,
      iconColor: "text-green-600"
    },
    warning: {
      border: "border-yellow-200",
      bg: "bg-yellow-50",
      header: "bg-yellow-100",
      icon: AlertCircle,
      iconColor: "text-yellow-600"
    },
    danger: {
      border: "border-red-200",
      bg: "bg-red-50",
      header: "bg-red-100",
      icon: AlertCircle,
      iconColor: "text-red-600"
    },
    info: {
      border: "border-blue-200",
      bg: "bg-blue-50",
      header: "bg-blue-100",
      icon: Info,
      iconColor: "text-blue-600"
    }
  };

  const config = statusConfig[status] || statusConfig.info;
  const StatusIcon = config.icon;

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
        delay
      }
    },
    hover: {
      y: -4,
      boxShadow: "0 25px 30px -5px rgba(0, 0, 0, 0.15)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        delay: delay + 0.1,
        duration: 0.4
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: delay + 0.2,
        duration: 0.4
      }
    }
  };

  return (
    <motion.div
      className={`${config.border} border rounded-lg overflow-hidden shadow-md`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      {/* Header */}
      <motion.div
        className={`${config.header} px-6 py-4 flex items-center gap-3`}
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="opacity-50"
        >
          {Icon ? (
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
          ) : (
            <StatusIcon className={`w-5 h-5 ${config.iconColor}`} />
          )}
        </motion.div>
        <motion.h3
          className="text-lg font-semibold text-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.15 }}
        >
          {title}
        </motion.h3>
      </motion.div>

      {/* Content */}
      <motion.div
        className={`${config.bg} px-6 py-5`}
        variants={contentVariants}
        initial="hidden"
        animate="visible"
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default ResultCard;

