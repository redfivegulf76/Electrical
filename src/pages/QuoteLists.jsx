import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, FileText, DollarSign, Package, Trash2, Send } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PullToRefresh from "../components/mobile/PullToRefresh";

const statusColors = {
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  sent: "bg-blue-100 text-blue-700 border-blue-200",
  approved: "bg-green-100 text-green-700 border-green-200",
  ordered: "bg-purple-100 text-purple-700 border-purple-200"
};

const tierLimits = {
  Free: { maxLists: 3, maxItems: 20 },
  Pro: { maxLists: Infinity, maxItems: Infinity },
  Enterprise: { maxLists: Infinity, maxItems: Infinity }
};

export default function QuoteLists() {
  const [user, setUser] = useState(null);
  const [quoteLists, setQuoteLists] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [items, setItems] = useState([]);
  const [showNewList, setShowNewList] = useState(false);
  const [showNewItem, setShowNewItem] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
    
    const listsData = await base44.entities.QuoteList.list("-created_date");
    setQuoteLists(listsData);
    
    const projectsData = await base44.entities.Project.list("-created_date");
    setProjects(projectsData);
  };

  const loadItems = async (listId) => {
    const itemsData = await base44.entities.QuoteItem.filter({ quote_list_id: listId });
    setItems(itemsData);
  };

  const handleSelectList = (list) => {
    setSelectedList(list);
    loadItems(list.id);
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newList = await base44.entities.QuoteList.create({
      name: formData.get("name"),
      project_id: formData.get("project_id"),
      notes: formData.get("notes"),
      status: "draft"
    });
    setShowNewList(false);
    loadData();
    handleSelectList(newList);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await base44.entities.QuoteItem.create({
      quote_list_id: selectedList.id,
      product_name: formData.get("product_name"),
      quantity: parseFloat(formData.get("quantity")),
      unit_price: parseFloat(formData.get("unit_price")),
      unit: formData.get("unit") || "each"
    });
    setShowNewItem(false);
    loadItems(selectedList.id);
  };

  const handleDeleteItem = async (itemId) => {
    await base44.entities.QuoteItem.delete(itemId);
    loadItems(selectedList.id);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const canCreateList = () => {
    if (!user) return false;
    const limit = tierLimits[user.subscription_tier]?.maxLists ?? 3;
    return quoteLists.length < limit;
  };

  return (
    <PullToRefresh onRefresh={loadData}>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              Quote Lists
            </h1>
            <p className="text-slate-600 mt-2">Manage your material lists and quotes</p>
          </div>
          <Button
            onClick={() => setShowNewList(true)}
            disabled={!canCreateList()}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Quote List
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Lists Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Lists ({quoteLists.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
                <AnimatePresence>
                  {quoteLists.map((list) => (
                    <motion.div
                      key={list.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <button
                        onClick={() => handleSelectList(list)}
                        className={`w-full p-4 rounded-lg border transition-all text-left ${
                          selectedList?.id === list.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 truncate">{list.name}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {format(new Date(list.created_date), "MMM d, yyyy")}
                            </p>
                          </div>
                          <Badge className={`${statusColors[list.status]} border text-xs flex-shrink-0`}>
                            {list.status}
                          </Badge>
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {quoteLists.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-600">No quote lists yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {showNewList ? (
              <Card className="border-blue-200 shadow-lg">
                <CardHeader>
                  <CardTitle>Create New Quote List</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateList} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">List Name *</label>
                      <Input name="name" required placeholder="Main Street Project - Materials" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">Project</label>
                      <select
                        name="project_id"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a project...</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.project_name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">Notes</label>
                      <textarea
                        name="notes"
                        rows={3}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Additional notes..."
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setShowNewList(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        Create List
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : selectedList ? (
              <div className="space-y-6">
                {/* List Header */}
                <Card className="border-blue-200">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">{selectedList.name}</CardTitle>
                        <div className="flex items-center gap-3">
                          <Badge className={`${statusColors[selectedList.status]} border`}>
                            {selectedList.status}
                          </Badge>
                          <span className="text-sm text-slate-500">
                            {format(new Date(selectedList.created_date), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                      <Link to={createPageUrl("EmailSend") + `?list_id=${selectedList.id}`}>
                        <Button className="bg-green-600 hover:bg-green-700">
                          <Send className="w-4 h-4 mr-2" />
                          Send RFQ
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-slate-900">Total Estimate:</span>
                      </div>
                      <span className="text-2xl font-bold text-slate-900">
                        ${calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Items */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Items ({items.length})</CardTitle>
                      <Button
                        size="sm"
                        onClick={() => setShowNewItem(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {showNewItem && (
                      <Card className="mb-4 border-blue-200 bg-blue-50/50">
                        <CardContent className="p-4">
                          <form onSubmit={handleAddItem} className="space-y-3">
                            <div className="grid md:grid-cols-2 gap-3">
                              <Input name="product_name" required placeholder="Product name" />
                              <Input name="quantity" type="number" required placeholder="Quantity" step="any" />
                            </div>
                            <div className="grid md:grid-cols-2 gap-3">
                              <Input name="unit_price" type="number" required placeholder="Unit price" step="0.01" />
                              <Input name="unit" placeholder="Unit (e.g., each, ft, box)" defaultValue="each" />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button type="button" size="sm" variant="outline" onClick={() => setShowNewItem(false)}>
                                Cancel
                              </Button>
                              <Button type="submit" size="sm">Add Item</Button>
                            </div>
                          </form>
                        </CardContent>
                      </Card>
                    )}

                    <div className="space-y-2">
                      {items.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-4 border border-slate-200 rounded-lg bg-white hover:shadow-md transition-all"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-semibold text-slate-900">{item.product_name}</p>
                              <p className="text-sm text-slate-600 mt-1">
                                {item.quantity} {item.unit} × ${item.unit_price?.toFixed(2)}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-slate-900">
                                ${(item.quantity * item.unit_price).toFixed(2)}
                              </span>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {items.length === 0 && !showNewItem && (
                        <div className="text-center py-12">
                          <Package className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-600 mb-4">No items in this list yet</p>
                          <Button onClick={() => setShowNewItem(true)} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Add First Item
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50">
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Select a quote list</h3>
                  <p className="text-slate-600">Choose a list from the sidebar or create a new one</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
    </PullToRefresh>
  );
}