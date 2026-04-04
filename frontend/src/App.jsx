import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Evidence from "./pages/Evidence";
import Chatbot from "./pages/Chatbot";
import Simulator from "./pages/Simulator";
import Auth from "./pages/Auth";
import Debate from "./pages/Debate"
import ScrollToTop from "./ScrollToTop";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
       <ScrollToTop />
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/evidence" element={<Evidence />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/debate" element={<Debate />} />

          
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;