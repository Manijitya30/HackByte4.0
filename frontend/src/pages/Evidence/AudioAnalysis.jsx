import React, { useState } from "react";
import { Download, Mic, Zap } from "lucide-react";
import { motion } from "framer-motion";
import ResultCard from "../../components/ResultCard";
import RiskBadge from "../../components/RiskBadge";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";

const AudioAnalysis = ({ file }) => {
  const [reference, setReference] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    <div className="min-h-screen bg-[#F9F7F4] pt-28 pb-20">

      {/* HEADER */}
      <div className="text-center mb-10 px-4">
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

      <div className="max-w-5xl mx-auto px-4">
        {/* ERROR ALERT */}
        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        {/* PRIMARY AUDIO */}
        {file && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ResultCard title="Primary Audio" icon={Mic} status="info">
              <p className="text-sm text-gray-600 mb-3">File: {file.name}</p>
              <audio controls className="w-full">
                <source src={URL.createObjectURL(file)} />
              </audio>
            </ResultCard>
          </motion.div>
        )}

        {/* REFERENCE AUDIO */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <ResultCard title="Reference Audio (Optional)" icon={Mic} status="info">
            <div className="space-y-3">
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setReference(e.target.files[0])}
                className="block w-full text-sm text-gray-600
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-[#C5A880] file:text-white
                  hover:file:scale-105 cursor-pointer"
              />

              {reference && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring" }}
                >
                  <p className="font-medium text-sm">{reference.name}</p>
                  <audio controls className="w-full mt-2">
                    <source src={URL.createObjectURL(reference)} />
                  </audio>
                </motion.div>
              )}
            </div>
          </ResultCard>
        </motion.div>

        {/* BUTTON */}
        {file && (
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.button
              onClick={analyzeAudio}
              disabled={loading}
              className={`px-10 py-3 font-medium transition-all shadow-md ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#C5A880] text-white hover:scale-105 hover:shadow-lg"
              }`}
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? "Analyzing..." : "Analyze Audio"}
            </motion.button>
          </motion.div>
        )}

        {/* LOADING STATE */}
        {loading && <LoadingSpinner message="Analyzing audio..." />}

        {/* RESULTS */}
        {result && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >

            {/* FINAL VERDICT */}
            <ResultCard
              title="Analysis Summary"
              icon={Zap}
              status={(result.final?.final?.risk_score || 0) > 50 ? "danger" : "safe"}
              delay={0}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
              >
                <RiskBadge
                  risk={result.final?.final?.verdict}
                  score={result.final?.final?.risk_score}
                />
              </motion.div>
            </ResultCard>

            {/* AI DETECTION */}
            <ResultCard
              title="AI Voice Detection"
              icon={Zap}
              status={
                result.ai_detection?.verdict?.includes("AI") ? "danger" : "safe"
              }
              delay={0.1}
            >
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                <p className="text-sm font-semibold">{result.ai_detection?.verdict}</p>
                <RiskBadge
                  risk={result.ai_detection?.verdict?.includes("AI") ? "danger" : "safe"}
                />
                <motion.div
                  className="bg-white/50 rounded p-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <p className="text-xs text-gray-600 mb-1">AI Probability</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${
                        (result.ai_detection?.ai_probability || 0) > 50
                          ? "bg-red-500"
                          : "bg-green-500"
                      }`}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${result.ai_detection?.ai_probability || 0}%`
                      }}
                      transition={{
                        duration: 1.2,
                        ease: "easeOut",
                        delay: 0.35
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {result.ai_detection?.ai_probability}%
                  </p>
                </motion.div>
              </motion.div>
            </ResultCard>

            {/* TAMPERING */}
            <ResultCard
              title="Tampering Detection"
              icon={Zap}
              status={result.tampering?.verdict?.includes("Tampered") ? "danger" : "safe"}
              delay={0.2}
            >
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
              >
                <p className="text-sm font-semibold">{result.tampering?.verdict}</p>
                <RiskBadge
                  risk={result.tampering?.verdict?.includes("Tampered") ? "danger" : "safe"}
                />
                <motion.div
                  className="bg-white/50 rounded p-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <p className="text-xs text-gray-600 mb-1">Tampering Score</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${
                        (result.tampering?.tamper_score || 0) > 50
                          ? "bg-red-500"
                          : "bg-green-500"
                      }`}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${result.tampering?.tamper_score || 0}%`
                      }}
                      transition={{
                        duration: 1.2,
                        ease: "easeOut",
                        delay: 0.45
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {result.tampering?.tamper_score}%
                  </p>
                </motion.div>
              </motion.div>
            </ResultCard>

            {/* SPEAKER VERIFICATION */}
            <ResultCard
              title="Speaker Verification"
              icon={Zap}
              status={
                result.speaker?.verdict?.includes("Match") ? "safe" : "warning"
              }
              delay={0.3}
            >
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
                <p className="text-sm font-semibold">{result.speaker?.verdict}</p>
                <RiskBadge
                  risk={result.speaker?.verdict?.includes("Match") ? "safe" : "warning"}
                />
                <motion.div
                  className="bg-white/50 rounded p-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                >
                  <p className="text-xs text-gray-600 mb-1">Speaker Similarity</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="h-2 rounded-full bg-blue-500"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${result.speaker?.similarity || 0}%`
                      }}
                      transition={{
                        duration: 1.2,
                        ease: "easeOut",
                        delay: 0.55
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {result.speaker?.similarity}%
                  </p>
                </motion.div>
              </motion.div>
            </ResultCard>

            {/* METADATA */}
            <ResultCard
              title="Metadata Analysis"
              icon={Zap}
              status="info"
              delay={0.4}
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
              transition={{ delay: 0.75 }}
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

export default AudioAnalysis;
