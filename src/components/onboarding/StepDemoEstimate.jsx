import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { 
  Sparkles, Download, Save, CheckCircle2, 
  AlertTriangle, Clock, Package, Wrench 
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const DEMO_PROJECT = "Install 200A residential service with outdoor main panel and 12 branch circuits.";

export default function StepDemoEstimate({ demoText, onFinish }) {
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState(null);

  useEffect(() => {
    runDemoEstimate();
  }, []);

  const runDemoEstimate = async () => {
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert electrical estimator. Generate a concise material and labor estimate for:

"${demoText || DEMO_PROJECT}"

Provide realistic quantities and labor hours for a licensed electrician.`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            materials: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  quantity: { type: "number" },
                  unit: { type: "string" },
                  category: { type: "string" }
                }
              }
            },
            total_labor_hours: { type: "number" },
            labor_breakdown: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  task: { type: "string" },
                  hours: { type: "number" }
                }
              }
            },
            compliance_warnings: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });
      setEstimate(result);
    } catch (error) {
      console.error("Demo estimate error:", error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4 py-2">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Live Demo Estimate</h2>
        <p className="text-slate-500 mt-1">PackOutAI just ran your sample project.</p>
      </div>

      {/* Project input preview */}
      <div className="bg-slate-800 rounded-xl p-4 text-sm text-slate-300 border-2 border-cyan-500">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-cyan-400 font-semibold text-xs uppercase tracking-wide">Project Description</span>
        </div>
        <p className="text-white leading-relaxed">{demoText || DEMO_PROJECT}</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-cyan-200 rounded-full animate-spin border-t-cyan-600" />
            <Sparkles className="w-6 h-6 text-cyan-600 absolute inset-0 m-auto" />
          </div>
          <p className="text-slate-600 font-medium">AI is building your estimate...</p>
        </div>
      ) : estimate ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-3 text-center">
              <Package className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-cyan-700">{estimate.materials?.length || 0}</p>
              <p className="text-xs text-slate-500">Materials</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
              <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-blue-700">{estimate.total_labor_hours || 0}h</p>
              <p className="text-xs text-slate-500">Labor</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
              <AlertTriangle className="w-5 h-5 text-orange-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-orange-700">{estimate.compliance_warnings?.length || 0}</p>
              <p className="text-xs text-slate-500">Warnings</p>
            </div>
          </div>

          {/* Materials list */}
          {estimate.materials?.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Package className="w-4 h-4 text-cyan-600" /> Materials List
              </h4>
              <div className="border rounded-xl overflow-hidden">
                <div className="max-h-40 overflow-y-auto">
                  {estimate.materials.slice(0, 8).map((item, i) => (
                    <div key={i} className={`flex justify-between items-center px-4 py-2 text-sm ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                      <span className="text-slate-700 font-medium truncate flex-1">{item.name}</span>
                      <span className="text-slate-500 ml-3 font-mono">{item.quantity} {item.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Compliance warnings */}
          {estimate.compliance_warnings?.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 space-y-1">
              <p className="text-xs font-bold text-yellow-800 uppercase tracking-wide mb-2">
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                Compliance Notes
              </p>
              {estimate.compliance_warnings.map((w, i) => (
                <p key={i} className="text-xs text-yellow-700">• {w}</p>
              ))}
            </div>
          )}

          {/* Export / save CTA */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-4 text-white">
            <p className="text-sm font-bold mb-3">Ready to use this on a real project?</p>
            <div className="flex gap-2">
              <Link to={createPageUrl("AIEstimator")} className="flex-1">
                <Button size="sm" className="w-full bg-cyan-500 hover:bg-cyan-600 text-sm font-bold">
                  <Sparkles className="w-4 h-4 mr-1" /> Open Estimator
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      ) : null}

      <Button onClick={onFinish} className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 h-12 text-base font-bold">
        <CheckCircle2 className="w-5 h-5 mr-2" />
        Finish Setup — Let's Go!
      </Button>
    </div>
  );
}