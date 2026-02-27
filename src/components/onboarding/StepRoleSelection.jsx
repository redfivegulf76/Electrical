import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { User, Users, Building2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const roles = [
  {
    id: "independent",
    label: "Independent Electrician",
    description: "Solo contractor, small jobs, quick estimates",
    icon: User,
    color: "border-cyan-400 bg-cyan-50",
    iconColor: "text-cyan-600"
  },
  {
    id: "small_shop",
    label: "Small / Mid-Size Shop",
    description: "A small team, mix of residential and commercial",
    icon: Users,
    color: "border-orange-400 bg-orange-50",
    iconColor: "text-orange-600"
  },
  {
    id: "large_firm",
    label: "Large Firm / Estimating Team",
    description: "Multiple estimators, large commercial projects",
    icon: Building2,
    color: "border-purple-400 bg-purple-50",
    iconColor: "text-purple-600"
  }
];

export default function StepRoleSelection({ onNext, onBack }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="space-y-6 py-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">What best describes you?</h2>
        <p className="text-slate-500 mt-1">We'll tailor the tour to your workflow.</p>
      </div>

      <div className="space-y-3">
        {roles.map((role, i) => (
          <motion.button
            key={role.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setSelected(role.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
              selected === role.id
                ? role.color + " shadow-md scale-[1.01]"
                : "border-slate-200 hover:border-slate-300 bg-white"
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selected === role.id ? "bg-white shadow" : "bg-slate-100"}`}>
              <role.icon className={`w-6 h-6 ${selected === role.id ? role.iconColor : "text-slate-500"}`} />
            </div>
            <div>
              <p className="font-bold text-slate-900">{role.label}</p>
              <p className="text-sm text-slate-500">{role.description}</p>
            </div>
            {selected === role.id && (
              <div className="ml-auto w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <Button onClick={onBack} variant="outline" className="flex-1">Back</Button>
        <Button
          onClick={() => selected && onNext(selected)}
          disabled={!selected}
          className="flex-1 bg-cyan-600 hover:bg-cyan-700"
        >
          Continue <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}