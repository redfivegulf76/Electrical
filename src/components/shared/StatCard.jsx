import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function StatCard({ title, value, icon: Icon, color = "cyan", subtitle }) {
  const colorClasses = {
    cyan: "from-cyan-400 to-cyan-600 border-cyan-300",
    green: "from-green-400 to-green-600 border-green-300",
    orange: "from-orange-400 to-orange-600 border-orange-300",
    purple: "from-purple-400 to-purple-600 border-purple-300"
  };

  return (
    <Card className="border-2 border-slate-200 hover:shadow-lg transition-all duration-300 bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
          <div className={`p-2.5 rounded-lg bg-gradient-to-br ${colorClasses[color]} shadow-lg border-2`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-[#263238]">{value}</p>
        {subtitle && <p className="text-sm text-slate-500 mt-1 font-semibold">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}