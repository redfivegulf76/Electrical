import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

import StepWelcome from "./StepWelcome";
import StepRoleSelection from "./StepRoleSelection";
import StepCompanySetup from "./StepCompanySetup";
import StepFeatureTour from "./StepFeatureTour";
import StepDemoEstimate from "./StepDemoEstimate";

const TOTAL_STEPS = 5; // welcome, role, company, tour, demo

export default function OnboardingModal({ user, onboardingRecord, onComplete }) {
  const [step, setStep] = useState(0);
  const [roleType, setRoleType] = useState(null);
  const [companyData, setCompanyData] = useState({});
  const [demoText, setDemoText] = useState("Install 200A residential service with outdoor main panel and 12 branch circuits.");

  const saveAndClose = async (completed = true) => {
    try {
      if (onboardingRecord?.id) {
        await base44.entities.UserOnboardingStatus.update(onboardingRecord.id, {
          onboarding_completed: completed,
          role_type: roleType,
          company_name: companyData.company_name,
          company_type: roleType,
          primary_work_type: companyData.primary_work_type,
          state: companyData.state
        });
      } else {
        await base44.entities.UserOnboardingStatus.create({
          user_id: user?.email,
          onboarding_completed: completed,
          role_type: roleType,
          company_name: companyData.company_name,
          company_type: roleType,
          primary_work_type: companyData.primary_work_type,
          state: companyData.state
        });
      }
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
    onComplete();
  };

  const handleSkip = () => saveAndClose(true);

  const stepLabels = ["Welcome", "Your Role", "Company", "Features", "Demo"];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
        >
          {/* Header bar */}
          <div className="sticky top-0 bg-white rounded-t-3xl border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              {stepLabels.map((label, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                    i < step ? "bg-cyan-500 text-white" :
                    i === step ? "bg-slate-900 text-white" :
                    "bg-slate-100 text-slate-400"
                  }`}>
                    {i < step ? "✓" : i + 1}
                  </div>
                  {i < stepLabels.length - 1 && (
                    <div className={`w-4 h-0.5 ${i < step ? "bg-cyan-400" : "bg-slate-200"}`} />
                  )}
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="text-slate-400 hover:text-slate-700 h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Step content */}
          <div className="px-6 pb-6 pt-4 relative">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <StepWelcome
                    onStart={() => setStep(1)}
                    onSkip={handleSkip}
                  />
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="role" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <StepRoleSelection
                    onNext={(role) => { setRoleType(role); setStep(2); }}
                    onBack={() => setStep(0)}
                  />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="company" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <StepCompanySetup
                    onNext={(data) => { setCompanyData(data); setStep(3); }}
                    onBack={() => setStep(1)}
                  />
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="tour" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <StepFeatureTour
                    roleType={roleType}
                    user={user}
                    onNext={() => setStep(4)}
                    onBack={() => setStep(2)}
                    onDemoFill={(text) => { setDemoText(text); setStep(4); }}
                  />
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="demo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <StepDemoEstimate
                    demoText={demoText}
                    onFinish={() => saveAndClose(true)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}