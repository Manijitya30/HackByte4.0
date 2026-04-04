import React, { useState } from "react";

const VideoAnalysis = ({ file }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeVideo = async () => {
    if (!file) return alert("Upload video first");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setResult(null);

      const res = await fetch("http://127.0.0.1:8000/video/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Video analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F4] pt-28 pb-20">

      {/* HEADER */}
      <div className="text-center mb-10">
        <h1
          className="text-4xl font-bold text-[#0B132B]"
          style={{ fontFamily: "Playfair Display" }}
        >
          Video Forensic Analysis
        </h1>
        <p className="text-gray-600 mt-2">
          Deepfake · Compression · Splicing · Sync Verification
        </p>
      </div>

      {/* 🔥 VIDEO PREVIEW */}
      {file && (
        <div className="max-w-4xl mx-auto px-4 mb-8">
          <div className="bg-white shadow p-6">

            <p className="text-sm text-gray-500 mb-2">
              Uploaded File
            </p>

            <p className="font-medium mb-4">
              {file.name}
            </p>

            <video
              src={URL.createObjectURL(file)}
              controls
              className="w-full max-h-[400px] object-contain border rounded-md"
            />
          </div>
        </div>
      )}

      {/* 🔥 ANALYZE BUTTON (ONLY IF FILE EXISTS) */}
      {file && (
        <div className="text-center mb-10">
          <button
            onClick={analyzeVideo}
            disabled={loading}
            className={`px-10 py-3 transition shadow
              ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#C5A880] hover:scale-105 text-white"}
            `}
          >
            {loading ? "Analyzing..." : "Run Full Analysis"}
          </button>
        </div>
      )}

      {/* 🔥 RESULT */}
      {result && (
        <div className="max-w-5xl mx-auto px-4 space-y-8">

          {/* VERDICT */}
          <div className="bg-white shadow-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">
              Final Verdict
            </h2>

            <p className="text-2xl font-bold">
              {result.verdict}
            </p>

            <p className="text-sm text-gray-500 mt-2">
              Risk Score: {result.risk_score}
            </p>
          </div>

          {/* DEEPFAKE */}
          <div className="bg-white shadow p-6">
            <h2 className="font-semibold mb-3">
              Deepfake Detection
            </h2>

            <p>Score: {result.deepfake.average_deepfake_score}</p>
          </div>

          {/* COMPRESSION */}
          <div className="bg-white shadow p-6">
            <h2 className="font-semibold mb-3">
              Compression Analysis
            </h2>

            <p>
              Suspicious:{" "}
              {result.compression.overall_suspicious ? "Yes" : "No"}
            </p>
          </div>

          {/* SPLICE */}
          <div className="bg-white shadow p-6">
            <h2 className="font-semibold mb-3">
              Splice Detection
            </h2>

            <p>
              Suspicious:{" "}
              {result.splice.overall_suspicious ? "Yes" : "No"}
            </p>
          </div>

          {/* SYNC */}
          <div className="bg-white shadow p-6">
            <h2 className="font-semibold mb-3">
              Audio-Video Sync
            </h2>

            <p>{result.sync.status}</p>
          </div>

          {/* METADATA */}
          <div className="bg-white shadow p-6">
            <h2 className="font-semibold mb-3">
              Metadata Signals
            </h2>

            {result.metadata.main.risk_signals?.length === 0 ? (
              <p className="text-green-600">No issues</p>
            ) : (
              result.metadata.main.risk_signals.map((f, i) => (
                <p key={i}>⚠ {f}</p>
              ))
            )}
          </div>

          {/* DOWNLOAD */}
          <div className="text-center">
            <a
              href={result.report_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#0B132B] text-white px-8 py-3 hover:scale-105 transition"
            >
              Download Full Report
            </a>
          </div>

        </div>
      )}
    </div>
  );
};

export default VideoAnalysis;