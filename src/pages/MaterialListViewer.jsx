import React, { useState, useEffect } from "react";
import MobileHeader from "@/components/mobile/MobileHeader";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileDown, 
  RefreshCw, 
  DollarSign, 
  Clock, 
  Package,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const categoryColors = {
  wire_cable: "bg-blue-100 text-blue-700",
  conduit: "bg-purple-100 text-purple-700",
  boxes: "bg-green-100 text-green-700",
  switches_outlets: "bg-amber-100 text-amber-700",
  lighting: "bg-yellow-100 text-yellow-700",
  panels: "bg-red-100 text-red-700",
  breakers: "bg-indigo-100 text-indigo-700",
  disconnects: "bg-pink-100 text-pink-700",
  safety: "bg-orange-100 text-orange-700",
  other: "bg-slate-100 text-slate-700"
};

export default function MaterialListViewer() {
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [supplierMappings, setSupplierMappings] = useState([]);
  const [showSupplierLayer, setShowSupplierLayer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);

  useEffect(() => {
    loadProjectData();
  }, []);

  const loadProjectData = async () => {
    setLoading(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const projectId = urlParams.get('projectId');
      
      if (!projectId) {
        navigate(createPageUrl("Dashboard"));
        return;
      }

      const projectData = await base44.entities.Project.list();
      const foundProject = projectData.find(p => p.id === projectId);
      
      if (!foundProject) {
        navigate(createPageUrl("Dashboard"));
        return;
      }

      setProject(foundProject);

      const materialsData = await base44.entities.MaterialListItem.filter({
        project_id: projectId
      });
      setMaterials(materialsData);
    } catch (error) {
      console.error("Error loading project data:", error);
    }
    setLoading(false);
  };

  const loadSupplierMappings = async () => {
    if (!materials.length) return;
    
    setLoadingSuppliers(true);
    try {
      // For each material, try to find supplier mappings
      const mappingPromises = materials.map(async (material) => {
        if (!material.product_id) return null;
        
        try {
          const mappings = await base44.entities.SupplierMapping.filter({
            product_id: material.product_id
          });
          return { materialId: material.id, mappings };
        } catch {
          return null;
        }
      });

      const results = await Promise.all(mappingPromises);
      const validMappings = results.filter(r => r !== null);
      setSupplierMappings(validMappings);
    } catch (error) {
      console.error("Error loading supplier mappings:", error);
    }
    setLoadingSuppliers(false);
  };

  useEffect(() => {
    if (showSupplierLayer && materials.length > 0) {
      loadSupplierMappings();
    }
  }, [showSupplierLayer, materials]);

  const handleExportCSV = () => {
    const headers = ["Product", "Manufacturer", "MPN", "Quantity", "Unit", "Labor Hours", "Notes"];
    const rows = materials.map(m => [
      m.product_name,
      m.manufacturer || "",
      m.mpn || "",
      m.quantity,
      m.unit,
      m.labor_hours || 0,
      m.notes || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project?.project_name || "material-list"}.csv`;
    a.click();
  };

  const totalLaborHours = materials.reduce((sum, m) => sum + (m.labor_hours || 0), 0);
  const totalItems = materials.length;
  const totalQuantity = materials.reduce((sum, m) => sum + (m.quantity || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading project data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <MobileHeader title={project?.project_name || "Material List"} backUrl={createPageUrl("Dashboard")} />
      <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header - desktop only */}
        <div className="hidden lg:flex items-start justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              {project?.project_name}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              {project?.client_name && (
                <p className="text-slate-600">Client: {project.client_name}</p>
              )}
              {project?.location && (
                <p className="text-slate-600">• {project.location}</p>
              )}
              <Badge className="bg-green-600 text-white">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {project?.status?.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          <Button onClick={() => navigate(createPageUrl("Dashboard"))} variant="outline">
            ← Back to Dashboard
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Items</p>
                  <p className="text-2xl font-bold text-slate-900">{totalItems}</p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Quantity</p>
                  <p className="text-2xl font-bold text-slate-900">{totalQuantity}</p>
                </div>
                <Package className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Labor Hours</p>
                  <p className="text-2xl font-bold text-slate-900">{totalLaborHours.toFixed(1)}</p>
                </div>
                <Clock className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Est. Labor Cost</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${(totalLaborHours * 75).toFixed(0)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Parsed Specs */}
        {project?.parsed_specs && (
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader>
              <CardTitle>AI-Parsed Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {project.parsed_specs.service_size && (
                  <div>
                    <p className="text-sm text-slate-600">Service Size</p>
                    <p className="font-semibold text-slate-900">{project.parsed_specs.service_size}</p>
                  </div>
                )}
                {project.parsed_specs.panel_spaces && (
                  <div>
                    <p className="text-sm text-slate-600">Panel Spaces</p>
                    <p className="font-semibold text-slate-900">{project.parsed_specs.panel_spaces}</p>
                  </div>
                )}
                {project.parsed_specs.wire_type && (
                  <div>
                    <p className="text-sm text-slate-600">Wire Type</p>
                    <p className="font-semibold text-slate-900">{project.parsed_specs.wire_type}</p>
                  </div>
                )}
                {project.parsed_specs.environment && (
                  <div>
                    <p className="text-sm text-slate-600">Environment</p>
                    <p className="font-semibold text-slate-900">{project.parsed_specs.environment}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="supplier-layer"
                    checked={showSupplierLayer}
                    onCheckedChange={setShowSupplierLayer}
                  />
                  <Label htmlFor="supplier-layer">Show Supplier Pricing</Label>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleExportCSV}>
                  <FileDown className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline">
                  <FileDown className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>
                <Button className="bg-green-600 hover:bg-green-700">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve & Order
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Material List */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Material List</CardTitle>
            <CardDescription>
              AI-generated materials based on project specifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {materials.map((material, index) => (
                <div
                  key={material.id}
                  className="flex items-start justify-between p-4 bg-white border-2 border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-slate-900">{material.product_name}</h3>
                      {material.category && (
                        <Badge className={categoryColors[material.category]}>
                          {material.category.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      {material.manufacturer && (
                        <div>
                          <span className="text-slate-600">Manufacturer:</span>
                          <span className="ml-1 font-medium">{material.manufacturer}</span>
                        </div>
                      )}
                      {material.mpn && (
                        <div>
                          <span className="text-slate-600">MPN:</span>
                          <span className="ml-1 font-mono font-medium">{material.mpn}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-600">Quantity:</span>
                        <span className="ml-1 font-bold text-blue-600">
                          {material.quantity} {material.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600">Labor:</span>
                        <span className="ml-1 font-medium">{material.labor_hours || 0} hrs</span>
                      </div>
                    </div>
                    {material.notes && (
                      <p className="text-xs text-slate-500 mt-2 italic">{material.notes}</p>
                    )}
                    
                    {showSupplierLayer && material.optional_supplier_mappings?.length > 0 && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-xs font-semibold text-green-800 mb-2">Available from Suppliers:</p>
                        <div className="space-y-1">
                          {material.optional_supplier_mappings.map((mapping, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="font-medium">{mapping.supplier_name}</span>
                              <span className="text-slate-600">SKU: {mapping.supplier_sku}</span>
                              {mapping.price && (
                                <span className="font-bold text-green-700">${mapping.price}</span>
                              )}
                              {mapping.availability && (
                                <Badge className="bg-green-600 text-white text-xs">
                                  {mapping.availability}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {materials.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No materials generated yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}