import React, { useState } from "react";
import { Download, Film, Zap } from "lucide-react";
import { motion } from "framer-motion";
import ResultCard from "../../components/ResultCard";
import RiskBadge from "../../components/RiskBadge";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";

const VideoAnalysis = ({ file }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    <div className="min-h-screen bg-[#F9F7F4] pt-28 pb-20">

      {/* HEADER */}
      <div className="text-center mb-10 px-4">
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

      <div className="max-w-5xl mx-auto px-4">
        {/* ERROR ALERT */}
        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        {/* VIDEO PREVIEW */}
        {file && (
          <div className="mb-8">
            <ResultCard title="Video Preview" icon={Film} status="info">
              <p className="text-sm text-gray-600 mb-3">Uploaded: {file.name}</p>
              <video
                src={URL.createObjectURL(file)}
                controls
                className="w-full max-h-[400px] object-contain border border-gray-300 rounded-lg"
              />
            </ResultCard>
          </div>
        )}

        {/* ANALYZE BUTTON */}
        {file && (
          <div className="text-center mb-8">
            <button
              onClick={analyzeVideo}
              disabled={loading}
              className={`px-10 py-3 font-medium transition-all shadow-md ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#C5A880] text-white hover:scale-105 hover:shadow-lg"
              }`}
            >
              {loading ? "Analyzing..." : "Run Full Analysis"}
            </button>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && <LoadingSpinner message="Analyzing video..." />}

        {/* RESULTS */}
        {result && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >

            {/* VERDICT */}
            <ResultCard
              title="Analysis Summary"
              icon={Zap}
              status={result.risk_score > 50 ? "danger" : "safe"}
              delay={0}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
              >
                <RiskBadge risk={result.verdict} score={result.risk_score} />
              </motion.div>
            </ResultCard>

            {/* DEEPFAKE */}
            <ResultCard
              title="Deepfake Detection"
              icon={Zap}
              status={
                result.deepfake?.average_deepfake_score > 50 ? "danger" : "safe"
              }
              delay={0.1}
            >
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                <p className="text-sm font-semibold">Score: {result.deepfake?.average_deepfake_score}</p>
                <RiskBadge
                  risk={(result.deepfake?.average_deepfake_score || 0) > 50 ? "danger" : "safe"}
                  score={result.deepfake?.average_deepfake_score}
                />
              </motion.div>
            </ResultCard>

            {/* COMPRESSION */}
            <ResultCard
              title="Compression Analysis"
              icon={Zap}
              status={result.compression?.overall_suspicious ? "warning" : "safe"}
              delay={0.2}
            >
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
                <RiskBadge
                  risk={result.compression?.overall_suspicious ? "warning" : "safe"}
                />
              </motion.div>
            </ResultCard>

            {/* SPLICE DETECTION */}
            <ResultCard
              title="Splice Detection"
              icon={Zap}
              status={result.splice?.overall_suspicious ? "warning" : "safe"}
              delay={0.3}
            >
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
                <RiskBadge
                  risk={result.splice?.overall_suspicious ? "warning" : "safe"}
                />
              </motion.div>
            </ResultCard>

            {/* AUDIO-VIDEO SYNC */}
            <ResultCard
              title="Audio-Video Sync"
              icon={Zap}
              status="info"
              delay={0.4}
            >
              <motion.p
                className="text-sm font-semibold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
              >
                {result.sync?.status}
              </motion.p>
            </ResultCard>

            {/* METADATA */}
            <ResultCard
              title="Metadata Analysis"
              icon={Zap}
              status="info"
              delay={0.5}
            >
              {result.metadata?.main?.risk_signals?.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}>
                  <RiskBadge risk="safe" />
                </motion.div>
              ) : (
                <motion.div
                  className="bg-white/50 border border-yellow-200 rounded p-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                >
                  <p className="text-xs font-semibold text-yellow-800 mb-2">Risk Signals:</p>
                  {result.metadata?.main?.risk_signals?.map((signal, i) => (
                    <motion.li
                      key={i}
                      className="text-sm text-yellow-800 flex items-start gap-2 list-none"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.65 + i * 0.05 }}
                    >
                      <span className="text-yellow-600 mt-0.5">⚠</span> {signal}
                    </motion.li>
                  ))}
                </motion.div>
              )}
            </ResultCard>

            {/* DOWNLOAD */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <motion.a
                href={result.report_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#0B132B] text-white px-8 py-3 hover:scale-105 transition-all shadow-md rounded"
                whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)" }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="w-4 h-4" />
                Download Full Report
              </motion.a>
            </motion.div>

          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VideoAnalysis;
