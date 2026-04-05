
import { Html } from "@react-three/drei";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function SpeechBubble({ text, role }) {
  const [displayed, setDisplayed] = useState("");

  // 🧠 Typewriter
  useEffect(() => {
    let i = 0;
    setDisplayed("");

    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));

      if (i >= text.length) clearInterval(interval);
    }, 20); // slightly slower for readability

    return () => clearInterval(interval);
  }, [text]);

  const roleColors = {
    judge: "#f59e0b",
    prosecution: "#ef4444",
    defense: "#3b82f6"
  };

  return (
    <group position={[0,0.5, 0]}> {/* 👈 fixed base height */}

      {/* ❌ removed "center" → important */}
   <Html center>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25 }}
          style={bubbleStyle}
        >
          {/* Role */}
          <div
            style={{
              fontSize: "13px",
              fontWeight: "bold",
              color: roleColors[role],
              marginBottom: "6px",
              textTransform: "uppercase"
            }}
          >
            {role}
          </div>

          {/* Text */}
          <div style={textStyle}>
            {displayed}
          </div>
        </motion.div>
      </Html>
    </group>
  );
}

const bubbleStyle = {
  background: "white",
  padding: "14px 16px",
  borderRadius: "12px",
  color: "#111827",
  fontSize:"17px",
  width: "280px",
  maxWidth: "320px",

  maxHeight: "140px",        // 🔥 KEY FIX
  overflowY: "auto",         // 🔥 prevents overflow

  boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
};

const textStyle = {
  fontSize: "15px",
  lineHeight: "1.4",
  wordBreak: "break-word",
};