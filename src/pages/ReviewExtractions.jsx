import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MobileHeader from "@/components/mobile/MobileHeader";
import MobileSelect from "@/components/shared/MobileSelect";
import { 
  CheckCircle2,
  XCircle,
  Edit,
  Save,
  ExternalLink,
  ArrowLeft,
  Sparkles
} from "lucide-react";

const categoryOptions = [
  "wire_cable", "conduit", "boxes", "switches_outlets", "lighting",
  "panels", "breakers", "disconnects", "transformers", "motors",
  "safety", "tools", "other"
];

export default function ReviewExtractions() {
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const jobId = urlParams.get('jobId');
      
      if (!jobId) {
        navigate(createPageUrl("ExtractionDashboard"));
        return;
      }

      const jobsData = await base44.entities.ExtractionJob.list();
      const foundJob = jobsData.find(j => j.id === jobId);
      
      if (!foundJob) {
        navigate(createPageUrl("ExtractionDashboard"));
        return;
      }

      setJob(foundJob);

      const productsData = await base44.entities.ExtractedProduct.filter({
        extraction_job_id: jobId
      });
      setProducts(productsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setEditForm({ ...product });
  };

  const handleSave = async (productId) => {
    try {
      await base44.entities.ExtractedProduct.update(productId, editForm);
      setProducts(products.map(p => p.id === productId ? { ...p, ...editForm } : p));
      setEditingId(null);
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  const handleApprove = async (product) => {
    try {
      // Create CoreProduct
      await base44.entities.CoreProduct.create({
        manufacturer: product.manufacturer,
        mpn: product.mpn,
        product_category: product.product_category,
        amperage: product.amperage,
        poles: product.poles,
        voltage: product.voltage,
        material_type: product.material_type,
        application_type: product.application_type,
        compatibility_notes: product.compatibility_notes,
        description: product.description,
        specifications: product.specifications,
        unit: product.unit,
        image_url: product.image_url
      });

      // Update extracted product status
      await base44.entities.ExtractedProduct.update(product.id, {
        review_status: "approved",
        approved_to_coreproduct: true
      });

      setProducts(products.map(p => 
        p.id === product.id 
          ? { ...p, review_status: "approved", approved_to_coreproduct: true }
          : p
      ));
    } catch (error) {
      console.error("Error approving:", error);
      alert("Error approving product. It may already exist in the database.");
    }
  };

  const handleReject = async (productId) => {
    try {
      await base44.entities.ExtractedProduct.update(productId, {
        review_status: "rejected"
      });

      setProducts(products.map(p => 
        p.id === productId ? { ...p, review_status: "rejected" } : p
      ));
    } catch (error) {
      console.error("Error rejecting:", error);
    }
  };

  const handleApproveAll = async () => {
    const pendingProducts = products.filter(p => p.review_status === "pending_review");
    
    for (const product of pendingProducts) {
      await handleApprove(product);
    }
  };

  const pendingCount = products.filter(p => p.review_status === "pending_review").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading extracted products...</p>
        </div>
      </div>
    );
  }

  const categorySelectOptions = categoryOptions.map(cat => ({
    value: cat,
    label: cat.replace(/_/g, ' ')
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <MobileHeader title="Review Extractions" backUrl={createPageUrl("ExtractionDashboard")} />
      <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="hidden lg:flex items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              Review Extracted Products
            </h1>
            <p className="text-slate-600 mt-1">{job?.job_name}</p>
          </div>
          <div className="flex gap-3">
            {pendingCount > 0 && (
              <Button onClick={handleApproveAll} className="bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve All ({pendingCount})
              </Button>
            )}
            <Button onClick={() => navigate(createPageUrl("ExtractionDashboard"))} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
        {/* Mobile action bar */}
        <div className="flex lg:hidden items-center justify-between pt-2">
          <p className="text-sm text-slate-500">{job?.job_name}</p>
          {pendingCount > 0 && (
            <Button size="sm" onClick={handleApproveAll} className="bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Approve All ({pendingCount})
            </Button>
          )}
        </div>

        {products.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Sparkles className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No products extracted</h3>
              <p className="text-slate-600">This job didn't extract any products</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {products.map((product) => {
              const isEditing = editingId === product.id;
              const isApproved = product.approved_to_coreproduct;
              const isRejected = product.review_status === "rejected";

              return (
                <Card 
                  key={product.id}
                  className={`border-2 ${
                    isApproved ? 'border-green-300 bg-green-50' :
                    isRejected ? 'border-red-300 bg-red-50' :
                    'border-slate-200'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {isEditing ? (
                          <Input
                            value={editForm.manufacturer || ""}
                            onChange={(e) => setEditForm({ ...editForm, manufacturer: e.target.value })}
                            className="mb-2"
                            placeholder="Manufacturer"
                          />
                        ) : (
                          <CardTitle className="text-xl">{product.manufacturer || "Unknown"}</CardTitle>
                        )}
                        {isEditing ? (
                          <Input
                            value={editForm.mpn || ""}
                            onChange={(e) => setEditForm({ ...editForm, mpn: e.target.value })}
                            placeholder="Model/Part Number"
                          />
                        ) : (
                          <p className="text-sm text-slate-600 font-mono">MPN: {product.mpn || "N/A"}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {product.confidence_score && (
                          <Badge className="bg-blue-100 text-blue-700">
                            {product.confidence_score}% confidence
                          </Badge>
                        )}
                        {isApproved && (
                          <Badge className="bg-green-600 text-white">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Approved
                          </Badge>
                        )}
                        {isRejected && (
                          <Badge className="bg-red-600 text-white">
                            <XCircle className="w-3 h-3 mr-1" />
                            Rejected
                          </Badge>
                        )}
                        {product.source_url && product.source_url !== "text_input" && (
                          <a href={product.source_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Category</Label>
                        {isEditing ? (
                          <MobileSelect
                            value={editForm.product_category || ""}
                            onValueChange={(value) => setEditForm({ ...editForm, product_category: value })}
                            placeholder="Select category"
                            options={categorySelectOptions}
                          />
                        ) : (
                          <p className="font-medium">{product.product_category?.replace('_', ' ') || "N/A"}</p>
                        )}
                      </div>
                      <div>
                        <Label>Amperage</Label>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editForm.amperage || ""}
                            onChange={(e) => setEditForm({ ...editForm, amperage: parseFloat(e.target.value) })}
                          />
                        ) : (
                          <p className="font-medium">{product.amperage || "N/A"}</p>
                        )}
                      </div>
                      <div>
                        <Label>Voltage</Label>
                        {isEditing ? (
                          <Input
                            value={editForm.voltage || ""}
                            onChange={(e) => setEditForm({ ...editForm, voltage: e.target.value })}
                          />
                        ) : (
                          <p className="font-medium">{product.voltage || "N/A"}</p>
                        )}
                      </div>
                      <div>
                        <Label>Material Type</Label>
                        {isEditing ? (
                          <Input
                            value={editForm.material_type || ""}
                            onChange={(e) => setEditForm({ ...editForm, material_type: e.target.value })}
                          />
                        ) : (
                          <p className="font-medium">{product.material_type || "N/A"}</p>
                        )}
                      </div>
                    </div>

                    {(product.description || isEditing) && (
                      <div>
                        <Label>Description</Label>
                        {isEditing ? (
                          <Textarea
                            value={editForm.description || ""}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          />
                        ) : (
                          <p className="text-sm text-slate-600">{product.description}</p>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      {isEditing ? (
                        <>
                          <Button onClick={() => handleSave(product.id)} className="bg-green-600 hover:bg-green-700">
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button onClick={() => setEditingId(null)} variant="outline">
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          {!isApproved && !isRejected && (
                            <>
                              <Button onClick={() => handleApprove(product)} className="bg-green-600 hover:bg-green-700">
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                              <Button onClick={() => handleEdit(product)} variant="outline">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                              <Button onClick={() => handleReject(product.id)} variant="outline" className="text-red-600 hover:text-red-700">
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}