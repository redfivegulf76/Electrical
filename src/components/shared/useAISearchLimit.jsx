import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const FREE_WEEKLY_LIMIT = 20;

function getStartOfWeek() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day;
  const startOfWeek = new Date(now.setDate(diff));
  return startOfWeek.toISOString().split("T")[0];
}

export function useAISearchLimit(user) {
  const [usageRecord, setUsageRecord] = useState(null);
  const [searchesUsed, setSearchesUsed] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Anyone without a paid tier is treated as free
  const isFreeUser = !user?.subscription_tier || user?.subscription_tier === "Free";

  useEffect(() => {
    if (user?.email) {
      loadUsage();
    }
  }, [user?.email]);

  const loadUsage = async () => {
    try {
      const records = await base44.entities.UserOnboardingStatus.filter({ user_id: user.email });

      let record;
      if (records.length === 0) {
        // Create a new record for this user
        record = await base44.entities.UserOnboardingStatus.create({
          user_id: user.email,
          onboarding_completed: false,
          weekly_ai_searches_count: 0,
          weekly_ai_searches_last_reset: getStartOfWeek()
        });
      } else {
        record = records[0];
      }

      // Reset count if it's a new week
      const weekStart = getStartOfWeek();
      if (record.weekly_ai_searches_last_reset !== weekStart) {
        const updated = await base44.entities.UserOnboardingStatus.update(record.id, {
          weekly_ai_searches_count: 0,
          weekly_ai_searches_last_reset: weekStart
        });
        setUsageRecord(updated);
        setSearchesUsed(0);
      } else {
        setUsageRecord(record);
        setSearchesUsed(record.weekly_ai_searches_count || 0);
      }
    } catch (err) {
      console.error("[useAISearchLimit] Error loading usage:", err);
      // On error, default to allowing searches
      setSearchesUsed(0);
    } finally {
      setLoaded(true);
    }
  };

  const incrementSearch = async () => {
    if (!usageRecord) return;
    const newCount = (usageRecord.weekly_ai_searches_count || 0) + 1;
    try {
      const updated = await base44.entities.UserOnboardingStatus.update(usageRecord.id, {
        weekly_ai_searches_count: newCount,
        weekly_ai_searches_last_reset: getStartOfWeek()
      });
      setUsageRecord(updated);
      setSearchesUsed(newCount);
    } catch (err) {
      console.error("[useAISearchLimit] Error incrementing search:", err);
    }
  };

  // While loading, allow search (don't block). Once loaded, apply the limit for free users.
  const canSearch = !loaded || !isFreeUser || searchesUsed < FREE_WEEKLY_LIMIT;
  const searchesRemaining = isFreeUser ? Math.max(0, FREE_WEEKLY_LIMIT - searchesUsed) : null;

  return { canSearch, searchesUsed, searchesRemaining, loaded, incrementSearch };
}