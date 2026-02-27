import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import WelcomeStep from "./steps/WelcomeStep";
import RoleStep from "./steps/RoleStep";
import CompanyStep from "./steps/CompanyStep";
import FeatureTourStep from "./steps/FeatureTourStep";
import DemoEstimateStep from "./steps/DemoEstimateStep";

const TOTAL_STEPS = 5;

export default function OnboardingModal({ onComplete, onboardingRecord }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    role_type: onboardingRecord?.role_type || "",
    company_name: onboardingRecord?.company_name || "",
    company_type: onboardingRecord?.company_type || "",
    primary_work_type: onboardingRecord?.primary_work_type || "",
    state: onboardingRecord?.state || ""
  });

  const updateData = (fields) => setData(prev => ({ ...prev, ...fields }));

  const handleSkip = async () => {
    await completeOnboarding();
  };

  const handleNext = async (newData = {}) => {
    const merged = { ...data, ...newData };
    setData(merged);

    // Persist step data
    if (onboardingRecord?.id) {
      await base44.entities.UserOnboardingStatus.update(onboardingRecord.id, merged);
    }

    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      await completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    if (onboardingRecord?.id) {
      await base44.entities.UserOnboardingStatus.update(onboardingRecord.id, {
        onboarding_completed: true
      });
    }
    onComplete();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.25 }}
          className="relative z-10 w-full max-w-2xl mx-4"
        >
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Progress Bar */}
            {step > 1 && (
              <div className="w-full h-1.5 bg-slate-100">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600"
                  initial={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
                  animate={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}

            {/* Step Counter */}
            {step > 1 && (
              <div className="flex items-center justify-between px-6 pt-4 pb-0">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Step {step - 1} of {TOTAL_STEPS - 1}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
                >
                  Skip for Now
                </Button>
              </div>
            )}

            {/* Step Content */}
            <div className="p-8">
              {step === 1 && (
                <WelcomeStep onStart={() => setStep(2)} onSkip={handleSkip} />
              )}
              {step === 2 && (
                <RoleStep
                  selected={data.role_type}
                  onNext={(role_type) => handleNext({ role_type })}
                  onBack={handleBack}
                />
              )}
              {step === 3 && (
                <CompanyStep
                  data={data}
                  onNext={(fields) => handleNext(fields)}
                  onBack={handleBack}
                />
              )}
              {step === 4 && (
                <FeatureTourStep
                  roleType={data.role_type}
                  onNext={() => handleNext()}
                  onBack={handleBack}
                />
              )}
              {step === 5 && (
                <DemoEstimateStep
                  onFinish={completeOnboarding}
                  onBack={handleBack}
                />
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}