import React, { useState, useRef, useEffect } from "react";

const ImageAnalysis = ({ file }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const resultRef = useRef(null);

  // ✅ scroll fix
  useEffect(() => {
    if (result && resultRef.current) {
      const yOffset = -80;
      const y =
        resultRef.current.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;

      window.scrollTo({
        top: y,
        behavior: "smooth",
      });
    }
  }, [result]);

  const analyzeImage = async () => {
    if (!file) return alert("Please upload an image first");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setResult(null);

      const res = await fetch("http://127.0.0.1:8000/analyze-image/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Error analyzing image");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === "HIGHLY_SUSPICIOUS") return "text-red-600";
    if (status === "SUSPICIOUS") return "text-yellow-600";
    return "text-green-600";
  };

  // 🔥 REAL NORMALIZATION (CORRECT WAY)
  const normalizedScore = result
    ? Math.round(
        (result.confidence_score / result.max_possible_score) * 10
      )
    : 0;

  return (
    <div className="mt-10">

      {/* BUTTON */}
      <div className="text-center">
        <button
          onClick={analyzeImage}
          className="bg-[#0B132B] text-white px-8 py-3 hover:scale-105 transition-all"
        >
          {loading ? "Analyzing..." : "Analyze Image"}
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-center mt-6 text-gray-500">
          Processing metadata and applying forensic rules...
        </div>
      )}

      {/* RESULT */}
      {result && (
        <div
          ref={resultRef}
          className="mt-16 p-6 border bg-white shadow-md space-y-6"
        >

          {/* STATUS */}
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">
              Analysis Result
            </h2>

            <p className={`text-lg font-bold ${getStatusColor(result.status)}`}>
              {result.status}
            </p>

            <p className="text-sm text-gray-500">
              {result.summary}
            </p>
          </div>

          {/* SCORE */}
          <div>
            <p className="font-medium mb-2">Risk Score</p>

            <div className="w-full bg-gray-200 h-3">
              <div
                className={`h-3 ${
                  result.status === "HIGHLY_SUSPICIOUS"
                    ? "bg-red-500"
                    : result.status === "SUSPICIOUS"
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{
                  width: `${normalizedScore * 10}%`,
                }}
              ></div>
            </div>

            <p className="text-sm mt-1">
              {normalizedScore} / 10
            </p>
          </div>

          {/* FLAGS */}
          <div>
            <p className="font-medium mb-3">Detected Issues</p>

            {result.tampering_flags.length === 0 ? (
              <p className="text-green-600 text-sm">
                No suspicious metadata detected
              </p>
            ) : (
              <div className="grid gap-3">
                {result.tampering_flags.map((flag, i) => (
                  <div
                    key={i}
                    className="p-3 border bg-gray-50 text-sm"
                  >
                    ⚠ {flag}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default ImageAnalysis;