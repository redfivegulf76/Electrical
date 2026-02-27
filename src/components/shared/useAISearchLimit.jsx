import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const FREE_WEEKLY_LIMIT = 20;

function getStartOfWeek() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const diff = now.getDate() - day;
  const startOfWeek = new Date(now.setDate(diff));
  return startOfWeek.toISOString().split("T")[0]; // YYYY-MM-DD
}

export function useAISearchLimit(user) {
  const [usageRecord, setUsageRecord] = useState(null);
  const [searchesUsed, setSearchesUsed] = useState(0);
  const [limitReached, setLimitReached] = useState(false);

  const isFreeUser = user?.subscription_tier === "Free" || !user?.subscription_tier;

  useEffect(() => {
    if (user?.email) {
      loadUsage();
    }
  }, [user]);

  const loadUsage = async () => {
    console.log("[useAISearchLimit] Loading usage for user:", user?.email);
    try {
      const records = await base44.entities.UserOnboardingStatus.filter({ user_id: user.email });
      console.log("[useAISearchLimit] Records found:", records.length, records);

      let record;
      if (records.length === 0) {
        console.log("[useAISearchLimit] No record found, creating one...");
        record = await base44.entities.UserOnboardingStatus.create({
          user_id: user.email,
          onboarding_completed: false,
          weekly_ai_searches_count: 0,
          weekly_ai_searches_last_reset: getStartOfWeek()
        });
        console.log("[useAISearchLimit] Created record:", record);
      } else {
        record = records[0];
      }

      const weekStart = getStartOfWeek();
      const lastReset = record.weekly_ai_searches_last_reset;
      console.log("[useAISearchLimit] weekStart:", weekStart, "lastReset:", lastReset);

      if (lastReset !== weekStart) {
        console.log("[useAISearchLimit] Week changed, resetting count");
        const updated = await base44.entities.UserOnboardingStatus.update(record.id, {
          weekly_ai_searches_count: 0,
          weekly_ai_searches_last_reset: weekStart
        });
        setUsageRecord(updated);
        setSearchesUsed(0);
        setLimitReached(false);
      } else {
        setUsageRecord(record);
        const count = record.weekly_ai_searches_count || 0;
        setSearchesUsed(count);
        const reached = isFreeUser && count >= FREE_WEEKLY_LIMIT;
        setLimitReached(reached);
        console.log("[useAISearchLimit] count:", count, "isFreeUser:", isFreeUser, "limitReached:", reached, "canSearch:", !isFreeUser || count < FREE_WEEKLY_LIMIT);
      }
    } catch (err) {
      console.error("[useAISearchLimit] Error loading usage:", err);
    }
  };

  const incrementSearch = async () => {
    if (!usageRecord) {
      console.warn("[useAISearchLimit] incrementSearch called but usageRecord is null");
      return;
    }
    const newCount = (usageRecord.weekly_ai_searches_count || 0) + 1;
    console.log("[useAISearchLimit] Incrementing search count to:", newCount);
    const updated = await base44.entities.UserOnboardingStatus.update(usageRecord.id, {
      weekly_ai_searches_count: newCount,
      weekly_ai_searches_last_reset: getStartOfWeek()
    });
    setUsageRecord(updated);
    setSearchesUsed(newCount);
    setLimitReached(isFreeUser && newCount >= FREE_WEEKLY_LIMIT);
  };

  const canSearch = !isFreeUser || searchesUsed < FREE_WEEKLY_LIMIT;
  const searchesRemaining = isFreeUser ? Math.max(0, FREE_WEEKLY_LIMIT - searchesUsed) : null;

  return { canSearch, searchesUsed, searchesRemaining, limitReached, incrementSearch };
}