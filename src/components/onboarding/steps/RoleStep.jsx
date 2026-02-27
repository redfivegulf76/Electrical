import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { User, Users, Building2, ArrowRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const roles = [
  {
    id: "independent",
    label: "Independent Electrician",
    description: "Solo contractor or small crew — fast estimates, no complexity",
    icon: User,
    color: "from-cyan-50 to-cyan-100 border-cyan-300 hover:border-cyan-500"
  },
  {
    id: "small_shop",
    label: "Small / Mid-Size Shop",
    description: "Growing team that needs shared projects and templates",
    icon: Users,
    color: "from-indigo-50 to-indigo-100 border-indigo-300 hover:border-indigo-500"
  },
  {
    id: "large_firm",
    label: "Large Firm / Estimating Team",
    description: "Multi-user access, catalog management, enterprise features",
    icon: Building2,
    color: "from-orange-50 to-orange-100 border-orange-300 hover:border-orange-500"
  }
];

export default function RoleStep({ selected, onNext, onBack }) {
  const [role, setRole] = useState(selected || "");

  return (
    <div>
      <h2 className="text-2xl font-black text-slate-900 mb-2">What best describes you?</h2>
      <p className="text-slate-500 mb-6">We'll tailor your experience based on your role.</p>

      <div className="space-y-3 mb-8">
        {roles.map((r, i) => {
          const Icon = r.icon;
          const isSelected = role === r.id;
          return (
            <motion.button
              key={r.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setRole(r.id)}
              className={cn(
                "w-full text-left p-4 rounded-xl border-2 bg-gradient-to-r transition-all duration-200 flex items-center gap-4",
                isSelected
                  ? "border-cyan-500 bg-gradient-to-r from-cyan-50 to-cyan-100 shadow-md ring-2 ring-cyan-200"
                  : r.color
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                isSelected ? "bg-cyan-500" : "bg-white shadow"
              )}>
                <Icon className={cn("w-6 h-6", isSelected ? "text-white" : "text-slate-600")} />
              </div>
              <div>
                <p className="font-bold text-slate-900">{r.label}</p>
                <p className="text-sm text-slate-500">{r.description}</p>
              </div>
              {isSelected && (
                <div className="ml-auto w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center shrink-0">
                  <div className="w-3 h-3 rounded-full bg-white" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack} className="text-slate-500">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={() => onNext(role)}
          disabled={!role}
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-6"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}