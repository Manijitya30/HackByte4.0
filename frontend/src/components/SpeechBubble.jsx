import { Html } from "@react-three/drei";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

export default function SpeechBubble({ text, role }) {
  const [displayed, setDisplayed] = useState("");
  const [offsetY, setOffsetY] = useState(1.8);
  const boxRef = useRef();

  useEffect(() => {
    let i = 0;
    setDisplayed("");

    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 18);

    return () => clearInterval(interval);
  }, [text]);

  // 🔥 Measure height and adjust position
  useEffect(() => {
    if (boxRef.current) {
      const height = boxRef.current.offsetHeight;

      // Convert px → 3D units (approx scaling)
      const shift = height / 150;

      setOffsetY(-0.1 + Math.min(shift * 0.8, 0.8));
    }
  }, [displayed]);

  const roleColors = {
    judge: "#f59e0b",
    prosecution: "#ef4444",
    defense: "#3b82f6"
  };

  return (
    <group position={[0, offsetY, 0]}>
      <Html center>
        <motion.div
          ref={boxRef}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35 }}
          style={bubbleStyle}
        >
          {/* Role */}
          <div
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: roleColors[role],
              marginBottom: "4px",
              textTransform: "uppercase"
            }}
          >
            {role}
          </div>

          {/* Text */}
          <div>{displayed}</div>
        </motion.div>
      </Html>
    </group>
  );
}

const bubbleStyle = {
  background: "white",
  padding: "14px 18px",
  borderRadius: "14px",
  color: "#111827",
  fontSize: "17px",
  width: "300px", 
 
  maxWidth: "520px",
  minWidth: "200px",
  
  boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
};