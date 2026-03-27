import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle, XCircle, AlertTriangle, Clock, Package,
  DollarSign, TrendingUp, Building2, Activity, RefreshCw
} from "lucide-react";

const statusColors = {
  pending_review: "bg-yellow-100 text-yellow-700 border-yellow-200",
  approved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  flagged_change: "bg-orange-100 text-orange-700 border-orange-200",
  needs_editing: "bg-blue-100 text-blue-700 border-blue-200"
};

export default function ManusAdminDashboard() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [supplierSuggestions, setSupplierSuggestions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
    await loadAll();
  };

  const loadAll = async () => {
    setLoading(true);
    const [p, pr, fb, ss, al] = await Promise.all([
      base44.entities.ExtractedProduct.filter({ review_status: "pending_review" }),
      base44.entities.RawPricingUpdate.list("-created_date", 50),
      base44.entities.EstimationFeedback.list("-created_date", 50),
      base44.entities.SupplierOptimizationSuggestion.list("-created_date", 50),
      base44.entities.ManusAuditLog.list("-created_date", 100)
    ]);
    setProducts(p);
    setPricing(pr);
    setFeedback(fb);
    setSupplierSuggestions(ss);
    setAuditLogs(al);
    setLoading(false);
  };

  const handlePublishProduct = async (id) => {
    setActionLoading(id);
    await base44.functions.invoke("publishProductToCore", { extracted_product_id: id });
    await loadAll();
    setActionLoading(null);
  };

  const handleRejectProduct = async (id) => {
    setActionLoading(id);
    await base44.entities.ExtractedProduct.update(id, { review_status: "rejected" });
    await base44.entities.ManusAuditLog.create({
      manus_job_id: "admin_action",
      action_type: "rejection",
      entity_type: "ExtractedProduct",
      entity_id: id,
      summary: "Product rejected by admin",
      details: {},
      performed_by: user?.email,
      timestamp: new Date().toISOString()
    });
    await loadAll();
    setActionLoading(null);
  };

  const handleApprovePricing = async (id) => {
    setActionLoading(id);
    await base44.functions.invoke("applyPricingUpdate", { pricing_update_id: id });
    await loadAll();
    setActionLoading(null);
  };

  const handleRejectItem = async (entity, id) => {
    setActionLoading(id);
    await base44.entities[entity].update(id, { review_status: "rejected" });
    await loadAll();
    setActionLoading(null);
  };

  const handleApproveFeedback = async (id) => {
    setActionLoading(id);
    await base44.entities.EstimationFeedback.update(id, { review_status: "approved" });
    await loadAll();
    setActionLoading(null);
  };

  const handleApproveSupplier = async (id) => {
    setActionLoading(id);
    await base44.entities.SupplierOptimizationSuggestion.update(id, { review_status: "approved" });
    await loadAll();
    setActionLoading(null);
  };

  const pendingProducts = products.filter(p => p.review_status === "pending_review");
  const pendingPricing = pricing.filter(p => p.review_status === "pending_review" || p.review_status === "flagged_change");
  const pendingFeedback = feedback.filter(f => f.review_status === "pending_review");
  const pendingSupplier = supplierSuggestions.filter(s => s.review_status === "pending_review");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Manus AI Admin Dashboard</h1>
            <p className="text-slate-500 mt-1">Review and approve all AI-generated data before it goes live</p>
          </div>
          <Button variant="outline" onClick={loadAll} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Products Pending", value: pendingProducts.length, icon: Package, color: "text-yellow-600", bg: "bg-yellow-50" },
            { label: "Pricing Updates", value: pendingPricing.length, icon: DollarSign, color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Estimation Feedback", value: pendingFeedback.length, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Supplier Suggestions", value: pendingSupplier.length, icon: Building2, color: "text-purple-600", bg: "bg-purple-50" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{value}</p>
                  <p className="text-sm text-slate-500">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="products">Products ({pendingProducts.length})</TabsTrigger>
            <TabsTrigger value="pricing">Pricing ({pendingPricing.length})</TabsTrigger>
            <TabsTrigger value="feedback">Estimator ({pendingFeedback.length})</TabsTrigger>
            <TabsTrigger value="supplier">Suppliers ({pendingSupplier.length})</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-3 mt-4">
            {pendingProducts.length === 0 ? (
              <EmptyState icon={Package} message="No products pending review" />
            ) : pendingProducts.map(item => (
              <ReviewCard
                key={item.id}
                title={`${item.manufacturer} — ${item.mpn}`}
                subtitle={item.description || "No description"}
                status={item.review_status}
                confidence={item.confidence_score}
                details={[
                  { label: "Category", value: item.product_category },
                  { label: "Voltage", value: item.voltage },
                  { label: "Amperage", value: item.amperage ? `${item.amperage}A` : null },
                  { label: "Source", value: item.source_url },
                ]}
                onApprove={() => handlePublishProduct(item.id)}
                onReject={() => handleRejectProduct(item.id)}
                loading={actionLoading === item.id}
              />
            ))}
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-3 mt-4">
            {pendingPricing.length === 0 ? (
              <EmptyState icon={DollarSign} message="No pricing updates pending" />
            ) : pendingPricing.map(item => (
              <ReviewCard
                key={item.id}
                title={`${item.product_identifier} @ ${item.supplier_name}`}
                subtitle={item.flag_reason ? `⚠️ Flagged: ${item.flag_reason.replace(/_/g, ' ')}` : "Standard update"}
                status={item.review_status}
                confidence={item.confidence_score}
                details={[
                  { label: "New Price", value: `$${item.new_price}` },
                  { label: "Currency", value: item.currency },
                  { label: "Availability", value: item.availability_status },
                  { label: "Checked", value: item.last_checked_date ? new Date(item.last_checked_date).toLocaleDateString() : null },
                ]}
                onApprove={() => handleApprovePricing(item.id)}
                onReject={() => handleRejectItem("RawPricingUpdate", item.id)}
                loading={actionLoading === item.id}
              />
            ))}
          </TabsContent>

          {/* Estimator Feedback Tab */}
          <TabsContent value="feedback" className="space-y-3 mt-4">
            {pendingFeedback.length === 0 ? (
              <EmptyState icon={TrendingUp} message="No estimation feedback pending" />
            ) : pendingFeedback.map(item => (
              <ReviewCard
                key={item.id}
                title={`${item.feedback_type?.replace(/_/g, ' ')}`}
                subtitle={item.analysis_summary}
                status={item.review_status}
                confidence={item.confidence_score}
                details={[
                  { label: "Suggestion", value: item.suggested_improvements },
                  { label: "Project ID", value: item.project_id },
                ]}
                onApprove={() => handleApproveFeedback(item.id)}
                onReject={() => handleRejectItem("EstimationFeedback", item.id)}
                loading={actionLoading === item.id}
              />
            ))}
          </TabsContent>

          {/* Supplier Suggestions Tab */}
          <TabsContent value="supplier" className="space-y-3 mt-4">
            {pendingSupplier.length === 0 ? (
              <EmptyState icon={Building2} message="No supplier suggestions pending" />
            ) : pendingSupplier.map(item => (
              <ReviewCard
                key={item.id}
                title={`${item.product_identifier}: Switch to ${item.suggested_supplier}`}
                subtitle={`Reason: ${item.reason?.replace(/_/g, ' ')}`}
                status={item.review_status}
                confidence={item.confidence_score}
                details={[
                  { label: "Current Supplier", value: item.current_supplier },
                  { label: "Current Price", value: item.current_price ? `$${item.current_price}` : null },
                  { label: "Suggested Price", value: item.suggested_price ? `$${item.suggested_price}` : null },
                  { label: "Savings", value: item.estimated_savings_percentage ? `${item.estimated_savings_percentage}%` : null },
                ]}
                onApprove={() => handleApproveSupplier(item.id)}
                onReject={() => handleRejectItem("SupplierOptimizationSuggestion", item.id)}
                loading={actionLoading === item.id}
              />
            ))}
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Audit Trail
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {auditLogs.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-8">No audit logs yet</p>
                  ) : auditLogs.map(log => (
                    <div key={log.id} className="flex items-start gap-3 p-3 border border-slate-100 rounded-lg text-sm">
                      <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                        log.action_type === "published" || log.action_type === "approval" ? "bg-green-500" :
                        log.action_type === "rejection" ? "bg-red-500" :
                        log.action_type === "flagged" ? "bg-orange-500" : "bg-blue-500"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800">{log.summary}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {log.performed_by} • {log.entity_type} • {log.timestamp ? new Date(log.timestamp).toLocaleString() : ""}
                        </p>
                      </div>
                      <Badge className={`text-xs flex-shrink-0 ${
                        log.action_type === "published" || log.action_type === "approval" ? "bg-green-50 text-green-700 border-green-200" :
                        log.action_type === "rejection" ? "bg-red-50 text-red-700 border-red-200" :
                        log.action_type === "flagged" ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                        {log.action_type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, message }) {
  return (
    <Card className="border-dashed border-2 border-slate-200">
      <CardContent className="py-12 text-center">
        <Icon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">{message}</p>
      </CardContent>
    </Card>
  );
}

function ReviewCard({ title, subtitle, status, confidence, details, onApprove, onReject, loading }) {
  return (
    <Card className="border border-slate-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <Badge className={`text-xs ${statusColors[status] || statusColors.pending_review}`}>
                {status?.replace(/_/g, ' ')}
              </Badge>
              {confidence != null && (
                <Badge className={`text-xs ${confidence >= 80 ? "bg-green-50 text-green-700" : confidence >= 60 ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"}`}>
                  {confidence}% confidence
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-600 mb-3">{subtitle}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1">
              {details.filter(d => d.value).map(d => (
                <div key={d.label}>
                  <span className="text-xs text-slate-400">{d.label}: </span>
                  <span className="text-xs text-slate-700 font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={onReject}
              disabled={loading}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={onApprove}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}