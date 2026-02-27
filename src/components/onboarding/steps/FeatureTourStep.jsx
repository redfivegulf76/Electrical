import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, Search, ShieldCheck, Database,
  ArrowRight, ArrowLeft, Crown, Lock, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const getFeatures = (roleType) => {
  const base = [
    {
      id: "estimator",
      icon: Sparkles,
      title: "AI Estimator",
      color: "from-cyan-500 to-cyan-700",
      badge: null,
      tooltip: "Describe your project here. AIpartsFinder builds your material list instantly.",
      demo: "Install 200A residential service with outdoor main panel and 12 branch circuits.",
      demoLabel: "Try Sample Project"
    },
    {
      id: "search",
      icon: Search,
      title: "Smart Product Search",
      color: "from-indigo-500 to-indigo-700",
      badge: null,
      tooltip: "Search naturally: '100A outdoor panel' — we return compatible options instantly."
    },
    {
      id: "compliance",
      icon: ShieldCheck,
      title: "Risk & Compliance Guard",
      color: "from-orange-500 to-orange-600",
      badge: "Pro Feature",
      tooltip: "Run optional safety validation to reduce inspection issues.",
      paid: true
    }
  ];

  if (roleType === "large_firm") {
    base.push({
      id: "catalog",
      icon: Database,
      title: "Catalog Intelligence",
      color: "from-purple-500 to-purple-700",
      badge: "Admin Only",
      tooltip: "Upload manufacturer catalogs to grow your product database."
    });
  }

  return base;
};

export default function FeatureTourStep({ roleType, onNext, onBack }) {
  const features = getFeatures(roleType);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const activeFeature = features[activeIndex];

  const handleFeatureAction = () => {
    if (activeFeature.paid) {
      setShowUpgrade(true);
      return;
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-black text-slate-900 mb-1">Core Features Tour</h2>
      <p className="text-slate-500 mb-6">Click through the key tools you'll use every day.</p>

      {/* Feature Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <button
              key={f.id}
              onClick={() => { setActiveIndex(i); setShowUpgrade(false); }}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold border-2 transition-all",
                activeIndex === i
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              )}
            >
              <Icon className="w-4 h-4" />
              {f.title}
              {f.badge && (
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full font-bold",
                  f.badge === "Pro Feature" ? "bg-orange-100 text-orange-600" : "bg-purple-100 text-purple-600"
                )}>
                  {f.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Feature Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFeature.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-6"
        >
          {!showUpgrade ? (
            <div className={`rounded-xl bg-gradient-to-br ${activeFeature.color} p-6 text-white`}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  {React.createElement(activeFeature.icon, { className: "w-7 h-7 text-white" })}
                </div>
                <div>
                  <h3 className="text-xl font-black mb-2">{activeFeature.title}</h3>
                  <p className="text-white/90 text-sm leading-relaxed mb-4">{activeFeature.tooltip}</p>
                  {activeFeature.demo && (
                    <div className="bg-white/10 rounded-lg p-3 mb-4 border border-white/20">
                      <p className="text-xs text-white/70 mb-1 font-semibold uppercase tracking-wider">Sample Input</p>
                      <p className="text-sm text-white font-medium">"{activeFeature.demo}"</p>
                    </div>
                  )}
                  {activeFeature.paid && (
                    <Button
                      onClick={handleFeatureAction}
                      variant="outline"
                      className="border-white text-white hover:bg-white hover:text-orange-600 font-bold"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      View Upgrade Options
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border-2 border-orange-300 bg-orange-50 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-6 h-6 text-orange-500" />
                <h3 className="text-lg font-black text-slate-900">Unlock Risk & Compliance Guard</h3>
              </div>
              <p className="text-slate-600 mb-5">
                Reduce inspection failures and liability with automated safety validation. Flag NEC violations before your estimate leaves your desk.
              </p>
              <div className="flex gap-3">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Pro
                </Button>
                <Button variant="ghost" onClick={() => setShowUpgrade(false)} className="text-slate-500">
                  Not now
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Dots */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {features.map((_, i) => (
          <button
            key={i}
            onClick={() => { setActiveIndex(i); setShowUpgrade(false); }}
            className={cn(
              "rounded-full transition-all",
              i === activeIndex ? "w-6 h-2.5 bg-cyan-500" : "w-2.5 h-2.5 bg-slate-200 hover:bg-slate-300"
            )}
          />
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack} className="text-slate-500">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        {activeIndex < features.length - 1 ? (
          <Button
            onClick={() => { setActiveIndex(activeIndex + 1); setShowUpgrade(false); }}
            variant="outline"
            className="font-bold border-2"
          >
            Next Feature
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={onNext}
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-6"
          >
            See Demo Estimate
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}