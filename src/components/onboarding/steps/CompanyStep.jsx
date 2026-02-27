import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];

export default function CompanyStep({ data, onNext, onBack }) {
  const [form, setForm] = useState({
    company_name: data.company_name || "",
    primary_work_type: data.primary_work_type || "",
    state: data.state || ""
  });

  const handleSubmit = () => {
    onNext(form);
  };

  return (
    <div>
      <h2 className="text-2xl font-black text-slate-900 mb-2">Set up your company</h2>
      <p className="text-slate-500 mb-6">Quick setup to personalize your experience and compliance options.</p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5 mb-8"
      >
        <div>
          <Label htmlFor="company_name" className="font-bold text-slate-700 mb-2 block">
            Company Name
          </Label>
          <Input
            id="company_name"
            placeholder="e.g., Apex Electrical Services"
            value={form.company_name}
            onChange={(e) => setForm({ ...form, company_name: e.target.value })}
            className="h-11"
          />
        </div>

        <div>
          <Label className="font-bold text-slate-700 mb-2 block">Primary Work Type</Label>
          <div className="grid grid-cols-3 gap-3">
            {["residential", "commercial", "mixed"].map((type) => (
              <button
                key={type}
                onClick={() => setForm({ ...form, primary_work_type: type })}
                className={`py-3 px-2 rounded-xl border-2 text-sm font-bold capitalize transition-all ${
                  form.primary_work_type === type
                    ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="font-bold text-slate-700 mb-2 block">
            State <span className="text-slate-400 font-normal">(for regional code options)</span>
          </Label>
          <Select value={form.state} onValueChange={(v) => setForm({ ...form, state: v })}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select your state..." />
            </SelectTrigger>
            <SelectContent className="max-h-48">
              {US_STATES.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack} className="text-slate-500">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-6"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}