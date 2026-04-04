import { useCourtStore } from "./store";
import SpeechBubble from "./SpeechBubble";
import { useGLTF } from "@react-three/drei";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";




export default function Character({ role, path, position, scale, rotation }) {
  const { scene } = useGLTF(path);
  const { activeRole, text } = useCourtStore();

  const isActive = activeRole === role;
  const ref = useRef();
useFrame((state) => {
  if (isActive && ref.current) {
    ref.current.position.y =
      baseY + Math.sin(state.clock.elapsedTime * 2) * 0.03;
  }
});

  return (
    <group position={position} scale={scale} rotation={rotation}>
      <primitive object={scene} />

      {/* 💡 Glow */}
      {isActive && (
  <>
    <pointLight position={[0, 2, 0]} intensity={2} color="#facc15" />
    <pointLight position={[0, 1, 0]} intensity={1} color="#fff3c4" />
  </>
)}

      {/* 💬 Dialogue */}
      {isActive && (
        <group position={[0, 1.4, 0]}>
          <SpeechBubble text={text} role={role}/>
        </group>
      )}
    </group>
  );
}