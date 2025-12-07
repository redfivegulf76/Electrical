import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function UpgradePrompt({ feature, requiredTier, message }) {
  return (
    <Card className="border-2 border-dashed border-slate-300 bg-slate-100">
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-orange-400">
          <Crown className="w-8 h-8 text-yellow-300" />
        </div>
        <h3 className="text-xl font-bold text-[#263238] mb-2">{feature}</h3>
        <p className="text-slate-600 mb-6 font-medium">{message}</p>
        <Link to={createPageUrl("Pricing")}>
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg border-2 border-cyan-400 font-bold">
            <Sparkles className="w-4 h-4 mr-2" />
            Upgrade to {requiredTier}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}