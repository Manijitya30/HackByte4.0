import { Canvas } from "@react-three/fiber";
import CourtroomScene from "../components/CourtRoomScene";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import jsPDF from "jspdf";

export default function Simulator() {

 
  const { state } = useLocation();

  const [showReport, setShowReport] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const script = state?.script || [];
  const longArguments = state?.long || [];
  const reportData = state?.report || "";

  const formattedReport = reportData ? JSON.parse(reportData) : null;

  // 📄 PDF GENERATOR
  const downloadPDF = () => {
    if (!formattedReport) return;

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Courtroom Judgment Report", 20, 20);

    doc.setFontSize(12);

    doc.text("Reasoning:", 20, 80);

    const splitText = doc.splitTextToSize(formattedReport.long, 170);
    doc.text(splitText, 20, 90);

    doc.save("case_report.pdf");
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        background:
          "radial-gradient(circle at center, #e6d3b3 0%, #b8956b 40%, #5a3825 100%)",
      }}
    >
      {/* 🎭 3D COURTROOM */}
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <CourtroomScene
          script={script}
          onFinish={() => setShowReport(true)}
        />
      </Canvas>

      {/* 📊 BUTTON */}
      <div className="absolute top-6 left-6">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="px-4 py-2 rounded-lg bg-[#2d1b0e]/80 text-white backdrop-blur-md border border-[#c5a880]"
        >
          {showDetails ? "Hide Details" : "Show Arguments"}
        </button>
      </div>

      {/* 📜 ARGUMENT PANEL */}
      {showDetails && (
        <div className="absolute top-20 left-6 w-[380px] h-[70vh] overflow-y-auto rounded-xl backdrop-blur-md bg-[#2d1b0e]/70 text-white p-4 border border-[#c5a880] shadow-xl">
          <h2 className="text-lg font-bold mb-4 text-[#c5a880]">
            Detailed Arguments
          </h2>

          {longArguments.map((item, index) => (
            <div key={index} className="mb-4 border-b border-white/20 pb-2">
              <p className="font-semibold capitalize text-[#fcd34d]">
                {item.role}
              </p>
              <p className="text-sm text-white/90">{item.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* ⚖️ FINAL JUDGMENT PANEL */}
      {showReport && formattedReport && (
        <div className="absolute top-6 right-6 w-[360px] rounded-xl backdrop-blur-md bg-[#2d1b0e]/80 text-white p-5 border border-[#c5a880] shadow-xl">

          <h2 className="text-xl font-bold mb-3 text-[#c5a880]">
            Final Judgment
          </h2>


          <button
            onClick={downloadPDF}
            className="w-full mt-2 px-4 py-3 rounded-lg bg-[#c5a880] text-black font-semibold hover:bg-[#b89a70]"
          >
            Download PDF Report
          </button>
        </div>
      )}
    </div>
  );
}