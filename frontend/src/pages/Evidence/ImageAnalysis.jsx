import React, { useState, useRef, useEffect } from "react";
import { Download, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";

const ImageAnalysis = () => {
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F4] pt-16 pb-24">

      {/* HERO SECTION */}
      <div className="text-center mb-12 px-4">
        <h1 className="text-5xl font-bold text-[#0B132B] leading-tight">
          Detect Image Tampering with <br />
          <span className="text-[#C5A880]">Advanced Forensics</span>
        </h1>

        <p className="mt-6 text-gray-600 max-w-2xl mx-auto text-lg">
          Upload any image to analyze its authenticity using advanced digital
          forensic techniques. We examine metadata, compression artifacts, and AI patterns.
        </p>
      </div>

      {/* UPLOAD BOX */}
      <div className="max-w-3xl mx-auto px-4">
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center bg-white hover:border-[#C5A880] transition">

          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-gray-500" />
            </div>

            <p className="text-gray-700 font-medium">
              Drop your image here, or click to browse
            </p>

            <p className="text-sm text-gray-500">
              Supports JPG, PNG, GIF
            </p>

            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
              id="fileUpload"
            />

            <label
              htmlFor="fileUpload"
              className="cursor-pointer mt-2 px-6 py-2 bg-[#C5A880] text-white rounded shadow hover:opacity-90"
            >
              Browse File
            </label>
          </div>
        </div>
      </div>

      {/* FILE PREVIEW */}
      {file && (
        <div className="max-w-3xl mx-auto mt-6 px-4">
          <div className="bg-white border rounded-lg p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <img
                src={URL.createObjectURL(file)}
                className="w-16 h-16 object-cover rounded"
                alt="preview"
              />
              <div>
                <p className="font-medium text-[#0B132B]">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>

            <button
              onClick={() => setFile(null)}
              className="text-gray-400 hover:text-red-500 text-xl"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* ERROR */}
      <div className="max-w-3xl mx-auto px-4">
        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
      </div>

      {/* ANALYZE BUTTON */}
      <div className="text-center mt-10">
        <button
          onClick={analyzeImage}
          disabled={loading}
          className="px-10 py-3 bg-[#C5A880] text-white font-medium rounded shadow-md hover:shadow-lg hover:scale-105 transition-all disabled:bg-gray-400"
        >
          {loading ? "Analyzing..." : "Analyze Image"}
        </button>
      </div>

      {/* LOADING */}
      {loading && <LoadingSpinner message="Analyzing image..." />}

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
              Status: <span className="font-medium">{result.metadata?.status}</span>
            </p>
            <p className="text-gray-600">
              Score: <span className="font-medium">{result.metadata?.score}</span>
            </p>
          </div>

          {/* IMAGES */}
          {result.images && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#0B132B] mb-4">
                Visual Analysis
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Original</p>
                  <img src={result.images.original} className="rounded border" />
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-2">Heatmap</p>
                  <img src={result.images.heatmap} className="rounded border" />
                </div>
              </div>
            </div>
          )}

          {/* AI DETECTION */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#0B132B] mb-2">
              AI Detection
            </h2>
            <p className="text-gray-700">{result.ai_detection?.result}</p>
            <p className="text-sm text-gray-500 mt-2">
              Confidence: {result.ai_detection?.confidence}
            </p>
          </div>

          {/* DEEPFAKE */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#0B132B] mb-2">
              Deepfake Detection
            </h2>
            <p className="text-gray-700">{result.deepfake?.verdict}</p>

            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-[#C5A880]"
                  style={{ width: `${result.deepfake?.deepfake_probability}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {result.deepfake?.deepfake_probability}%
              </p>
            </div>
          </div>

          {/* TAMPERING */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#0B132B] mb-2">
              Tampering Detection
            </h2>

            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-[#C5A880]"
                  style={{ width: `${result.tampering?.confidence}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {result.tampering?.confidence}%
              </p>
            </div>
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

export default ImageAnalysis;