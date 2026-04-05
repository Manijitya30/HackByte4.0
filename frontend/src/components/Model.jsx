import { useGLTF } from "@react-three/drei";

export default function Model({ path, position, scale, rotation }) {
  const { scene } = useGLTF(path);

  return (
    <primitive
      object={scene}
      position={position}
      scale={scale}
      rotation={rotation || [0, 0, 0]}
    />
  );
}