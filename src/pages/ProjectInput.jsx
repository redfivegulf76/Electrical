import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Sparkles, Upload, FileText, Zap, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ProjectInput() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [location, setLocation] = useState("");
  const [inputText, setInputText] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const hasAIAccess = user?.subscription_tier === "Pro" || user?.subscription_tier === "Enterprise";

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFile({ name: file.name, url: file_url });
      
      // Extract text from PDF or image
      const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            text_content: { type: "string" }
          }
        }
      });
      
      if (extractResult.status === "success" && extractResult.output?.text_content) {
        setInputText(extractResult.output.text_content);
      }
    } catch (error) {
      console.error("File upload error:", error);
    }
    setLoading(false);
  };

  const handleParseAndGenerate = async () => {
    if (!hasAIAccess) return;
    if (!inputText.trim()) {
      alert("Please enter a project description or upload a file");
      return;
    }

    setParsing(true);
    try {
      // Step 1: Parse the input text to extract specs
      const parseResult = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert electrical estimator. Analyze this project description and extract structured specifications following NEC code requirements.

Project Description:
${inputText}

Extract and structure the following information:
- Service size (amperage)
- Panel spaces needed
- Wire/conductor types and sizes
- Breaker types and quantities
- Disconnects required
- Environment/application type (indoor, outdoor, wet location, hazardous)
- NEC code requirements that apply
- Any special compatibility notes

Be thorough and apply electrical code knowledge. If information is missing, make reasonable professional assumptions based on typical installations.`,
        response_json_schema: {
          type: "object",
          properties: {
            service_size: { type: "string" },
            panel_spaces: { type: "number" },
            wire_type: { type: "string" },
            breaker_types: {
              type: "array",
              items: { type: "string" }
            },
            disconnects: {
              type: "array",
              items: { type: "string" }
            },
            environment: { type: "string" },
            nec_requirements: { type: "string" },
            additional_notes: { type: "string" }
          }
        }
      });

      // Step 2: Create the project with parsed specs
      const project = await base44.entities.Project.create({
        project_name: projectName || "Untitled Project",
        client_name: clientName,
        location: location,
        input_text: inputText,
        parsed_specs: parseResult,
        status: "parsed"
      });

      // Step 3: Generate material list based on parsed specs
      const materialsResult = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert electrical estimator. Based on these parsed specifications, generate a detailed material list with quantities and labor hours.

Parsed Specifications:
${JSON.stringify(parseResult, null, 2)}

For each material item, provide:
- Product name (be specific with sizes, ratings)
- Manufacturer (use common brands like Square D, Eaton, Southwire)
- MPN (realistic part numbers)
- Category (wire_cable, conduit, boxes, breakers, panels, etc.)
- Quantity needed
- Unit (each, ft, box, etc.)
- Labor hours (realistic installation time)
- Notes (installation requirements, code compliance)

Include all necessary materials: panels, breakers, wire, conduit, boxes, connectors, grounding, etc.`,
        response_json_schema: {
          type: "object",
          properties: {
            materials: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  product_name: { type: "string" },
                  manufacturer: { type: "string" },
                  mpn: { type: "string" },
                  category: { type: "string" },
                  quantity: { type: "number" },
                  unit: { type: "string" },
                  labor_hours: { type: "number" },
                  notes: { type: "string" }
                }
              }
            },
            total_labor_hours: { type: "number" }
          }
        }
      });

      // Step 4: Create material list items
      const materialPromises = materialsResult.materials?.map(material =>
        base44.entities.MaterialListItem.create({
          project_id: project.id,
          product_name: material.product_name,
          manufacturer: material.manufacturer,
          mpn: material.mpn,
          quantity: material.quantity,
          unit: material.unit || "each",
          labor_hours: material.labor_hours,
          notes: material.notes,
          category: material.category
        })
      ) || [];

      await Promise.all(materialPromises);

      // Update project with total labor hours and status
      await base44.entities.Project.update(project.id, {
        total_labor_hours: materialsResult.total_labor_hours,
        status: "materials_generated"
      });

      // Navigate to the material list viewer
      navigate(createPageUrl(`MaterialListViewer?projectId=${project.id}`));
    } catch (error) {
      console.error("Parse and generate error:", error);
      alert("Error generating material list. Please try again.");
    }
    setParsing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            New Project
          </h1>
          <p className="text-slate-600 mt-2">
            Describe your electrical project in plain English or upload plans
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>Basic information about the project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                placeholder="e.g., Office Building Electrical Upgrade"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  placeholder="Client or company name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Project address or site"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-2 ${hasAIAccess ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-white' : 'border-slate-300'}`}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className={hasAIAccess ? "w-6 h-6 text-blue-600" : "w-6 h-6 text-slate-400"} />
              <CardTitle>AI-Powered Project Description</CardTitle>
            </div>
            <CardDescription>
              Describe your project scope, paste plan notes, or upload blueprints
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!hasAIAccess && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  AI parsing and material generation requires a Pro or Enterprise subscription
                </AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="inputText">Project Description *</Label>
              <Textarea
                id="inputText"
                placeholder="Example: Install 200A service upgrade with 40-circuit panel. Run 50 feet of 4/0 copper from meter to panel. Include 10x 20A circuits, 5x 15A circuits, and GFCI protection for kitchen and bathrooms. Outdoor installation with weatherproof enclosures."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[200px]"
                disabled={!hasAIAccess}
              />
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-sm text-slate-600 mb-3">
                Upload PDF plans or blueprint images
              </p>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
                className="hidden"
                id="fileUpload"
                disabled={!hasAIAccess || loading}
              />
              <label htmlFor="fileUpload">
                <Button
                  type="button"
                  variant="outline"
                  disabled={!hasAIAccess || loading}
                  onClick={() => document.getElementById('fileUpload').click()}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Choose File
                    </>
                  )}
                </Button>
              </label>
              {uploadedFile && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ Uploaded: {uploadedFile.name}
                </p>
              )}
            </div>

            <Button
              onClick={handleParseAndGenerate}
              disabled={!hasAIAccess || !inputText.trim() || parsing}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-12 text-lg"
            >
              {parsing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                  AI is analyzing your project...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Parse & Generate Material List
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}