import React from "react";
import "./Features.css";

const Features = () => {
  return (
    <section className="features">
      <h2>Transforming Judicial Systems with AI and Technology</h2>

      <div className="grid">
        <div className="card large">
          <h3>Evidence Tamper Detection</h3>
          <p>Cryptographic verification of submitted evidence.</p>
        </div>

        <div className="side">
          <div className="card">
            <h3>Role-Based Hearings</h3>
          </div>

          <div className="card">
            <h3>Stenography Easing</h3>
          </div>
        </div>
      </div>
      <div className="grid second">
  <div className="card light">
    <h3>Legal Co-Pilot Chatbot</h3>
    <p>Instant legal assistance and case retrieval.</p>
  </div>

  <div className="card dark">
    <h3>Multi-Agent Debate Simulator</h3>
    <p>Simulate courtroom arguments with AI.</p>
  </div>
</div>
    </section>
  );
};

export default Features;