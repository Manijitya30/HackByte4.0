import React, { useState, useRef, useEffect } from "react";
import { Download, Film } from "lucide-react";
import { motion } from "framer-motion";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";

const VideoAnalysis = () => {
  const [file, setFile] = useState(null);
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

  const analyzeVideo = async () => {
    if (!file) {
      setError("Please upload a video first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setResult(null);
      setError(null);

      const res = await fetch("http://127.0.0.1:8000/video/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze video. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F4] pt-16 pb-24">

      {/* HERO */}
      <div className="text-center mb-12 px-4">
        <h1 className="text-5xl font-bold text-[#0B132B] leading-tight">
          Analyze Video Evidence with <br />
          <span className="text-[#C5A880]">Advanced Forensics</span>
        </h1>

        <p className="mt-6 text-gray-600 max-w-2xl mx-auto text-lg">
          Upload any video to detect deepfakes, compression artifacts,
          splicing, and audio-video inconsistencies using AI-powered forensics.
        </p>
      </div>

      {/* UPLOAD BOX */}
      <div className="max-w-3xl mx-auto px-4">
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center bg-white hover:border-[#C5A880] transition">

          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
              <Film className="w-6 h-6 text-gray-500" />
            </div>

            <p className="text-gray-700 font-medium">
              Drop your video here, or click to browse
            </p>

            <p className="text-sm text-gray-500">
              Supports MP4, MOV, AVI
            </p>

            <input
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
              id="videoUpload"
            />

            <label
              htmlFor="videoUpload"
              className="cursor-pointer mt-2 px-6 py-2 bg-[#C5A880] text-white rounded shadow hover:opacity-90"
            >
              Browse Video
            </label>
          </div>
        </div>
      </div>

      {/* FILE PREVIEW */}
      {file && (
        <div className="max-w-3xl mx-auto mt-6 px-4">
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500 mb-2">{file.name}</p>

            <video
              src={URL.createObjectURL(file)}
              controls
              className="w-full max-h-[400px] rounded border"
            />
          </div>
        </div>
      )}

      {/* ERROR */}
      <div className="max-w-3xl mx-auto px-4">
        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
      </div>

      {/* BUTTON */}
      <div className="text-center mt-10">
        <button
          onClick={analyzeVideo}
          disabled={loading}
          className="px-10 py-3 bg-[#C5A880] text-white font-medium rounded shadow-md hover:shadow-lg hover:scale-105 transition-all disabled:bg-gray-400"
        >
          {loading ? "Analyzing..." : "Analyze Video"}
        </button>
      </div>

      {/* LOADING */}
      {loading && <LoadingSpinner message="Analyzing video..." />}

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
              Verdict: <span className="font-medium">{result.verdict}</span>
            </p>
            <p className="text-gray-600">
              Risk Score: <span className="font-medium">{result.risk_score}</span>
            </p>
          </div>

          {/* DEEPFAKE */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#0B132B] mb-2">
              Deepfake Detection
            </h2>

            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-[#C5A880]"
                  style={{
                    width: `${result.deepfake?.average_deepfake_score || 0}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {result.deepfake?.average_deepfake_score}%
              </p>
            </div>
          </div>

          {/* COMPRESSION */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#0B132B] mb-2">
              Compression Analysis
            </h2>
            <p className="text-gray-600">
              {result.compression?.overall_suspicious
                ? "Suspicious compression detected"
                : "No major anomalies detected"}
            </p>
          </div>

          {/* SPLICE */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#0B132B] mb-2">
              Splice Detection
            </h2>
            <p className="text-gray-600">
              {result.splice?.overall_suspicious
                ? "Possible splicing detected"
                : "No splicing evidence found"}
            </p>
          </div>

          {/* SYNC */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#0B132B] mb-2">
              Audio-Video Sync
            </h2>
            <p className="text-gray-600">{result.sync?.status}</p>
          </div>

          {/* METADATA */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#0B132B] mb-2">
              Metadata Analysis
            </h2>

            {result.metadata?.main?.risk_signals?.length === 0 ? (
              <p className="text-gray-600">No suspicious metadata detected</p>
            ) : (
              <ul className="text-gray-600 space-y-1">
                {result.metadata.main.risk_signals.map((signal, i) => (
                  <li key={i}>• {signal}</li>
                ))}
              </ul>
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

export default VideoAnalysis;