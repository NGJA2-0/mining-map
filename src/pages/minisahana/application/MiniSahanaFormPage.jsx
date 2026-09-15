import { useState } from "react";
import MiniSahanaForm from "../MiniSahanaForm";
import MiniSahanaFormTwo from "./MiniSahanaFormTwo";
import MiniSahanaFormHeader from "./MiniSahanaFormHeader";

const TABS = [
  { id: "form1", label: "Form 1" },
  { id: "form2", label: "Form 2" },
];

const MiniSahanaFormPage = () => {
  const [activeForm, setActiveForm] = useState("form1");

  return (
    <div className="min-h-screen bg-page">
      <MiniSahanaFormHeader />

      {/* Tab bar */}
      <div className="border-b border-line">
        <div className="flex gap-1 px-4 sm:px-10 lg:px-16 overflow-x-auto">
          {TABS.map((tab) => {
            const isActive = activeForm === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveForm(tab.id)}
                className={`relative shrink-0 px-5 py-3.5 text-sm font-medium transition-colors focus:outline-none ${
                  isActive ? "text-copper" : "text-ink-muted hover:text-ink"
                }`}
              >
                {tab.label}
                <span
                  className={`absolute inset-x-3 -bottom-px h-0.5 rounded-full transition-opacity ${
                    isActive ? "bg-copper opacity-100" : "opacity-0"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Form content */}
      <div className="font-sinhala overflow-x-auto">
        {activeForm === "form1" && <MiniSahanaForm />}
        {activeForm === "form2" && <MiniSahanaFormTwo />}
      </div>
    </div>
  );
};

export default MiniSahanaFormPage;