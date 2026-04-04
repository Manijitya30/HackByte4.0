import { Canvas } from "@react-three/fiber";
import CourtroomScene from "../components/CourtRoomScene";
import { useLocation } from "react-router-dom";
import { useState } from "react";

export default function Simulator() {
  const { state } = useLocation();
  const [showReport, setShowReport] = useState(false);

  const script = state?.script || [];
  const report = state?.report || "";

  return (
    <div style={{ width: "100vw", height: "100vh" }}>

      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <CourtroomScene
          script={script}
          onFinish={() => setShowReport(true)}
        />
      </Canvas>

      {/* 📄 REPORT DOWNLOAD */}
      {showReport && (
        <div className="absolute bottom-10 right-10">
          <button
            onClick={() => {
              const blob = new Blob([report], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "case_report.txt";
              a.click();
            }}
            className="px-5 py-3 bg-green-600 text-white"
          >
            Download Report
          </button>
        </div>
      )}
    </div>
  );
}