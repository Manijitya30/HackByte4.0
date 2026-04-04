import React from "react";
import { Scale, Menu } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50 bg-white/80 border-b border-gray-200/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <Scale className="w-8 h-8 text-[#C5A880]" />
            <h1
              className="text-2xl font-bold text-[#0B132B] tracking-tight"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              TensorCourt
            </h1>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">

            {/* Features */}
            <a
              href="#features"
              className="relative group text-[#4B5563] hover:text-[#0B132B] font-medium transition-colors duration-300"
            >
              Features
              <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-[#C5A880] transition-all duration-300 group-hover:w-full"></span>
            </a>

            {/* Contact */}
            <a
              href="#contact"
              className="relative group text-[#4B5563] hover:text-[#0B132B] font-medium transition-colors duration-300"
            >
              Contact
              <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-[#C5A880] transition-all duration-300 group-hover:w-full"></span>
            </a>

            {/* About */}
            <a
              href="#about"
              className="relative group text-[#4B5563] hover:text-[#0B132B] font-medium transition-colors duration-300"
            >
              About
              <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-[#C5A880] transition-all duration-300 group-hover:w-full"></span>
            </a>

            {/* Button */}
            <button className="bg-[#C5A880] text-white px-8 py-3 rounded-none font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg">
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[#0B132B]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-6 py-4 space-y-3">
            <a href="#features" className="block text-[#4B5563] font-medium">
              Features
            </a>
            <a href="#contact" className="block text-[#4B5563] font-medium">
              Contact
            </a>
            <a href="#about" className="block text-[#4B5563] font-medium">
              About
            </a>
            <button className="w-full bg-[#C5A880] text-white px-8 py-3 font-medium">
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;