import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Link as LinkIcon, 
  Upload, 
  FileText, 
  Zap, 
  AlertCircle,
  Plus,
  X,
  Globe,
  File
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DataExtractor() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [jobName, setJobName] = useState("");
  const [extractionType, setExtractionType] = useState("products");
  const [inputType, setInputType] = useState("url");
  const [autoApprove, setAutoApprove] = useState(false);
  
  // URL inputs
  const [urls, setUrls] = useState([""]);
  
  // File uploads
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  // Text input
  const [textContent, setTextContent] = useState("");
  
  const [processing, setProcessing] = useState(false);

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

  const addUrlField = () => {
    setUrls([...urls, ""]);
  };

  const removeUrlField = (index) => {
    setUrls(urls.filter((_, i) => i !== index));
  };

  const updateUrl = (index, value) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        return { name: file.name, url: file_url };
      });
      
      const uploaded = await Promise.all(uploadPromises);
      setUploadedFiles([...uploadedFiles, ...uploaded]);
    } catch (error) {
      console.error("File upload error:", error);
      alert("Error uploading files");
    }
    setUploading(false);
  };

  const removeFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleStartExtraction = async () => {
    if (!hasAIAccess) return;
    if (!jobName.trim()) {
      alert("Please enter a job name");
      return;
    }

    let inputData = {};
    
    if (inputType === "url" || inputType === "bulk_urls") {
      const validUrls = urls.filter(url => url.trim());
      if (!validUrls.length) {
        alert("Please enter at least one URL");
        return;
      }
      inputData.urls = validUrls;
    } else if (inputType === "pdf" || inputType === "image") {
      if (!uploadedFiles.length) {
        alert("Please upload at least one file");
        return;
      }
      inputData.file_urls = uploadedFiles.map(f => f.url);
    } else if (inputType === "text") {
      if (!textContent.trim()) {
        alert("Please enter text content");
        return;
      }
      inputData.text_content = textContent;
    }

    setProcessing(true);
    try {
      // Create extraction job
      const job = await base44.entities.ExtractionJob.create({
        job_name: jobName,
        input_type: inputType,
        input_data: inputData,
        extraction_type: extractionType,
        status: "processing",
        settings: {
          auto_approve: autoApprove,
          target_database: "staging"
        }
      });

      // Log job start
      await base44.entities.ExtractionLog.create({
        extraction_job_id: job.id,
        log_level: "info",
        message: "Extraction job started",
        timestamp: new Date().toISOString()
      });

      // Process based on input type
      if (inputType === "url" || inputType === "bulk_urls") {
        await processUrls(job, inputData.urls);
      } else if (inputType === "pdf" || inputType === "image") {
        await processFiles(job, inputData.file_urls);
      } else if (inputType === "text") {
        await processText(job, inputData.text_content);
      }

      // Update job status
      await base44.entities.ExtractionJob.update(job.id, {
        status: autoApprove ? "completed" : "reviewing",
        progress_percentage: 100
      });

      await base44.entities.ExtractionLog.create({
        extraction_job_id: job.id,
        log_level: "success",
        message: "Extraction completed successfully",
        timestamp: new Date().toISOString()
      });

      navigate(createPageUrl("ExtractionDashboard"));
    } catch (error) {
      console.error("Extraction error:", error);
      alert("Error during extraction. Please try again.");
    }
    setProcessing(false);
  };

  const processUrls = async (job, urls) => {
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      
      try {
        // Fetch website content
        const websiteData = await base44.integrations.Core.InvokeLLM({
          prompt: `Fetch and analyze this URL: ${url}`,
          add_context_from_internet: true
        });

        // Extract product data
        const extractionResult = await base44.integrations.Core.InvokeLLM({
          prompt: `You are an expert electrical product data extractor. Analyze this content and extract structured product information.

Content from: ${url}

Extract all products found. For each product, provide:
- manufacturer: Manufacturer name
- mpn: Model/part number
- product_category: Category (wire_cable, conduit, boxes, switches_outlets, lighting, panels, breakers, disconnects, etc.)
- amperage: Amperage rating (if applicable)
- poles: Number of poles (if applicable)
- voltage: Voltage rating (if applicable)
- material_type: Material (copper, aluminum, steel, etc.)
- application_type: Application/environment (indoor, outdoor, hazardous, wet location, etc.)
- compatibility_notes: NEC compliance, compatibility notes
- description: Product description
- specifications: Technical specifications
- confidence_score: Your confidence in this extraction (0-100)

If this is a catalog page with multiple products, extract all of them. Be thorough and accurate.`,
          response_json_schema: {
            type: "object",
            properties: {
              products: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    manufacturer: { type: "string" },
                    mpn: { type: "string" },
                    product_category: { type: "string" },
                    amperage: { type: "number" },
                    poles: { type: "number" },
                    voltage: { type: "string" },
                    material_type: { type: "string" },
                    application_type: { type: "string" },
                    compatibility_notes: { type: "string" },
                    description: { type: "string" },
                    specifications: { type: "string" },
                    confidence_score: { type: "number" }
                  }
                }
              }
            }
          }
        });

        // Save extracted products
        const products = extractionResult.products || [];
        for (const product of products) {
          const extractedProduct = await base44.entities.ExtractedProduct.create({
            extraction_job_id: job.id,
            source_url: url,
            ...product,
            review_status: autoApprove ? "approved" : "pending_review",
            approved_to_coreproduct: false
          });

          // If auto-approve, create CoreProduct immediately
          if (autoApprove && product.manufacturer && product.mpn) {
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
              specifications: product.specifications
            });

            await base44.entities.ExtractedProduct.update(extractedProduct.id, {
              approved_to_coreproduct: true
            });
          }
        }

        // Update job progress
        await base44.entities.ExtractionJob.update(job.id, {
          products_extracted: products.length,
          progress_percentage: Math.round(((i + 1) / urls.length) * 100)
        });

        await base44.entities.ExtractionLog.create({
          extraction_job_id: job.id,
          log_level: "success",
          message: `Extracted ${products.length} products from ${url}`,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        await base44.entities.ExtractionLog.create({
          extraction_job_id: job.id,
          log_level: "error",
          message: `Failed to extract from ${url}: ${error.message}`,
          timestamp: new Date().toISOString()
        });
      }
    }
  };

  const processFiles = async (job, fileUrls) => {
    for (let i = 0; i < fileUrls.length; i++) {
      const fileUrl = fileUrls[i];
      
      try {
        // Extract data from file
        const extractionResult = await base44.integrations.Core.InvokeLLM({
          prompt: `You are an expert electrical product data extractor. Analyze this document and extract all product information.

Extract all products found. For each product, provide:
- manufacturer, mpn, product_category, amperage, poles, voltage, material_type, application_type
- compatibility_notes, description, specifications, confidence_score

Be thorough and extract all products from catalogs, spec sheets, or blueprints.`,
          file_urls: [fileUrl],
          response_json_schema: {
            type: "object",
            properties: {
              products: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    manufacturer: { type: "string" },
                    mpn: { type: "string" },
                    product_category: { type: "string" },
                    amperage: { type: "number" },
                    poles: { type: "number" },
                    voltage: { type: "string" },
                    material_type: { type: "string" },
                    application_type: { type: "string" },
                    compatibility_notes: { type: "string" },
                    description: { type: "string" },
                    specifications: { type: "string" },
                    confidence_score: { type: "number" }
                  }
                }
              }
            }
          }
        });

        const products = extractionResult.products || [];
        for (const product of products) {
          const extractedProduct = await base44.entities.ExtractedProduct.create({
            extraction_job_id: job.id,
            source_url: fileUrl,
            ...product,
            review_status: autoApprove ? "approved" : "pending_review",
            approved_to_coreproduct: false
          });

          if (autoApprove && product.manufacturer && product.mpn) {
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
              specifications: product.specifications
            });

            await base44.entities.ExtractedProduct.update(extractedProduct.id, {
              approved_to_coreproduct: true
            });
          }
        }

        await base44.entities.ExtractionJob.update(job.id, {
          products_extracted: products.length,
          progress_percentage: Math.round(((i + 1) / fileUrls.length) * 100)
        });
      } catch (error) {
        await base44.entities.ExtractionLog.create({
          extraction_job_id: job.id,
          log_level: "error",
          message: `Failed to extract from file: ${error.message}`,
          timestamp: new Date().toISOString()
        });
      }
    }
  };

  const processText = async (job, text) => {
    try {
      const extractionResult = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert electrical product data extractor. Analyze this text and extract product information:

${text}

Extract all products mentioned. For each product, provide complete structured data including manufacturer, mpn, category, specs, etc.`,
        response_json_schema: {
          type: "object",
          properties: {
            products: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  manufacturer: { type: "string" },
                  mpn: { type: "string" },
                  product_category: { type: "string" },
                  amperage: { type: "number" },
                  poles: { type: "number" },
                  voltage: { type: "string" },
                  material_type: { type: "string" },
                  application_type: { type: "string" },
                  compatibility_notes: { type: "string" },
                  description: { type: "string" },
                  specifications: { type: "string" },
                  confidence_score: { type: "number" }
                }
              }
            }
          }
        }
      });

      const products = extractionResult.products || [];
      for (const product of products) {
        await base44.entities.ExtractedProduct.create({
          extraction_job_id: job.id,
          source_url: "text_input",
          ...product,
          review_status: autoApprove ? "approved" : "pending_review"
        });
      }

      await base44.entities.ExtractionJob.update(job.id, {
        products_extracted: products.length,
        progress_percentage: 100
      });
    } catch (error) {
      await base44.entities.ExtractionLog.create({
        extraction_job_id: job.id,
        log_level: "error",
        message: `Failed to extract from text: ${error.message}`,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              AI Data Extraction Robot
            </h1>
            <p className="text-slate-600 mt-1">
              Automate product data extraction from websites, PDFs, and documents
            </p>
          </div>
        </div>

        {!hasAIAccess && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              AI data extraction requires a Pro or Enterprise subscription
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Extraction Job Settings</CardTitle>
            <CardDescription>Configure your data extraction job</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="jobName">Job Name *</Label>
              <Input
                id="jobName"
                placeholder="e.g., Square D Catalog Extraction"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                disabled={!hasAIAccess}
              />
            </div>

            <div>
              <Label htmlFor="extractionType">Extraction Type</Label>
              <Select value={extractionType} onValueChange={setExtractionType} disabled={!hasAIAccess}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="products">Products & Materials</SelectItem>
                  <SelectItem value="project_specs">Project Specifications</SelectItem>
                  <SelectItem value="blueprints">Blueprint Analysis</SelectItem>
                  <SelectItem value="catalog">Full Catalog Extraction</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoApprove">Auto-Approve to Database</Label>
                <p className="text-xs text-slate-500">Skip review and add directly to CoreProduct</p>
              </div>
              <Switch
                id="autoApprove"
                checked={autoApprove}
                onCheckedChange={setAutoApprove}
                disabled={!hasAIAccess}
              />
            </div>
          </CardContent>
        </Card>

        <Card className={`border-2 ${hasAIAccess ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-white' : 'border-slate-300'}`}>
          <CardHeader>
            <CardTitle>Input Source</CardTitle>
            <CardDescription>Choose how to provide data for extraction</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={inputType} onValueChange={setInputType}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="url" disabled={!hasAIAccess}>
                  <Globe className="w-4 h-4 mr-2" />
                  URLs
                </TabsTrigger>
                <TabsTrigger value="pdf" disabled={!hasAIAccess}>
                  <File className="w-4 h-4 mr-2" />
                  Files
                </TabsTrigger>
                <TabsTrigger value="text" disabled={!hasAIAccess}>
                  <FileText className="w-4 h-4 mr-2" />
                  Text
                </TabsTrigger>
              </TabsList>

              <TabsContent value="url" className="space-y-4 mt-6">
                <div className="space-y-3">
                  {urls.map((url, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="https://example.com/product-page"
                        value={url}
                        onChange={(e) => updateUrl(index, e.target.value)}
                        disabled={!hasAIAccess}
                      />
                      {urls.length > 1 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeUrlField(index)}
                          disabled={!hasAIAccess}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={addUrlField}
                  disabled={!hasAIAccess}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another URL
                </Button>
              </TabsContent>

              <TabsContent value="pdf" className="space-y-4 mt-6">
                <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-purple-500 mx-auto mb-3" />
                  <p className="text-sm text-slate-600 mb-4">
                    Upload PDFs, images, or catalog files
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="fileUpload"
                    disabled={!hasAIAccess || uploading}
                  />
                  <label htmlFor="fileUpload">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!hasAIAccess || uploading}
                      onClick={() => document.getElementById('fileUpload').click()}
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Files
                        </>
                      )}
                    </Button>
                  </label>
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white border border-purple-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <File className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium">{file.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="text" className="space-y-4 mt-6">
                <Textarea
                  placeholder="Paste catalog content, product descriptions, or specification sheets here..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="min-h-[300px]"
                  disabled={!hasAIAccess}
                />
              </TabsContent>
            </Tabs>

            <Button
              onClick={handleStartExtraction}
              disabled={!hasAIAccess || processing}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 h-12 text-lg mt-6"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                  AI Robot is extracting data...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Start Extraction
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}