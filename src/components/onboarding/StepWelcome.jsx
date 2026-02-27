import React from "react";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function StepWelcome({ onStart, onSkip }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8 px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-3xl flex items-center justify-center shadow-2xl mb-8 border-4 border-cyan-300"
      >
        <Zap className="w-12 h-12 text-white" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4 mb-10"
      >
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Welcome to <span className="text-cyan-600">PackOutAI</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-md mx-auto leading-relaxed">
          AI-powered estimating and electrical intelligence for modern contractors.
        </p>
        <p className="text-sm text-slate-400">
          Let's get you set up in under 2 minutes.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4 w-full max-w-sm"
      >
        <Button
          onClick={onStart}
          className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white h-12 text-base font-bold shadow-lg"
        >
          Start Quick Setup
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        <Button
          onClick={onSkip}
          variant="outline"
          className="flex-1 h-12 text-slate-500"
        >
          Skip for Now
        </Button>
      </motion.div>
    </div>
  );
}