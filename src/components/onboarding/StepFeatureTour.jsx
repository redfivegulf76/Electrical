import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, Search, ShieldCheck, Database, 
  ArrowRight, ArrowLeft, Crown, Lock, ChevronRight 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const DEMO_PROJECT = "Install 200A residential service with outdoor main panel and 12 branch circuits.";

export default function StepFeatureTour({ roleType, user, onNext, onBack, onDemoFill }) {
  const [tourStep, setTourStep] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const isAdmin = user?.role === "admin";
  const hasPaidAccess = user?.subscription_tier === "Pro" || user?.subscription_tier === "Enterprise";

  const tourSteps = [
    {
      id: "estimator",
      icon: Sparkles,
      color: "from-cyan-500 to-cyan-600",
      badge: "Core Feature",
      badgeColor: "bg-cyan-100 text-cyan-700",
      title: "AI Estimator",
      description: "Describe your project here. PackOutAI builds your complete material list instantly — no spreadsheets needed.",
      action: (
        <Button
          onClick={() => { onDemoFill(DEMO_PROJECT); }}
          className="bg-cyan-600 hover:bg-cyan-700 text-sm"
          size="sm"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Try Sample Project
        </Button>
      ),
      preview: (
        <div className="bg-slate-800 rounded-lg p-3 text-xs text-slate-300 font-mono mt-3">
          <span className="text-cyan-400">→ </span>
          "{DEMO_PROJECT}"
        </div>
      )
    },
    {
      id: "search",
      icon: Search,
      color: "from-blue-500 to-blue-600",
      badge: "Core Feature",
      badgeColor: "bg-blue-100 text-blue-700",
      title: "Smart Product Search",
      description: "Search naturally: '100A outdoor panel' — we return compatible options instantly, filtered by your project specs.",
      preview: (
        <div className="bg-slate-800 rounded-lg p-3 text-xs text-slate-300 font-mono mt-3">
          <span className="text-blue-400">Search: </span>"100A outdoor panel"
          <div className="mt-2 space-y-1">
            <div className="text-green-400">✓ Square D QO130L200PG — 200A, Outdoor</div>
            <div className="text-green-400">✓ Siemens P3042B1200 — 120/240V</div>
          </div>
        </div>
      )
    },
    {
      id: "compliance",
      icon: ShieldCheck,
      color: "from-orange-500 to-orange-600",
      badge: "Paid Feature",
      badgeColor: "bg-orange-100 text-orange-700",
      title: "Risk & Compliance Guard",
      description: "Run optional safety validation to reduce inspection issues and liability before submitting estimates.",
      action: hasPaidAccess ? null : (
        <Button
          onClick={() => setShowUpgradeModal(true)}
          variant="outline"
          className="border-orange-400 text-orange-600 hover:bg-orange-50 text-sm"
          size="sm"
        >
          <Lock className="w-4 h-4 mr-2" />
          Unlock Feature
        </Button>
      ),
      preview: (
        <div className="bg-slate-800 rounded-lg p-3 text-xs mt-3 space-y-1">
          <div className="text-yellow-400">⚠ GFCI required within 6ft of water source (NEC 210.8)</div>
          <div className="text-red-400">✗ Arc-fault protection missing on bedroom circuits</div>
          <div className="text-green-400">✓ Service entrance grounding compliant</div>
        </div>
      )
    },
    ...(isAdmin ? [{
      id: "catalog",
      icon: Database,
      color: "from-purple-500 to-purple-600",
      badge: "Admin Only",
      badgeColor: "bg-purple-100 text-purple-700",
      title: "Catalog Intelligence",
      description: "Upload manufacturer catalogs to grow your product database. AI extracts structured specs automatically.",
      preview: (
        <div className="bg-slate-800 rounded-lg p-3 text-xs text-slate-300 mt-3">
          <span className="text-purple-400">→ Drag & drop PDF catalogs</span>
          <div className="text-green-400 mt-1">✓ AI extracts: MPN, specs, voltage, amperage</div>
        </div>
      )
    }] : [])
  ];

  const current = tourSteps[tourStep];
  const isLast = tourStep === tourSteps.length - 1;

  return (
    <div className="space-y-4 py-2">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Feature Tour</h2>
        <p className="text-slate-500 mt-1">Explore what PackOutAI can do for you.</p>
      </div>

      {/* Tour step indicators */}
      <div className="flex items-center justify-center gap-2">
        {tourSteps.map((_, i) => (
          <button
            key={i}
            onClick={() => setTourStep(i)}
            className={`h-2 rounded-full transition-all ${
              i === tourStep ? "w-8 bg-cyan-500" : "w-2 bg-slate-300"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          className="border-2 border-slate-200 rounded-2xl p-5 bg-white"
        >
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${current.color} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
              <current.icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-slate-900 text-lg">{current.title}</h3>
                <Badge className={`text-xs ${current.badgeColor}`}>{current.badge}</Badge>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{current.description}</p>
              {current.preview}
              {current.action && <div className="mt-3">{current.action}</div>}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3">
        <Button
          onClick={() => tourStep > 0 ? setTourStep(tourStep - 1) : onBack()}
          variant="outline"
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button
          onClick={() => isLast ? onNext() : setTourStep(tourStep + 1)}
          className="flex-1 bg-cyan-600 hover:bg-cyan-700"
        >
          {isLast ? "See Demo Estimate" : "Next"}
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Upgrade modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center z-10 p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Unlock Risk & Compliance Guard</h3>
                <p className="text-slate-600 text-sm">
                  Reduce inspection failures and liability with automated NEC safety validation on every estimate.
                </p>
                <Link to={createPageUrl("PaymentPortal")}>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 font-bold">
                    Upgrade to Compliance Tier
                  </Button>
                </Link>
                <Button variant="ghost" onClick={() => setShowUpgradeModal(false)} className="w-full text-slate-500">
                  Maybe Later
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}