import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export function useOnboarding(user) {
  const [onboardingRecord, setOnboardingRecord] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) checkOnboarding(user);
  }, [user]);

  const checkOnboarding = async (user) => {
    try {
      const records = await base44.entities.UserOnboardingStatus.filter({
        user_id: user.email
      });

      if (records.length === 0) {
        // First time — create record and show onboarding
        const newRecord = await base44.entities.UserOnboardingStatus.create({
          user_id: user.email,
          onboarding_completed: false
        });
        setOnboardingRecord(newRecord);
        setShowOnboarding(true);
      } else {
        const record = records[0];
        setOnboardingRecord(record);
        if (!record.onboarding_completed) {
          setShowOnboarding(true);
        }
      }
    } catch (error) {
      console.error("Error checking onboarding:", error);
    }
    setLoading(false);
  };

  const completeOnboarding = () => {
    setShowOnboarding(false);
  };

  const replayTour = async () => {
    if (onboardingRecord?.id) {
      const updated = await base44.entities.UserOnboardingStatus.update(
        onboardingRecord.id,
        { onboarding_completed: false }
      );
      setOnboardingRecord(updated);
      setShowOnboarding(true);
    }
  };

  return { showOnboarding, onboardingRecord, loading, completeOnboarding, replayTour };
}