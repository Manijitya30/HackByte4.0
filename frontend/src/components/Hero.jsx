import React from "react";
import "./Hero.css";

const Hero = () => {
  return (
    <section className="hero">
      <div className="overlay">
        <p className="tag">AI-POWERED JUSTICE TECHNOLOGY</p>

        <h1>
          Building India's End-to-End <br />
          Justice Tech Stack
        </h1>

        <p className="desc">
          TensorCourt revolutionizes courtroom operations with cutting-edge AI
          solutions to eliminate delays, streamline workflows, and ensure timely
          justice for all.
        </p>

        <div className="buttons">
          <button className="btn-primary">Get Started</button>
          <button className="btn-secondary">Learn More</button>
        </div>
      </div>
    </section>
  );
};

export default Hero;