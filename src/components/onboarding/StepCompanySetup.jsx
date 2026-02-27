import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY"
];

export default function StepCompanySetup({ onNext, onBack }) {
  const [form, setForm] = useState({
    company_name: "",
    primary_work_type: "",
    state: ""
  });

  const isValid = form.company_name.trim() && form.primary_work_type && form.state;

  return (
    <div className="space-y-6 py-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Set Up Your Company</h2>
        <p className="text-slate-500 mt-1">Quick details to personalize your experience.</p>
      </div>

      <div className="space-y-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Label htmlFor="company_name">Company Name</Label>
          <Input
            id="company_name"
            placeholder="e.g., Apex Electric LLC"
            value={form.company_name}
            onChange={(e) => setForm({ ...form, company_name: e.target.value })}
            className="mt-1"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Label>Primary Work Type</Label>
          <Select value={form.primary_work_type} onValueChange={(v) => setForm({ ...form, primary_work_type: v })}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select work type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="mixed">Mixed (Both)</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Label>State</Label>
          <Select value={form.state} onValueChange={(v) => setForm({ ...form, state: v })}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select state..." />
            </SelectTrigger>
            <SelectContent className="max-h-48">
              {US_STATES.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.state && (
            <p className="text-xs text-cyan-600 mt-1">
              ✓ Regional NEC compliance tips will be enabled for {form.state}
            </p>
          )}
        </motion.div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button onClick={onBack} variant="outline" className="flex-1">Back</Button>
        <Button
          onClick={() => isValid && onNext(form)}
          disabled={!isValid}
          className="flex-1 bg-cyan-600 hover:bg-cyan-700"
        >
          Continue <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}