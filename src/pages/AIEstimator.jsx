import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Wand2, FileText, DollarSign, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

import UpgradePrompt from "../components/shared/UpgradePrompt";
import { useAISearchLimit } from "../components/shared/useAISearchLimit";

export default function AIEstimator() {
  const [user, setUser] = useState(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const hasAccess = user?.subscription_tier === "Pro" || user?.subscription_tier === "Enterprise" || user?.subscription_tier === "Free" || !user?.subscription_tier;
  const isFreeUser = !user?.subscription_tier || user?.subscription_tier === "Free";
  const { canSearch, searchesRemaining, incrementSearch } = useAISearchLimit(user);

  const handleGenerate = async () => {
    if (!canSearch && isFreeUser) return;
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert electrical estimator. Search the internet for current market pricing on electrical materials and labor rates. Based on this project description: "${description}"
        
        Generate a detailed electrical estimate using real current market prices for electrical materials from suppliers like Grainger, Graybar, Home Depot Pro, Rexel, or similar distributors.
        Include real manufacturer part numbers where possible. Use current labor rates for licensed electricians in the US.
        Be realistic and comprehensive.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            project_summary: { type: "string" },
            materials: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  quantity: { type: "number" },
                  unit: { type: "string" },
                  unit_price: { type: "number" },
                  total: { type: "number" },
                  image_url: { type: "string" }
                }
              }
            },
            labor_hours: { type: "number" },
            labor_rate: { type: "number" },
            materials_total: { type: "number" },
            labor_total: { type: "number" },
            total_estimate: { type: "number" }
          }
        }
      });
      
      await incrementSearch();

      // Recalculate totals with accurate math
      const materials = (result.materials || []).map(item => ({
        ...item,
        total: item.quantity * item.unit_price
      }));
      const materials_total = materials.reduce((sum, item) => sum + item.total, 0);
      const labor_total = result.labor_hours * result.labor_rate;
      const total_estimate = materials_total + labor_total;

      setEstimate({ ...result, materials, materials_total, labor_total, total_estimate });
    } catch (error) {
      console.error("Error generating estimate:", error);
    }
    setLoading(false);
  };

  const handleSaveToQuoteList = async () => {
    if (!estimate) return;
    
    const newList = await base44.entities.QuoteList.create({
      name: `AI Estimate - ${new Date().toLocaleDateString()}`,
      notes: estimate.project_summary,
      status: "draft"
    });

    const items = estimate.materials.map(item => ({
      quote_list_id: newList.id,
      product_name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price
    }));

    await base44.entities.QuoteItem.bulkCreate(items);
    
    alert("Estimate saved to Quote Lists!");
  };

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              AI Estimator
            </h1>
            <p className="text-slate-600 mt-2">Generate accurate electrical estimates with AI</p>
          </div>

          <UpgradePrompt
            feature="AI Estimator"
            requiredTier="Pro"
            message="Upgrade to Pro or Enterprise to generate AI-powered estimates from project descriptions"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            AI Estimator
          </h1>
          <p className="text-slate-600 mt-2">Generate accurate electrical estimates with AI</p>
        </div>

        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wand2 className="w-6 h-6 text-purple-600" />
              <CardTitle className="text-purple-900">Describe Your Project</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isFreeUser && (
              <div className={`text-sm px-3 py-2 rounded-lg border ${!canSearch ? 'bg-red-50 border-red-200 text-red-700' : 'bg-purple-50 border-purple-200 text-purple-700'}`}>
                {!canSearch
                  ? "You've used all 20 AI searches for this week. Upgrade to Pro for unlimited searches."
                  : `${searchesRemaining} of 20 free AI searches remaining this week`}
              </div>
            )}
            <Textarea
              placeholder="Describe the electrical project in detail... e.g., 'Install complete electrical system for a 2,000 sq ft commercial office including panels, circuits, lighting, outlets, and data cabling'"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="text-base"
            />
            <Button
              onClick={handleGenerate}
              disabled={!description || loading || (!canSearch && isFreeUser)}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Generating estimate...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Estimate
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {estimate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Project Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed">{estimate.project_summary}</p>
              </CardContent>
            </Card>

            {/* Materials */}
            <Card>
              <CardHeader>
                <CardTitle>Materials List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {estimate.materials?.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg bg-white">
                      <div className="w-14 h-14 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                        ) : null}
                        <ImageIcon className="w-6 h-6 text-slate-300" style={{ display: item.image_url ? 'none' : 'block' }} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-600">
                          {item.quantity} {item.unit} × ${item.unit_price?.toFixed(2)}
                        </p>
                      </div>
                      <span className="font-bold text-slate-900">${item.total?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Totals */}
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Materials Total:</span>
                  <span className="text-xl font-bold text-slate-900">${estimate.materials_total?.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Labor ({estimate.labor_hours} hrs @ ${estimate.labor_rate}/hr):</span>
                  <span className="text-xl font-bold text-slate-900">${estimate.labor_total?.toFixed(2)}</span>
                </div>
                <div className="pt-4 border-t-2 border-green-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    <span className="text-lg font-semibold text-slate-900">Total Estimate:</span>
                  </div>
                  <span className="text-3xl font-bold text-green-600">${estimate.total_estimate?.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEstimate(null)}>
                New Estimate
              </Button>
              <Button onClick={handleSaveToQuoteList} className="bg-blue-600 hover:bg-blue-700">
                <FileText className="w-4 h-4 mr-2" />
                Save to Quote List
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}