import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

const DebatePage = () => {
  const navigate = useNavigate();

  const [prosecutionEvidence, setProsecutionEvidence] = useState([""]);
  const [defenseEvidence, setDefenseEvidence] = useState([""]);
  const [caseInput, setCaseInput] = useState("");
  const [rounds, setRounds] = useState(3);

  // 🔥 NEW: loading state
  const [loading, setLoading] = useState(false);

  const autoResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  const addEvidence = (type) => {
    if (type === "prosecution") {
      setProsecutionEvidence([...prosecutionEvidence, ""]);
    } else {
      setDefenseEvidence([...defenseEvidence, ""]);
    }
  };

  const updateEvidence = (type, index, value) => {
    if (type === "prosecution") {
      const updated = [...prosecutionEvidence];
      updated[index] = value;
      setProsecutionEvidence(updated);
    } else {
      const updated = [...defenseEvidence];
      updated[index] = value;
      setDefenseEvidence(updated);
    }
  };

  // 🚀 MAIN SUBMIT
  const startSimulation = async () => {
    setLoading(true); // 🔥 START LOADING

    const payload = {
      case: caseInput,
      evidence: {
        prosecution: prosecutionEvidence.filter(e => e.trim() !== ""),
        defense: defenseEvidence.filter(e => e.trim() !== ""),
      },
      rounds: rounds,
    };

    try {
      const res = await fetch("http://localhost:8000/debate/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      navigate("/simulator", {
        state: {
          script: data.script,
          long: data.long_arguments,
          report: JSON.stringify(data.final_judgment, null, 2),
        },
      });

    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setLoading(false); // 🔥 STOP LOADING
    }
  };

  return (
    <div className="min-h-screen relative">
      <Navbar />

      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f"
          alt="background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/70 to-white/40"></div>
      </div>

      {/* HEADER */}
      <section className="pt-28 pb-8 text-center">
        <h1 className="text-4xl font-bold text-[#0B132B]">
          Debate Builder
        </h1>
      </section>

      {/* GRID */}
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-6">

        {/* PROSECUTION */}
        <div className="backdrop-blur-xl bg-white/60 border p-5">
          <h2 className="text-xl text-[#C5A880] mb-4">Prosecution</h2>

          {prosecutionEvidence.map((item, i) => (
            <textarea
              key={i}
              rows={2}
              value={item}
              onChange={(e) => {
                updateEvidence("prosecution", i, e.target.value);
                autoResize(e);
              }}
              className="w-full mb-3 p-3 border bg-white/80 resize-none"
              placeholder="Enter prosecution evidence..."
            />
          ))}

          <button
            onClick={() => addEvidence("prosecution")}
            className="text-sm text-[#C5A880]"
          >
            + Add Evidence
          </button>
        </div>

        {/* DEFENSE */}
        <div className="backdrop-blur-xl bg-white/60 border p-5">
          <h2 className="text-xl text-blue-500 mb-4">Defense</h2>

          {defenseEvidence.map((item, i) => (
            <textarea
              key={i}
              rows={2}
              value={item}
              onChange={(e) => {
                updateEvidence("defense", i, e.target.value);
                autoResize(e);
              }}
              className="w-full mb-3 p-3 border bg-white/80 resize-none"
              placeholder="Enter defense evidence..."
            />
          ))}

          <button
            onClick={() => addEvidence("defense")}
            className="text-sm text-blue-500"
          >
            + Add Evidence
          </button>
        </div>
      </div>

      {/* CASE INPUT */}
      <div className="max-w-6xl mx-auto mt-8 px-4">
        <textarea
          value={caseInput}
          onChange={(e) => setCaseInput(e.target.value)}
          rows={4}
          className="w-full p-4 border bg-white/90"
          placeholder="Describe the case..."
        />
      </div>

      {/* ROUNDS INPUT */}
      <div className="max-w-6xl mx-auto mt-4 px-4">
        <label className="block mb-2 text-gray-700 font-medium">
          Number of Debate Rounds
        </label>

        <input
          type="number"
          min={1}
          max={10}
          value={rounds}
          onChange={(e) => setRounds(Number(e.target.value))}
          className="w-full p-3 border bg-white/90"
        />
      </div>

      {/* START BUTTON */}
      <div className="text-center mt-6 pb-10">
        <button
          onClick={startSimulation}
          disabled={loading}
          className={`px-6 py-3 text-white ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#C5A880] hover:bg-[#b89a70]"
          }`}
        >
          {loading ? "Generating Debate..." : "Start Simulation"}
        </button>
      </div>

      {/* 🔥 LOADING OVERLAY */}
      {loading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl flex flex-col items-center">
            
            {/* Spinner */}
            <div className="w-12 h-12 border-4 border-[#C5A880] border-t-transparent rounded-full animate-spin mb-4"></div>
            
            <p className="text-lg font-semibold text-gray-700">
              Building courtroom debate...
            </p>

            <p className="text-sm text-gray-500 mt-1">
              AI is analyzing laws, evidence & cases ⚖️
            </p>

          </div>
        </div>
      )}
    </div>
  );
};

export default DebatePage;