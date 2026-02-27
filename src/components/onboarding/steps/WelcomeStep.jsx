import React from "react";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function WelcomeStep({ onStart, onSkip }) {
  return (
    <div className="text-center py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.1 }}
        className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-cyan-700 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl"
      >
        <Zap className="w-14 h-14 text-white" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
          Welcome to PackOutAI
        </h1>
        <p className="text-lg text-slate-500 max-w-md mx-auto leading-relaxed mb-10">
          AI-powered estimating and electrical intelligence for modern contractors.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="flex flex-col sm:flex-row gap-3 justify-center"
      >
        <Button
          onClick={onStart}
          className="bg-gradient-to-r from-cyan-500 to-cyan-700 hover:from-cyan-600 hover:to-cyan-800 text-white px-8 h-12 text-base font-bold shadow-lg"
        >
          Start Quick Setup
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        <Button
          variant="ghost"
          onClick={onSkip}
          className="text-slate-500 hover:text-slate-700 h-12 font-medium"
        >
          Skip for Now
        </Button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-slate-400 mt-6"
      >
        Takes about 2 minutes · Can be replayed anytime in Settings
      </motion.p>
    </div>
  );
}