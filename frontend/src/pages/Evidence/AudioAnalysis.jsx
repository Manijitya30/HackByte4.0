import React, { useState, useRef, useEffect } from "react";
import { Download, Mic } from "lucide-react";
import { motion } from "framer-motion";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";

const AudioAnalysis = () => {
  const [file, setFile] = useState(null);
  const [reference, setReference] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

  const analyzeAudio = async () => {
    if (!file) {
      setError("Please upload audio first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    if (reference) {
      formData.append("reference", reference);
    }

    try {
      setLoading(true);
      setResult(null);
      setError(null);

      const res = await fetch("http://127.0.0.1:8000/audio/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze audio. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F4] pt-16 pb-24">

      {/* HERO */}
      <div className="text-center mb-12 px-4">
        <h1 className="text-5xl font-bold text-[#0B132B] leading-tight">
          Analyze Audio Evidence with <br />
          <span className="text-[#C5A880]">Advanced Forensics</span>
        </h1>

        <p className="mt-6 text-gray-600 max-w-2xl mx-auto text-lg">
          Detect AI-generated voices, tampering, and verify speaker identity
          using advanced audio forensic techniques.
        </p>
      </div>

      {/* UPLOAD PRIMARY */}
      <div className="max-w-3xl mx-auto px-4">
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center bg-white hover:border-[#C5A880] transition">

          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
              <Mic className="w-6 h-6 text-gray-500" />
            </div>

            <p className="text-gray-700 font-medium">
              Upload primary audio file
            </p>

            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
              id="audioUpload"
            />

            <label
              htmlFor="audioUpload"
              className="cursor-pointer mt-2 px-6 py-2 bg-[#C5A880] text-white rounded shadow"
            >
              Browse Audio
            </label>
          </div>
        </div>
      </div>

      {/* PRIMARY PREVIEW */}
      {file && (
        <div className="max-w-3xl mx-auto mt-6 px-4">
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500 mb-2">{file.name}</p>
            <audio controls className="w-full">
              <source src={URL.createObjectURL(file)} />
            </audio>
          </div>
        </div>
      )}

      {/* REFERENCE UPLOAD */}
      <div className="max-w-3xl mx-auto mt-6 px-4">
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-2">
            Optional: Upload reference audio (for speaker verification)
          </p>

          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setReference(e.target.files[0])}
          />

          {reference && (
            <div className="mt-3">
              <p className="text-sm text-gray-500">{reference.name}</p>
              <audio controls className="w-full mt-2">
                <source src={URL.createObjectURL(reference)} />
              </audio>
            </div>
          )}
        </div>
      </div>

      {/* ERROR */}
      <div className="max-w-3xl mx-auto px-4">
        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
      </div>

      {/* BUTTON */}
      <div className="text-center mt-10">
        <button
          onClick={analyzeAudio}
          disabled={loading}
          className="px-10 py-3 bg-[#C5A880] text-white font-medium rounded shadow-md hover:scale-105 transition"
        >
          {loading ? "Analyzing..." : "Analyze Audio"}
        </button>
      </div>

      {/* LOADING */}
      {loading && <LoadingSpinner message="Analyzing audio..." />}

      {/* RESULTS */}
      {result && (
        <motion.div
          ref={resultRef}
          className="max-w-5xl mx-auto mt-16 px-4 space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >

          {/* SUMMARY */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#0B132B] mb-2">
              Analysis Summary
            </h2>
            <p className="text-gray-600">
              Verdict: {result.final?.final?.verdict}
            </p>
            <p className="text-gray-600">
              Risk Score: {result.final?.final?.risk_score}
            </p>
          </div>

          {/* AI DETECTION */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#0B132B] mb-2">
              AI Voice Detection
            </h2>
            <p className="text-gray-600">{result.ai_detection?.verdict}</p>

            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-[#C5A880]"
                  style={{
                    width: `${result.ai_detection?.ai_probability || 0}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {result.ai_detection?.ai_probability}%
              </p>
            </div>
          </div>

          {/* TAMPERING */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#0B132B] mb-2">
              Tampering Detection
            </h2>
            <p className="text-gray-600">{result.tampering?.verdict}</p>
          </div>

          {/* SPEAKER */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#0B132B] mb-2">
              Speaker Verification
            </h2>
            <p className="text-gray-600">{result.speaker?.verdict}</p>

            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-[#C5A880]"
                  style={{
                    width: `${result.speaker?.similarity || 0}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {result.speaker?.similarity}%
              </p>
            </div>
          </div>

          {/* METADATA (SAFE FIX INCLUDED) */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#0B132B] mb-2">
              Metadata Analysis
            </h2>

            {result?.metadata?.main?.risk_signals?.length ? (
              <ul className="text-gray-600 space-y-1">
                {result.metadata.main.risk_signals.map((signal, i) => (
                  <li key={i}>• {signal}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No suspicious metadata detected</p>
            )}
          </div>

          {/* DOWNLOAD */}
          <div className="text-center pt-6">
            <a
              href={result.report_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#0B132B] text-white px-8 py-3 rounded shadow hover:scale-105 transition"
            >
              <Download className="w-4 h-4" />
              Download Full Report
            </a>
          </div>

        </motion.div>
      )}
    </div>
  );
};

export default AudioAnalysis;