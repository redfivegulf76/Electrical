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
    const records = await base44.entities.UserOnboardingStatus.filter({ user_id: user.email });
    if (records.length > 0) {
      const record = records[0];
      const weekStart = getStartOfWeek();
      const lastReset = record.weekly_ai_searches_last_reset;

      // If the week has changed, reset count
      if (lastReset !== weekStart) {
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
        setLimitReached(isFreeUser && count >= FREE_WEEKLY_LIMIT);
      }
    }
  };

  const incrementSearch = async () => {
    if (!usageRecord) return;
    const newCount = (usageRecord.weekly_ai_searches_count || 0) + 1;
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