import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function StatCard({ title, value, icon: Icon, color = "cyan", subtitle }) {
  const iconColors = {
    cyan: "text-blue-500 bg-blue-50",
    green: "text-emerald-500 bg-emerald-50",
    orange: "text-amber-500 bg-amber-50",
    purple: "text-violet-500 bg-violet-50"
  };

  return (
    <Card className="border border-slate-200 hover:shadow-sm transition-all duration-200 bg-white">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <div className={`p-2 rounded-lg ${iconColors[color]}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}