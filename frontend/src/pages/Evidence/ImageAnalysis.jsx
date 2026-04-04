import React, { useState, useRef, useEffect } from "react";

const ImageAnalysis = ({ file }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const resultRef = useRef(null);

  useEffect(() => {
    if (result && resultRef.current) {
      const yOffset = -80;
      const y =
        resultRef.current.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;

      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [result]);

  const analyzeImage = async () => {
    if (!file) return alert("Please upload an image first");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setResult(null);

      const res = await fetch("http://127.0.0.1:8000/analyze/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Error analyzing image");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F4] pt-12 pb-20">

      {/* HEADER */}
     

      {/* BUTTON */}
      <div className="text-center mb-8">
        <button
          onClick={analyzeImage}
          className="bg-[#C5A880] text-white px-10 py-3 hover:scale-105 transition-all shadow-md"
        >
          {loading ? "Analyzing..." : "Analyze Evidence"}
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-center text-gray-500">
          Running forensic models...
        </p>
      )}

      {/* RESULT */}
      {result && (
        <div
          ref={resultRef}
          className="max-w-5xl mx-auto px-4 space-y-8"
        >

          {/* 🖼 VISUAL */}
          {result.images && (
            <div className="bg-white shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-[#0B132B]">
                Visual Analysis
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <img
                  src={result.images.original}
                  className="w-full border"
                />
                <img
                  src={result.images.heatmap}
                  className="w-full border"
                />
              </div>
            </div>
          )}

          {/* 🔍 METADATA */}
          <div className="bg-white shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#0B132B]">
              Metadata Analysis
            </h2>

            <p>Status: {result.metadata.status}</p>
            <p>Score: {result.metadata.score}</p>

            <div className="mt-4 space-y-2">
              {result.metadata.flags.map((flag, i) => (
                <div key={i} className="text-sm text-gray-700">
                  ⚠ {flag}
                </div>
              ))}
            </div>
          </div>

          {/* 🤖 AI */}
          <div className="bg-white shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#0B132B]">
              AI Detection
            </h2>

            <p>{result.ai_detection.result}</p>
            <p className="text-sm text-gray-500">
              Confidence: {result.ai_detection.confidence}
            </p>
          </div>

          {/* 🎭 DEEPFAKE */}
          <div className="bg-white shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#0B132B]">
              Deepfake Detection
            </h2>

            <p>{result.deepfake.verdict}</p>
            <p>Probability: {result.deepfake.deepfake_probability}</p>
            <p>
              Flagged: {result.deepfake.flagged ? "Yes" : "No"}
            </p>
          </div>

          {/* 🧩 TAMPERING */}
          <div className="bg-white shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#0B132B]">
              Tampering Detection
            </h2>

            <p>
              {result.tampering.tampered
                ? "⚠ Tampered"
                : "✅ Clean"}
            </p>

            <p className="text-sm text-gray-500">
              Confidence: {result.tampering.confidence}
            </p>
          </div>

          {/* DOWNLOAD */}
          <div className="text-center">
            <a
              href={result.report_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#0B132B] text-white px-8 py-3 hover:scale-105 transition"
            >
              Download Report
            </a>
          </div>

        </div>
      )}
    </div>
  );
};

export default ImageAnalysis;