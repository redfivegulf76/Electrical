import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function MobileHeader({ title, onBack, backUrl }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) return onBack();
    if (backUrl) return navigate(backUrl);
    navigate(-1);
  };

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center lg:hidden">
      <button
        onClick={handleBack}
        className="p-1 -ml-1 rounded-lg hover:bg-slate-100 transition-colors text-slate-600 shrink-0"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <h1 className="absolute left-0 right-0 text-center text-base font-semibold text-slate-900 pointer-events-none px-14 truncate">
        {title}
      </h1>
    </div>
  );
}