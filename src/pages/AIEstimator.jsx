import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Wand2, FileText, DollarSign, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";

import UpgradePrompt from "../components/shared/UpgradePrompt";

export default function AIEstimator() {
  const [user, setUser] = useState(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState(null);
  const [placeholderSKUs, setPlaceholderSKUs] = useState([]);

  useEffect(() => {
    loadUser();
    loadPlaceholderSKUs();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const loadPlaceholderSKUs = async () => {
    const skus = await base44.entities.PlaceholderSKU.filter({ job_type: "200A residential panel change" }, null, 200);
    setPlaceholderSKUs(skus);
  };

  const hasAccess = user?.subscription_tier === "Pro" || user?.subscription_tier === "Enterprise";

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Build the SKU list for the prompt
      const skuList = placeholderSKUs.map(sku => 
        `${sku.SKU_ID}: ${sku.Product_Name} (${sku.Category}, ${sku.Amperage_Voltage || 'N/A'}, Unit: ${sku.unit || 'each'})`
      ).join('\n');

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert electrical estimator for Border States Electrical contractors. 

Based on this project description: "${description}"

IMPORTANT CONSTRAINTS:
1. You MUST ONLY use products from the following SKU list. DO NOT suggest any products not in this list.
2. DO NOT hallucinate or invent any product names, SKUs, or specifications.
3. Select appropriate products and quantities based on standard electrical practices for the described job.

AVAILABLE SKU LIST:
${skuList}

Generate a detailed electrical estimate with materials from the SKU list above.`,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            project_summary: { type: "string" },
            estimate_items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  SKU_ID: { type: "string" },
                  Product_Name: { type: "string" },
                  Category: { type: "string" },
                  Quantity: { type: "number" },
                  Reason_Notes: { type: "string" },
                  Confidence_Score: { type: "number" }
                },
                required: ["SKU_ID", "Product_Name", "Category", "Quantity", "Reason_Notes"]
              }
            }
          },
          required: ["project_summary", "estimate_items"]
        }
      });
      
      setEstimate(result);
    } catch (error) {
      console.error("Error generating estimate:", error);
      alert("Failed to generate estimate. Please try again.");
    }
    setLoading(false);
  };

  const handleSaveToQuoteList = async () => {
    if (!estimate) return;
    
    const newList = await QuoteList.create({
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

    await QuoteItem.bulkCreate(items);
    
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
            <Textarea
              placeholder="Describe the electrical project in detail... e.g., 'Install complete electrical system for a 2,000 sq ft commercial office including panels, circuits, lighting, outlets, and data cabling'"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="text-base"
            />
            <Button
              onClick={handleGenerate}
              disabled={!description || loading}
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
                    <div key={index} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white">
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