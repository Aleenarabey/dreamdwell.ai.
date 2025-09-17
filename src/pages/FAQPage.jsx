import React from "react";
import { useNavigate } from "react-router-dom";

export default function FAQPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-white text-black min-h-screen font-sans">
  {/* Header */}
  <header className="relative flex items-center bg-slate-600 text-white px-8 py-4">
    <div className="flex items-center gap-3">
      <img src="/dreamdwell logo.png" alt="DreamDwell" className="h-14" />
    </div>
    <span className="absolute top-4 right-8 text-lg font-semibold">Help Center</span>
  </header>

      <div className="max-w-4xl mx-auto my-10 px-5">
        {/* Back button */}
        <button 
          className="border-none bg-transparent text-gray-800 text-sm cursor-pointer mb-5"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>

        {/* Question */}
        <h1 className="text-3xl font-bold mb-5">What is DreamDwell?</h1>

        {/* Image */}
        <div className="mb-5">
          <img
            src="/reason 1 (2).png"
            alt="DreamDwell Example"
            className="w-full rounded-lg shadow-md"
          />
        </div>

        {/* Answer */}
        <p className="text-lg leading-relaxed mb-4">
          DreamDwell is an AI-powered home design platform that helps
          <b> Architects, Interior Designers, and Homeowners </b> plan, design,
          and visualize their dream homes. With DreamDwell, you can generate
          optimized floor plans, create stunning 3D interiors, and simulate
          natural light & airflow instantly.
        </p>

        <p className="text-lg leading-relaxed mb-4">
          Whether you're a professional architect or a homeowner with a dream,
          DreamDwell makes the process interactive, fast, and fun!
        </p>
      </div>
    </div>
  );
}