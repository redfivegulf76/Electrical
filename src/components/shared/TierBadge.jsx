import React from "react";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";

const tierColors = {
  Free: "bg-slate-700 text-slate-200 border-slate-600",
  Pro: "bg-cyan-500 text-white border-cyan-400",
  Enterprise: "bg-orange-500 text-white border-orange-400"
};

export default function TierBadge({ tier, showIcon = false }) {
  return (
    <Badge className={`${tierColors[tier]} border-2 font-bold flex items-center gap-1`}>
      {showIcon && <Crown className="w-3 h-3" />}
      {tier}
    </Badge>
  );
}