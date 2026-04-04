import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { Send, Sparkles } from "lucide-react";

const quickActions = [
  "Summarize this case",
  "Find similar cases",
  "Explain legal terms",
  "Generate argument points",
];

const Chatbot = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [message, setMessage] = useState("");

  
  const [chat, setChat] = useState([
    {
      type: "bot",
    },
  ]);

  const sendMessage = (customMsg) => {
    const msg = customMsg || message;
    if (!msg.trim()) return;

    setChat((prev) => [...prev, { type: "user", text: msg }]);

    // fake AI response
    setTimeout(() => {
      setChat((prev) => [
        ...prev,
        {
          type: "bot",
          text: "Analyzing legal context... (demo AI response)",
        },
      ]);
    }, 800);

    setMessage("");
  };

  return (
    <div className="min-h-screen relative">

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
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/70 to-white/40"></div>
      </div>

      {/* HEADER */}
      <section className="pt-28 pb-6 text-center">
        <h1
          className="text-3xl sm:text-5xl font-bold text-[#0B132B]"
          style={{ fontFamily: "Playfair Display" }}
        >
          Legal AI Assistant
        </h1>
        <p className="mt-2 text-[#4B5563]">
          Intelligent legal reasoning. Instant insights.
        </p>
      </section>

      {/* QUICK ACTIONS */}
      <div className="max-w-4xl mx-auto px-4 mb-6 flex flex-wrap gap-3 justify-center">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => sendMessage(action)}
            className="px-5 py-2 rounded-full text-sm 
            bg-white/70 backdrop-blur-md border border-gray-200
            hover:bg-[#C5A880]/10 hover:border-[#C5A880]
            transition-all duration-300 hover:scale-105"
          >
            {action}
          </button>
        ))}
      </div>

      {/* CHAT CONTAINER */}
      <div className="max-w-4xl mx-auto px-4 pb-10">
        <div className="backdrop-blur-xl bg-white/60 border border-white/40 shadow-xl h-[70vh] flex flex-col">

          {/* CHAT AREA */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">

            {/* Empty state */}
            {chat.length === 1 && (
              <div className="text-center mt-16 text-gray-500 animate-fadeIn">
                <Sparkles className="mx-auto mb-3 w-10 h-10 text-[#C5A880]" />
                <p className="text-lg font-medium">
                  Ask anything about law, cases, or legal procedures
                </p>
                <p className="text-sm mt-2 text-gray-400">
                  Try one of the suggested prompts above
                </p>
              </div>
            )}

            {/* Chat messages */}
            {chat.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[75%] px-4 py-3 animate-fadeIn 
                    
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

        <div className="sticky bottom-0 border-t p-4 flex gap-3 bg-white/80 backdrop-blur-md">
  <input
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    placeholder="Ask a legal question..."
    className="flex-1 px-4 py-3 border outline-none bg-white/90 placeholder:animate-pulse"
    onKeyDown={(e) => {
      if (e.key === "Enter") sendMessage();
    }}
  />
  <button
    onClick={() => sendMessage()}
    className="bg-[#C5A880] text-white px-5 flex items-center justify-center 
    hover:scale-105 hover:shadow-lg transition-all"
  >
    <Send className="w-5 h-5" />
  </button>
</div>

        </div>
      </div>
    </div>
  );
};

export default Chatbot;