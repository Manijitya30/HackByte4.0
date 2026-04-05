import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Lottie from "lottie-react";
import animationData from "../assets/legal-ai.json";


const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen relative flex items-center justify-center">

      {/* NAVBAR */}
      <Navbar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/20"></div>
      </div>
      <Lottie
  animationData={animationData}
  loop={true}
  className="w-72 opacity-80"
      />


      {/* AUTH BOX */}
      <div className="w-full max-w-md mx-4 backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl p-8">

        {/* TOGGLE */}
        <div className="flex mb-8 relative bg-white/10 p-1 rounded-full">

          <div
            className={`absolute top-1 bottom-1 w-1/2 bg-[#C5A880] rounded-full transition-all duration-300 ${
              isLogin ? "left-1" : "left-1/2"
            }`}
          ></div>

          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 z-10 text-sm font-medium ${
              isLogin ? "text-white" : "text-gray-300"
            }`}
          >
            Login
          </button>

          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 z-10 text-sm font-medium ${
              !isLogin ? "text-white" : "text-gray-300"
            }`}
          >
            Register
          </button>
        </div>

        {/* TITLE */}
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>

        {/* FORM */}
        <div className="space-y-4">

          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:border-[#C5A880]"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:border-[#C5A880]"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:border-[#C5A880]"
          />

          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:border-[#C5A880]"
            />
          )}

          {/* BUTTON */}
          <button className="w-full bg-[#C5A880] text-white py-3 mt-4 hover:scale-105 transition-all">
            {isLogin ? "Login" : "Register"}
          </button>
        </div>

        {/* SWITCH TEXT */}
        <p className="text-sm text-gray-300 text-center mt-6">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-[#C5A880] cursor-pointer hover:underline"
          >
            {isLogin ? "Create one" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Auth;