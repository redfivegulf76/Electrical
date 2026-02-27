import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, Package, Clock, AlertTriangle, Download, Save, CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";

const DEMO_MATERIALS = [
  { item: "200A Main Breaker Panel", qty: 1, unit: "each", labor: 4.0, category: "panels" },
  { item: "200A Service Entrance Cable (SER)", qty: 50, unit: "ft", labor: 2.0, category: "wire_cable" },
  { item: "2-pole 20A Circuit Breakers", qty: 12, unit: "each", labor: 0.5, category: "breakers" },
  { item: "#12 AWG THHN Copper Wire", qty: 600, unit: "ft", labor: 0.0, category: "wire_cable" },
  { item: "1/2\" EMT Conduit", qty: 40, unit: "ft", labor: 1.5, category: "conduit" },
  { item: "Meter Socket 200A", qty: 1, unit: "each", labor: 2.5, category: "panels" },
  { item: "Ground Rod Kit", qty: 2, unit: "each", labor: 1.0, category: "other" },
  { item: "Weatherhead & Service Entrance Kit", qty: 1, unit: "each", labor: 1.5, category: "other" }
];

const categoryColors = {
  panels: "bg-cyan-100 text-cyan-700",
  wire_cable: "bg-indigo-100 text-indigo-700",
  breakers: "bg-orange-100 text-orange-700",
  conduit: "bg-green-100 text-green-700",
  other: "bg-slate-100 text-slate-600"
};

export default function DemoEstimateStep({ onFinish, onBack }) {
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  const totalLaborHours = DEMO_MATERIALS.reduce((sum, m) => sum + (m.labor * (m.qty || 1) * (m.unit === 'ft' ? 0.1 : 1)), 0).toFixed(1);

  return (
    <div>
      <h2 className="text-2xl font-black text-slate-900 mb-1">Demo Estimate</h2>
      <p className="text-slate-500 mb-2 text-sm">
        <span className="font-semibold text-slate-700">Project:</span> "Install 200A residential service with outdoor main panel and 12 branch circuits."
      </p>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-9 h-9 text-white" />
          </div>
          <p className="text-slate-600 font-semibold text-lg">AI is building your estimate...</p>
          <p className="text-slate-400 text-sm mt-1">Matching specs, materials & labor codes</p>
          <div className="mt-6 flex justify-center gap-1">
            {[0, 1, 2, 3].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-cyan-400 rounded-full"
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
              />
            ))}
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-cyan-50 border-2 border-cyan-200 rounded-xl p-3 text-center">
              <Package className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
              <p className="text-xl font-black text-cyan-700">{DEMO_MATERIALS.length}</p>
              <p className="text-xs font-semibold text-cyan-600">Line Items</p>
            </div>
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-3 text-center">
              <Clock className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <p className="text-xl font-black text-indigo-700">{totalLaborHours}h</p>
              <p className="text-xs font-semibold text-indigo-600">Est. Labor</p>
            </div>
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-3 text-center">
              <CheckCircle2 className="w-5 h-5 text-orange-600 mx-auto mb-1" />
              <p className="text-xl font-black text-orange-700">NEC 2023</p>
              <p className="text-xs font-semibold text-orange-600">Compliant</p>
            </div>
          </div>

          {/* Materials List */}
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {DEMO_MATERIALS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Badge className={`${categoryColors[item.category]} text-xs shrink-0`}>
                    {item.category.replace("_", " ")}
                  </Badge>
                  <span className="text-sm font-medium text-slate-800 truncate">{item.item}</span>
                </div>
                <span className="text-sm font-bold text-slate-600 shrink-0 ml-2">
                  {item.qty} {item.unit}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Compliance Warning */}
          <div className="flex items-start gap-3 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-yellow-800">Compliance Tip</p>
              <p className="text-xs text-yellow-700 mt-0.5">
                200A outdoor service in coastal states may require weatherproof enclosure — verify local AHJ requirements.
              </p>
            </div>
          </div>

          {/* Action Hint */}
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Download className="w-4 h-4" />
            Export to PDF / Excel
            <span className="mx-2">·</span>
            <Save className="w-4 h-4" />
            Save to Quote List
          </div>
        </motion.div>
      )}

      {!loading && (
        <div className="flex justify-between mt-5">
          <Button variant="ghost" onClick={onBack} className="text-slate-500">
            Back
          </Button>
          <Button
            onClick={onFinish}
            className="bg-gradient-to-r from-cyan-500 to-cyan-700 hover:from-cyan-600 hover:to-cyan-800 text-white font-bold px-8"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Get Started!
          </Button>
        </div>
      )}
    </div>
  );
}