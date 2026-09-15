import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MiniSahanaForm from "../MiniSahanaForm";

const MiniSahanaFormPage = () => {
  const navigate = useNavigate();
  const [activeForm, setActiveForm] = useState("form1");

  return (
    <div className="min-h-screen bg-white font-sinhala flex flex-col lg:flex-row">
      {/* Sidebar (top bar on mobile, left column on desktop) */}
      <div className="w-full lg:w-56 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-gray-200 p-4 lg:p-6">
        <button
          type="button"
          onClick={() => navigate("/minisahana/applications")}
          className="mb-4 flex items-center gap-1 text-sm text-gray-600 hover:text-black focus:outline-none"
        >
          ← ආපසු
        </button>

        <div className="flex lg:flex-col gap-2">
          <button
            type="button"
            onClick={() => setActiveForm("form1")}
            className={`flex-1 lg:flex-none px-4 py-2 rounded-md text-sm font-medium border transition-colors focus:outline-none ${
              activeForm === "form1"
                ? "bg-black text-white border-black"
                : "bg-white text-gray-700 border-gray-300 hover:border-black"
            }`}
          >
            Form 1
          </button>
          <button
            type="button"
            onClick={() => setActiveForm("form2")}
            className={`flex-1 lg:flex-none px-4 py-2 rounded-md text-sm font-medium border transition-colors focus:outline-none ${
              activeForm === "form2"
                ? "bg-black text-white border-black"
                : "bg-white text-gray-700 border-gray-300 hover:border-black"
            }`}
          >
            Form 2
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-x-auto">
        {activeForm === "form1" && <MiniSahanaForm />}
        {activeForm === "form2" && (
          <div className="p-8 text-gray-500 text-sm">
            Form 2 — coming soon
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniSahanaFormPage;