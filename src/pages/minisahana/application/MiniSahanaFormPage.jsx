import { useState } from "react";
import MiniSahanaForm from "../MiniSahanaForm";
import MiniSahanaFormHeader from "./MiniSahanaFormHeader";

const MiniSahanaFormPage = () => {

  return (
    <div className="min-h-screen bg-page">
      <MiniSahanaFormHeader />

      {/* Form content */}
      <div className="font-sinhala overflow-x-auto">
        {<MiniSahanaForm />}
      </div>
    </div>
  );
};

export default MiniSahanaFormPage;