import React, { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Send, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

const Chatbot = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("citizen");

  const [chat, setChat] = useState([
    { type: "bot", text: "⚖️ Welcome. Ask me anything about law." },
  ]);

  const [typingInterval, setTypingInterval] = useState(null);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // 🔥 ChatGPT-style typing
  const typeMessage = (fullText) => {
    const words = fullText.split(" ");
    let index = 0;

    const interval = setInterval(() => {
      setChat((prev) => {
        const updated = [...prev];
        const currentText = updated[updated.length - 1].text;

        updated[updated.length - 1].text =
          currentText + (index === 0 ? "" : " ") + words[index];

        return updated;
      });

      index++;

      if (index >= words.length) {
        clearInterval(interval);
        setTypingInterval(null);
        setLoading(false);
      }
    }, 35);

    setTypingInterval(interval);
  };

  // 🛑 STOP FUNCTION
  const stopGeneration = () => {
    if (typingInterval) {
      clearInterval(typingInterval);
      setTypingInterval(null);
      setLoading(false);
    }
  };

  // 🚀 SEND MESSAGE
  const sendMessage = async (customMsg) => {
    const msg = customMsg || message;
    if (!msg.trim()) return;

    setChat((prev) => [...prev, { type: "user", text: msg }]);
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/chatbot/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, role }),
      });

      const data = await res.json();

      setChat((prev) => [...prev, { type: "bot", text: "" }]);

      typeMessage(data.response);

    } catch (err) {
      setChat((prev) => [
        ...prev,
        { type: "bot", text: "⚠️ Server error. Please try again." },
      ]);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">

      <Navbar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* ✅ LIGHT BACKGROUND (image preserved) */}
      <div className="absolute inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#f8f4ee]/80 backdrop-brightness-110"></div>
      </div>

      {/* HEADER */}
      <section className="pt-28 pb-6 text-center text-gray-900">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-wide">
          Legal AI Assistant
        </h1>
        <p className="mt-2 text-gray-700">
          Intelligent legal reasoning powered by AI
        </p>
      </section>

      {/* ROLE SELECTOR */}
      <div className="flex justify-center mb-6 gap-3">
        {["citizen", "lawyer", "judge"].map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              role === r
                ? "bg-[#C5A880] text-black shadow-lg"
                : "bg-white/60 text-gray-800 backdrop-blur-md hover:bg-white/80"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* CHAT BOX */}
      <div className="max-w-4xl mx-auto px-4 pb-10">
        <div className="backdrop-blur-xl bg-white/60 border border-white/40 shadow-2xl h-[70vh] flex flex-col rounded-2xl overflow-hidden">

          {/* CHAT AREA */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">

            {chat.length === 1 && (
              <div className="text-center mt-16 text-gray-600">
                <Sparkles className="mx-auto mb-3 w-10 h-10 text-[#C5A880]" />
                <p className="text-lg">Start a legal conversation</p>
              </div>
            )}

            {chat.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
                    msg.type === "user"
                      ? "bg-[#C5A880] text-black rounded-br-none"
                      : "bg-white text-gray-900 rounded-bl-none shadow"
                  }`}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {msg.text}
                  </ReactMarkdown>

                  {/* Cursor */}
                  {loading && index === chat.length - 1 && (
                    <span className="ml-1 animate-pulse text-gray-500">▍</span>
                  )}
                </div>
              </div>
            ))}

            {/* Thinking */}
            {loading && chat[chat.length - 1]?.type !== "bot" && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-2xl text-gray-600 text-sm shadow">
                  Thinking...
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* INPUT */}
          <div className="border-t border-white/30 p-4 flex gap-3 bg-white/50 backdrop-blur-md">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask a legal question..."
              className="flex-1 px-4 py-3 rounded-xl outline-none bg-white text-black border border-gray-300"
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
                if (e.key === "Escape") stopGeneration();
              }}
            />

            {/* 🔥 Dynamic Button */}
            {loading ? (
              <button
                onClick={stopGeneration}
                className="bg-red-500 text-white px-5 rounded-xl hover:scale-105 transition"
              >
                Stop
              </button>
            ) : (
              <button
                onClick={() => sendMessage()}
                className="bg-[#C5A880] text-black px-5 rounded-xl flex items-center justify-center hover:scale-105 transition"
              >
                <Send className="w-5 h-5" />
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Chatbot;