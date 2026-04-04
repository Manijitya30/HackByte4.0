import React, { useState } from "react";

const AudioAnalysis = ({ file }) => {
  const [reference, setReference] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeAudio = async () => {
    if (!file) return alert("Upload audio first");

    const formData = new FormData();
    formData.append("file", file);

    if (reference) {
      formData.append("reference", reference);
    }

    try {
      setLoading(true);
      setResult(null);

      const res = await fetch("http://127.0.0.1:8000/audio/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Audio analysis failed");
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
          Audio Forensic Analysis
        </h1>
        <p className="text-gray-600 mt-2">
          AI Voice · Tampering · Speaker Verification
        </p>
      </div>

      {/* PRIMARY AUDIO */}
      {file && (
        <div className="max-w-4xl mx-auto px-4 mb-6">
          <div className="bg-white shadow p-6">
            <p className="text-sm text-gray-500 mb-2">
              Primary Audio
            </p>

            <p className="font-medium mb-3">{file.name}</p>

            <audio controls className="w-full">
              <source src={URL.createObjectURL(file)} />
            </audio>
          </div>
        </div>
      )}

      {/* REFERENCE AUDIO */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="bg-white shadow p-6">

          <p className="text-sm text-gray-500 mb-2">
            Reference Audio (Optional)
          </p>

          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setReference(e.target.files[0])}
            className="mb-4"
          />

          {reference && (
            <>
              <p className="font-medium mb-2">{reference.name}</p>
              <audio controls className="w-full">
                <source src={URL.createObjectURL(reference)} />
              </audio>
            </>
          )}
        </div>
      </div>

      {/* BUTTON */}
      {file && (
        <div className="text-center mb-10">
          <button
            onClick={analyzeAudio}
            disabled={loading}
            className={`px-10 py-3 transition shadow
              ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#C5A880] hover:scale-105 text-white"}
            `}
          >
            {loading ? "Analyzing..." : "Analyze Audio"}
          </button>
        </div>
      )}

      {/* RESULT */}
      {result && (
        <div className="max-w-5xl mx-auto px-4 space-y-8">

          {/* FINAL VERDICT */}
          <div className="bg-white shadow-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">
              Final Verdict
            </h2>

            <p className="text-2xl font-bold">
              {result.final.final.verdict}
            </p>

            <p className="text-sm text-gray-500 mt-2">
              Risk Score: {result.final.final.risk_score} / 100
            </p>
          </div>

          {/* AI DETECTION */}
          <div className="bg-white shadow p-6">
            <h2 className="font-semibold mb-3">
              AI Voice Detection
            </h2>

            <p>{result.ai_detection.verdict}</p>
            <p>AI Probability: {result.ai_detection.ai_probability}</p>
          </div>

          {/* TAMPERING */}
          <div className="bg-white shadow p-6">
            <h2 className="font-semibold mb-3">
              Tampering Detection
            </h2>

            <p>{result.tampering.verdict}</p>
            <p>Score: {result.tampering.tamper_score}</p>
          </div>

          {/* SPEAKER */}
          <div className="bg-white shadow p-6">
            <h2 className="font-semibold mb-3">
              Speaker Verification
            </h2>

            <p>{result.speaker.verdict}</p>
            <p>Similarity: {result.speaker.similarity}</p>
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

export default AudioAnalysis;