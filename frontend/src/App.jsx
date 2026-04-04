import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Evidence from "./pages/Evidence";
import Chatbot from "./pages/Chatbot";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/evidence" element={<Evidence />} />
          <Route path="/chatbot" element={<Chatbot />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;