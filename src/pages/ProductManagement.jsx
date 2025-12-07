import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Product } from "@/entities/Product";
import { UploadFile } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, Edit, Trash2, Image as ImageIcon, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const categories = [
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

export default function ProductManagement() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userData = await User.me();
    setUser(userData);
    
    const productsData = await Product.list("-created_date");
    setProducts(productsData);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await UploadFile({ file });
      return result.file_url;
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const productData = {
      name: formData.get("name"),
      category: formData.get("category"),
      manufacturer: formData.get("manufacturer"),
      model_number: formData.get("model_number"),
      description: formData.get("description"),
      specifications: formData.get("specifications"),
      unit: formData.get("unit") || "each",
      image_url: formData.get("image_url")
    };

    if (editingProduct) {
      await Product.update(editingProduct.id, productData);
    } else {
      await Product.create(productData);
    }

    setShowForm(false);
    setEditingProduct(null);
    loadData();
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await Product.delete(productId);
      loadData();
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchQuery || 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              Product Management
            </h1>
            <p className="text-slate-600 mt-2">Manage your product catalog and images</p>
          </div>
          <Button
            onClick={() => {
              setEditingProduct(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
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

        {/* Product Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-blue-200 shadow-lg">
                <CardHeader>
                  <CardTitle>
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">Product Name *</label>
                        <Input
                          name="name"
                          required
                          defaultValue={editingProduct?.name}
                          placeholder="e.g., 12/2 NM-B Romex Cable"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">Category *</label>
                        <Select name="category" required defaultValue={editingProduct?.category}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
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
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">Manufacturer</label>
                        <Input
                          name="manufacturer"
                          defaultValue={editingProduct?.manufacturer}
                          placeholder="e.g., Southwire"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">Model Number</label>
                        <Input
                          name="model_number"
                          defaultValue={editingProduct?.model_number}
                          placeholder="e.g., 28827422"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">Description</label>
                      <Textarea
                        name="description"
                        rows={3}
                        defaultValue={editingProduct?.description}
                        placeholder="Product description..."
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">Specifications</label>
                      <Textarea
                        name="specifications"
                        rows={2}
                        defaultValue={editingProduct?.specifications}
                        placeholder="Technical specifications..."
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">Unit</label>
                      <Input
                        name="unit"
                        defaultValue={editingProduct?.unit || "each"}
                        placeholder="each, ft, box, etc."
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Product Image</label>
                      <div className="flex flex-col gap-3">
                        <Input
                          name="image_url"
                          defaultValue={editingProduct?.image_url}
                          placeholder="Image URL (optional)"
                        />
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-500">Or upload:</span>
                          <label className="cursor-pointer">
                            <div className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                              <Upload className="w-4 h-4 text-slate-600" />
                              <span className="text-sm text-slate-700">
                                {uploading ? "Uploading..." : "Choose File"}
                              </span>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const url = await handleImageUpload(e);
                                if (url) {
                                  document.querySelector('input[name="image_url"]').value = url;
                                }
                              }}
                              disabled={uploading}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowForm(false);
                          setEditingProduct(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        {editingProduct ? "Update Product" : "Add Product"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        <div>
          <p className="text-sm text-slate-500 mb-4">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-slate-200 group">
                  <CardHeader className="pb-3">
                    <div className="aspect-video bg-slate-100 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-16 h-16 text-slate-300" />
                      )}
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <CardTitle className="text-base font-bold text-slate-900 mb-2 line-clamp-2">
                          {product.name}
                        </CardTitle>
                        {product.category && (
                          <Badge className={`${categoryColors[product.category]} text-xs`}>
                            {product.category?.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {product.manufacturer && (
                      <p className="text-sm text-slate-600 font-medium">{product.manufacturer}</p>
                    )}
                    {product.model_number && (
                      <p className="text-xs text-slate-500 font-mono">Part #: {product.model_number}</p>
                    )}
                    {product.description && (
                      <p className="text-sm text-slate-600 line-clamp-2">{product.description}</p>
                    )}
                    <div className="flex gap-2 pt-3 border-t border-slate-100">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(product)}
                        className="flex-1"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50">
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No products found</h3>
                <p className="text-slate-600 mb-6">
                  {searchQuery || categoryFilter !== "all" 
                    ? "Try adjusting your filters" 
                    : "Add your first product to get started"}
                </p>
                {!searchQuery && categoryFilter === "all" && (
                  <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Product
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}