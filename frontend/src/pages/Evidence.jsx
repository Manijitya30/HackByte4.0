import React, { useState } from "react";
import { Upload, Image, Video, Mic } from "lucide-react";
import Navbar from "../components/Navbar";
import ImageAnalysis from "./Evidence/ImageAnalysis";
import VideoAnalysis from "./Evidence/VideoAnalysis";
import AudioAnalysis from "./Evidence/AudioAnalysis";

const fileTypes = [
  { id: "image", label: "Images", icon: Image },
  { id: "video", label: "Videos", icon: Video },
  { id: "audio", label: "Audio", icon: Mic },
];

const Evidence = () => {
  const [selectedType, setSelectedType] = useState("image");
  const [file, setFile] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  
  return (
    <div className="min-h-screen bg-white">

      {/* NAVBAR */}
      <Navbar 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
      />

      {/* HERO */}
      <section className="relative h-[45vh] sm:h-[50vh] flex items-center justify-center overflow-hidden pt-20">
        <img
          src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f"
          className="absolute w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>

        <div className="relative text-center max-w-2xl px-4">
          <h1
            className="text-3xl sm:text-5xl font-bold text-[#0B132B]"
            style={{ fontFamily: "Playfair Display" }}
          >
            Evidence Authenticity Engine
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#4B5563]">
            Upload evidence and verify whether it has been tampered, edited, or AI-generated.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

        {/* FILE TYPE SELECTOR */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
          {fileTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => {
                  setSelectedType(type.id);
                  setFile(null); // reset file when switching type
                }}
                className={`flex flex-col items-center justify-center p-4 sm:p-6 border transition-all duration-300 ${
                  selectedType === type.id
                    ? "border-[#C5A880] bg-[#C5A880]/10"
                    : "border-gray-200 hover:border-[#C5A880]"
                }`}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 mb-2 text-[#0B132B]" />
                <span className="text-xs sm:text-sm font-medium">
                  {type.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* UPLOAD BOX */}
        <div className="border-2 border-dashed border-gray-300 p-8 sm:p-12 text-center rounded-lg hover:border-[#C5A880] hover:bg-[#C5A880]/5 transition-all">
          <div className="flex justify-center mb-4">
            <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-[#C5A880]" />
          </div>

          <p className="mt-4 text-sm sm:text-base text-[#4B5563] font-medium">
            Drag & drop your {selectedType} file here, or click to upload
          </p>

          <p className="text-xs text-gray-500 mt-2">
            Supported formats: Images (PNG, JPG), Videos (MP4, MOV), Audio (MP3, WAV)
          </p>

          <input
            type="file"
            className="hidden"
            id="fileUpload"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <label
            htmlFor="fileUpload"
            className="inline-block mt-6 px-6 sm:px-8 py-2 sm:py-3 bg-[#C5A880] text-white cursor-pointer hover:scale-105 transition-all rounded font-medium"
          >
            Choose File
          </label>

          {file && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-700 break-all">
                ✅ Selected: {file.name}
              </p>
            </div>
          )}
        </div>

        {/* 🔥 DYNAMIC ANALYSIS SECTION */}

        {selectedType === "image" && <ImageAnalysis file={file} />}

        {selectedType === "video" && file && (
  <VideoAnalysis file={file} />
)}

        {selectedType === "audio" && file && (
  <AudioAnalysis file={file} />
)}

        {selectedType === "doc" && (
          <div className="mt-10 text-center text-gray-500">
            Document verification coming soon...
          </div>
        )}

      </section>
    </div>
  );
};

export default Evidence;