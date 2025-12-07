import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Template } from "@/entities/Template";
import { TemplateItem } from "@/entities/TemplateItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Layers } from "lucide-react";
import { motion } from "framer-motion";

import UpgradePrompt from "../components/shared/UpgradePrompt";

const categoryColors = {
  residential: "bg-blue-100 text-blue-700",
  commercial: "bg-purple-100 text-purple-700",
  industrial: "bg-red-100 text-red-700",
  service_upgrade: "bg-green-100 text-green-700",
  lighting: "bg-yellow-100 text-yellow-700",
  custom: "bg-slate-100 text-slate-700"
};

export default function Templates() {
  const [user, setUser] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userData = await User.me();
    setUser(userData);
    
    const templatesData = await Template.list("-created_date");
    setTemplates(templatesData);
  };

  const loadItems = async (templateId) => {
    const itemsData = await TemplateItem.filter({ template_id: templateId });
    setItems(itemsData);
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    loadItems(template.id);
  };

  const hasAccess = user?.subscription_tier === "Pro" || user?.subscription_tier === "Enterprise";

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              Templates & Kits
            </h1>
            <p className="text-slate-600 mt-2">Pre-built material lists for common installations</p>
          </div>

          <UpgradePrompt
            feature="Templates & Kits"
            requiredTier="Pro"
            message="Upgrade to Pro to create and use pre-built material templates for faster quoting"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              Templates & Kits
            </h1>
            <p className="text-slate-600 mt-2">Pre-built material lists for common installations</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="h-full hover:shadow-xl transition-all duration-300 border-slate-200 cursor-pointer"
                onClick={() => handleSelectTemplate(template)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-slate-900 mb-2">
                        {template.name}
                      </CardTitle>
                      <Badge className={`${categoryColors[template.category]} font-medium`}>
                        {template.category?.replace('_', ' ')}
                      </Badge>
                    </div>
                    <Layers className="w-8 h-8 text-blue-500 flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent>
                  {template.description && (
                    <p className="text-sm text-slate-600 line-clamp-3">{template.description}</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {templates.length === 0 && (
            <Card className="md:col-span-2 lg:col-span-3 border-2 border-dashed border-slate-200 bg-slate-50/50">
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No templates yet</h3>
                <p className="text-slate-600 mb-6">Create your first template to speed up quoting</p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Template
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}