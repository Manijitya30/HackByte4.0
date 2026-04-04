import React, { useState, useRef, useEffect } from "react";
import { Download, Image as ImageIcon, Zap } from "lucide-react";
import { motion } from "framer-motion";
import ResultCard from "../../components/ResultCard";
import RiskBadge from "../../components/RiskBadge";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";

const ImageAnalysis = ({ file }) => {
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

  const analyzeImage = async () => {
    if (!file) {
      setError("Please upload an image first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setResult(null);
      setError(null);

      const res = await fetch("http://127.0.0.1:8000/analyze/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze image. Please try again.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const getRiskStatus = () => {
    if (!result) return "info";
    const suspicious = result.tampering?.tampered || result.deepfake?.flagged;
    if (suspicious) return "danger";
    return "safe";
  };

  return (
    <div className="min-h-screen bg-[#F9F7F4] pt-12 pb-20">

      {/* HEADER */}
     

      {/* STATE CONTAINER */}
      <div className="max-w-5xl mx-auto px-4">
        {/* ERROR ALERT */}
        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        {/* ANALYZE BUTTON */}
        <div className="text-center mb-8">
          <button
            onClick={analyzeImage}
            disabled={loading}
            className={`px-10 py-3 font-medium transition-all shadow-md ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#C5A880] text-white hover:scale-105 hover:shadow-lg"
            }`}
          >
            {loading ? "Analyzing..." : "Analyze Evidence"}
          </button>
        </div>

        {/* LOADING STATE */}
        {loading && <LoadingSpinner message="Analyzing image..." />}

        {/* RESULTS */}
        {result && (
          <motion.div
            ref={resultRef}
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >

            {/* OVERALL STATUS */}
            <ResultCard
              title="Analysis Summary"
              icon={Zap}
              status={getRiskStatus()}
              delay={0}
            >
              <RiskBadge risk={result.metadata?.status} score={result.metadata?.score} />
            </ResultCard>

            {/* VISUAL ANALYSIS */}
            {result.images && (
              <ResultCard title="Visual Analysis" icon={ImageIcon} status="info" delay={0.1}>
                <div className="grid md:grid-cols-2 gap-4">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                    <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Original</p>
                    <img
                      src={result.images.original}
                      className="w-full border border-gray-300 rounded-lg hover:shadow-lg transition-shadow"
                      alt="Original"
                    />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                    <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Heatmap</p>
                    <img
                      src={result.images.heatmap}
                      className="w-full border border-gray-300 rounded-lg hover:shadow-lg transition-shadow"
                      alt="Heatmap"
                    />
                  </motion.div>
                </div>
              </ResultCard>
            )}

            {/* METADATA ANALYSIS */}
            <ResultCard title="Metadata Verification" icon={ImageIcon} status="info" delay={0.2}>
              <div className="space-y-3">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
                  <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Status</p>
                  <RiskBadge risk={result.metadata?.status} />
                </motion.div>
                {result.metadata?.flags?.length > 0 && (
                  <motion.div
                    className="bg-white/50 border border-yellow-200 rounded p-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <p className="text-xs font-semibold text-yellow-800 mb-2">Detected Issues:</p>
                    {result.metadata.flags.map((flag, i) => (
                      <motion.li
                        key={i}
                        className="text-sm text-yellow-800 flex items-start gap-2 list-none"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.05 }}
                      >
                        <span className="text-yellow-600 mt-0.5">⚠</span> {flag}
                      </motion.li>
                    ))}
                  </motion.div>
                )}
              </div>
            </ResultCard>

            {/* AI DETECTION */}
            <ResultCard
              title="AI Generation Detection"
              icon={Zap}
              status={
                result.ai_detection?.result?.includes("Generated") ? "danger" : "safe"
              }
              delay={0.3}
            >
              <div className="space-y-2">
                <motion.p
                  className="text-sm font-semibold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                >
                  {result.ai_detection?.result}
                </motion.p>
                <RiskBadge
                  risk={result.ai_detection?.result?.includes("Generated") ? "danger" : "safe"}
                />
                <motion.p
                  className="text-xs text-gray-600 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Confidence: <span className="font-semibold">{result.ai_detection?.confidence}</span>
                </motion.p>
              </div>
            </ResultCard>

            {/* DEEPFAKE DETECTION */}
            <ResultCard
              title="Deepfake Detection"
              icon={Zap}
              status={result.deepfake?.flagged ? "danger" : "safe"}
              delay={0.4}
            >
              <div className="space-y-3">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
                  <p className="text-sm font-semibold mb-2">{result.deepfake?.verdict}</p>
                  <RiskBadge risk={result.deepfake?.flagged ? "danger" : "safe"} />
                </motion.div>
                <motion.div
                  className="bg-white/50 rounded p-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <p className="text-xs text-gray-600 mb-1">Deepfake Probability</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${
                        result.deepfake?.deepfake_probability > 50
                          ? "bg-red-500"
                          : "bg-green-500"
                      }`}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${result.deepfake?.deepfake_probability}%`
                      }}
                      transition={{
                        duration: 1.2,
                        ease: "easeOut",
                        delay: 0.6
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {result.deepfake?.deepfake_probability}%
                  </p>
                </motion.div>
              </div>
            </ResultCard>

            {/* TAMPERING DETECTION */}
            <ResultCard
              title="Tampering Detection"
              icon={Zap}
              status={result.tampering?.tampered ? "danger" : "safe"}
              delay={0.5}
            >
              <div className="space-y-3">
                <RiskBadge risk={result.tampering?.tampered ? "danger" : "safe"} />
                <motion.div
                  className="bg-white/50 rounded p-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                >
                  <p className="text-xs text-gray-600 mb-1">Confidence</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${
                        result.tampering?.confidence > 50
                          ? "bg-red-500"
                          : "bg-green-500"
                      }`}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${result.tampering?.confidence}%`
                      }}
                      transition={{
                        duration: 1.2,
                        ease: "easeOut",
                        delay: 0.65
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {result.tampering?.confidence}%
                  </p>
                </motion.div>
              </div>
            </ResultCard>

            {/* DOWNLOAD REPORT */}
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

export default ImageAnalysis;