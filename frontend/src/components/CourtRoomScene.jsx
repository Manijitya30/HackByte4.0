import { OrbitControls } from "@react-three/drei";
import { useRef, useEffect } from "react";
import Model from "./Model";
import Character from "./Character";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useCourtStore } from "./store";

export default function CourtroomScene({ script = [], onFinish }) {
  const spotRef = useRef();
  const { camera } = useThree();

  const { activeRole, speak, clear } = useCourtStore();

  // 🎥 Camera 
  useFrame(() => {
    let target = new THREE.Vector3(0, 2, 8);

    if (activeRole === "judge") {
      target = new THREE.Vector3(0, 2.3, 7.5);
    } else if (activeRole === "prosecution") {
      target = new THREE.Vector3(-2, 2.1, 7.5);
    } else if (activeRole === "defense") {
      target = new THREE.Vector3(2, 2.1, 7.5);
    }

    camera.position.lerp(target, 0.05);
    camera.lookAt(0, 1.5, -2);
  });

  // 🎤 Audio
  let currentAudio = null;

  async function playVoice(text) {
    try {
      const res = await fetch("http://localhost:8000/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const blob = await res.blob();

      if (blob.size === 0) {
        console.error("Empty audio received");
        return;
      }

      const url = URL.createObjectURL(blob);

      if (currentAudio) {
        currentAudio.pause();
      }

      const audio = new Audio(url);
      currentAudio = audio;

      await audio.play();

    } catch (err) {
      console.error("Voice error:", err);
    }
  }

  // 🎤 Conversation loop 
  useEffect(() => {
    if (!script || script.length === 0) return;

    const run = async () => {
      for (let line of script) {
        speak(line.role, line.text);

        playVoice(line.text);

        const duration = Math.max(2000, line.text.length * 50);
        await new Promise((r) => setTimeout(r, duration));

        clear();
        await new Promise((r) => setTimeout(r, 800));
      }

      // ✅ IMPORTANT: notify simulation complete
      if (onFinish) onFinish();
    };

    run();
  }, [script]);

  return (
    <>
      {/* 🌫️ Fog */}
      <fog attach="fog" args={["#c4a484", 20, 50]} />

      {/* 💡 Lighting */}
      <ambientLight intensity={1} />
      <directionalLight position={[0, 5, 6]} intensity={2.5} />
      <pointLight position={[0, 5, -3]} intensity={2} color="#ffe0b2" />
      <pointLight position={[-3, 2, 2]} intensity={1.5} />
      <pointLight position={[3, 2, 2]} intensity={1.5} />

      {/* 🏛️ Courtroom */}
      <Model path="/models/courtroom.glb" position={[0, 0, 0]} scale={2} />

      {/* 👨‍⚖️ Judge */}
      <Character
        role="judge"
        path="/models/Judge.glb"
        position={[0, 1.8, -3]}
        scale={1.3}
        rotation={[0, Math.PI / 60, 0]}
      />

      {/* ⚖️ Prosecution */}
      <Character
        role="prosecution"
        path="/models/Prosecution.glb"
        position={[-2.8, 0, 1]}
        scale={1}
        rotation={[0, Math.PI / 4, 0]}
      />

      {/* 🛡️ Defense */}
      <Character
        role="defense"
        path="/models/Defense.glb"
        position={[2.8, 0, 1]}
        scale={1}
        rotation={[0, -Math.PI / 6, 0]}
      />

      {/* 🟤 Circular Base */}
      <mesh position={[0, -1.2, 0]} receiveShadow>
        <cylinderGeometry args={[8, 8, 0.1, 64]} />
        <meshStandardMaterial color="#5a3825" roughness={0.5} />
      </mesh>

      <OrbitControls />
    </>
  );
}