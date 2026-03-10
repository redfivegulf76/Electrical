import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, Package, Filter, Plus, Database, Image as ImageIcon, Wrench, Calculator, Bot, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useAISearchLimit } from "../components/shared/useAISearchLimit";
import ReactMarkdown from "react-markdown";

const categories = [
  { value: "all", label: "All Categories" },
  { value: "wire_cable", label: "Wire & Cable" },
  { value: "conduit", label: "Conduit" },
  { value: "boxes", label: "Boxes" },
  { value: "switches_outlets", label: "Switches & Outlets" },
  { value: "lighting", label: "Lighting" },
  { value: "panels", label: "Panels" },
  { value: "breakers", label: "Breakers" },
  { value: "tools", label: "Tools" },
  { value: "safety", label: "Safety Equipment" },
  { value: "other", label: "Other" }
];

const categoryColors = {
  wire_cable: "bg-blue-100 text-blue-700",
  conduit: "bg-purple-100 text-purple-700",
  boxes: "bg-green-100 text-green-700",
  switches_outlets: "bg-amber-100 text-amber-700",
  lighting: "bg-yellow-100 text-yellow-700",
  panels: "bg-red-100 text-red-700",
  breakers: "bg-indigo-100 text-indigo-700",
  tools: "bg-pink-100 text-pink-700",
  safety: "bg-orange-100 text-orange-700",
  other: "bg-slate-100 text-slate-700"
};

export default function ProductSearch() {
  const [user, setUser] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [searchSource, setSearchSource] = useState("catalog");
  const [generatedMaterialList, setGeneratedMaterialList] = useState(null);
  const [aiResults, setAiResults] = useState([]);
  const [aiSummary, setAiSummary] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      const productsData = await base44.entities.Product.list("-created_date");
      setAllProducts(productsData);
      setDisplayedProducts(productsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const isFreeUser = !user?.subscription_tier || user?.subscription_tier === "Free";
  const { canSearch, searchesRemaining, loaded: limitLoaded, incrementSearch } = useAISearchLimit(user);

  const handleAISearch = async () => {
    if (!canSearch) return;

    setAiLoading(true);
    setSearchSource("agent");
    setGeneratedMaterialList(null);
    setDisplayedProducts([]);

    try {
      await incrementSearch();

      // Create or reuse conversation
      let conversation = agentConversation;
      if (!conversation) {
        conversation = await base44.agents.createConversation({
          agent_name: "product_search",
          metadata: { name: "Product Search" }
        });
        setAgentConversation(conversation);

        // Subscribe to updates
        base44.agents.subscribeToConversation(conversation.id, (data) => {
          setAgentMessages([...data.messages]);
        });
      }

      await base44.agents.addMessage(conversation, {
        role: "user",
        content: aiQuery
      });

    } catch (error) {
      console.error("AI search error:", error);
    }
    setAiLoading(false);
  };

  const filteredProducts = displayedProducts.filter(p => {
    const matchesSearch = !searchQuery ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.model_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === "all" || p.category === category;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            Product Search
          </h1>
          <p className="text-slate-600 mt-2">Find electrical materials and supplies</p>
        </div>

        {/* AI Search Section - available to all users */}
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-600" />
              <CardTitle className="text-blue-900">AI-Powered Search</CardTitle>
              {!isFreeUser && (
                <Badge className="bg-blue-600 text-white">Pro Feature</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isFreeUser && (
                <div className={`text-sm px-3 py-2 rounded-lg border ${!canSearch ? 'bg-red-50 border-red-200 text-red-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                  {!canSearch
                    ? "You've used all 20 AI searches for this week. Upgrade to Pro for unlimited searches."
                    : `${searchesRemaining} of 20 free AI searches remaining this week`}
                </div>
              )}
              <Input
                placeholder="Describe what you're looking for... e.g., 'explosion-proof lighting for chemical plant' or '200 amp panel for commercial building'"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAISearch()}
                className="text-lg"
              />
              <Button
                onClick={handleAISearch}
                disabled={!aiQuery || aiLoading || (limitLoaded && !canSearch)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {aiLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    AI is searching your catalog...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Search with AI
                  </>
                )}
              </Button>
              {agentMessages.length > 0 && (
                <div className="mt-2 space-y-3 max-h-96 overflow-y-auto">
                  {agentMessages.filter(m => m.role === "assistant" && m.content).map((msg, i) => (
                    <div key={i} className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-slate-700 prose prose-sm max-w-none">
                      <div className="flex items-center gap-2 mb-2 text-blue-700 font-semibold text-xs">
                        <Bot className="w-3.5 h-3.5" />
                        AI Agent Response
                      </div>
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="flex items-center gap-2 text-sm text-slate-500 p-3">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Agent is searching your catalog...
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Traditional Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search by product name, description, manufacturer, or part number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full md:w-64">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Material List Results */}
        {generatedMaterialList && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-slate-900">Generated Material List</h2>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setGeneratedMaterialList(null);
                  setSearchSource("catalog");
                }}
              >
                Back to Search
              </Button>
            </div>

            {generatedMaterialList.map((list, listIdx) => (
              <Card key={listIdx} className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl text-purple-900">{list.template_name}</CardTitle>
                      <p className="text-sm text-slate-600 mt-1">
                        Quantity: {list.quantity} {list.construction_unit}(s) • Estimated Labor: {list.labor_hours.toFixed(1)} hours
                      </p>
                    </div>
                    <Badge className="bg-purple-600 text-white">
                      <Wrench className="w-3 h-3 mr-1" />
                      {list.items.length} Items
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {list.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="flex items-center justify-between p-4 bg-white border border-purple-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{item.product_name}</p>
                          <p className="text-sm text-slate-600">
                            {item.quantity_multiplier} {item.unit} per {list.construction_unit} × {list.quantity} = {item.total_quantity} {item.unit}
                          </p>
                          {item.notes && <p className="text-xs text-slate-500 mt-1">{item.notes}</p>}
                        </div>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                          <Plus className="w-4 h-4 mr-1" />
                          Add to Quote
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results */}
        {!generatedMaterialList && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {filteredProducts.length} Product{filteredProducts.length !== 1 ? 's' : ''} Found
              </h2>
              {displayedProducts.length > 0 && (
                <p className="text-sm text-slate-500">
                  Showing {filteredProducts.length} of {displayedProducts.length} total products
                </p>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50">
                <CardContent className="p-12 text-center">
                  <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {allProducts.length === 0 ? "No products in database" : "No products match your search"}
                  </h3>
                  <p className="text-slate-600 mb-4">
                    {allProducts.length === 0
                      ? "Start by using AI search to find products, or add products manually via Product Management"
                      : "Try adjusting your search terms or category filter"}
                  </p>
                  {allProducts.length === 0 && (
                    <p className="text-sm text-blue-600">
                      💡 Tip: Use the AI-Powered Search above to find products in your catalog or get AI suggestions
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`h-full hover:shadow-xl transition-all duration-300 ${product.isAISuggestion ? 'border-2 border-blue-300 bg-blue-50/30' : 'border-slate-200'}`}>
                      <CardHeader className="pb-3">
                        <div className="aspect-video bg-slate-100 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-16 h-16 text-slate-300" />
                          )}
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                              {product.name}
                            </CardTitle>
                            <div className="space-y-2">
                              {product.category && (
                                <Badge className={`${categoryColors[product.category]} font-medium`}>
                                  {product.category?.replace('_', ' ')}
                                </Badge>
                              )}
                              {product.isAISuggestion && (
                                <Badge className="bg-blue-600 text-white ml-2">AI Suggestion</Badge>
                              )}
                              {product.model_number && (
                                <p className="text-xs text-slate-500 font-mono mt-2">Part #: {product.model_number}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {product.manufacturer && (
                          <p className="text-sm text-slate-600 font-medium">{product.manufacturer}</p>
                        )}
                        {product.description && (
                          <p className="text-sm text-slate-600 line-clamp-3">{product.description}</p>
                        )}
                        {product.specifications && (
                          <p className="text-xs text-slate-500 line-clamp-2">{product.specifications}</p>
                        )}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-1" />
                            Add to Quote
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}