import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Package,
  FileText
} from "lucide-react";
import { motion } from "framer-motion";

const statusConfig = {
  pending: { color: "bg-yellow-100 text-yellow-700", icon: Clock },
  processing: { color: "bg-blue-100 text-blue-700", icon: TrendingUp },
  completed: { color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  failed: { color: "bg-red-100 text-red-700", icon: XCircle },
  reviewing: { color: "bg-purple-100 text-purple-700", icon: Eye }
};

export default function ExtractionDashboard() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalExtracted: 0,
    pendingReview: 0,
    approved: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const jobsData = await base44.entities.ExtractionJob.list("-created_date");
      setJobs(jobsData);

      const extractedProducts = await base44.entities.ExtractedProduct.list();
      
      setStats({
        totalJobs: jobsData.length,
        totalExtracted: extractedProducts.length,
        pendingReview: extractedProducts.filter(p => p.review_status === "pending_review").length,
        approved: extractedProducts.filter(p => p.approved_to_coreproduct).length
      });
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading extraction jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                Extraction Dashboard
              </h1>
              <p className="text-slate-600 mt-1">Monitor and manage AI extraction jobs</p>
            </div>
          </div>
          <Link to={createPageUrl("DataExtractor")}>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Bot className="w-4 h-4 mr-2" />
              New Extraction
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Jobs</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalJobs}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Products Extracted</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalExtracted}</p>
                </div>
                <Package className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending Review</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.pendingReview}</p>
                </div>
                <Eye className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Approved</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.approved}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Jobs List */}
        <Card>
          <CardHeader>
            <CardTitle>Extraction Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No extraction jobs yet</h3>
                <p className="text-slate-600 mb-6">
                  Start your first AI extraction to populate your product database
                </p>
                <Link to={createPageUrl("DataExtractor")}>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Bot className="w-4 h-4 mr-2" />
                    Create First Job
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job, index) => {
                  const statusInfo = statusConfig[job.status];
                  const StatusIcon = statusInfo.icon;

                  return (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow border-2 border-slate-200">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-slate-900 text-lg">{job.job_name}</h3>
                                <Badge className={statusInfo.color}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {job.status}
                                </Badge>
                              </div>
                              <div className="grid md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-slate-600">Type:</span>
                                  <span className="ml-2 font-medium capitalize">
                                    {job.extraction_type?.replace('_', ' ')}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-600">Input:</span>
                                  <span className="ml-2 font-medium capitalize">
                                    {job.input_type?.replace('_', ' ')}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-600">Products:</span>
                                  <span className="ml-2 font-bold text-purple-600">
                                    {job.products_extracted || 0}
                                  </span>
                                </div>
                              </div>
                              {job.status === "processing" && (
                                <div className="mt-3">
                                  <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-slate-600">Progress</span>
                                    <span className="font-medium">{job.progress_percentage || 0}%</span>
                                  </div>
                                  <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div
                                      className="bg-purple-600 h-2 rounded-full transition-all"
                                      style={{ width: `${job.progress_percentage || 0}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                              {job.error_message && (
                                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                                  {job.error_message}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 ml-4">
                              {(job.status === "reviewing" || job.status === "completed") && (
                                <Link to={createPageUrl(`ReviewExtractions?jobId=${job.id}`)}>
                                  <Button size="sm" variant="outline">
                                    <Eye className="w-4 h-4 mr-1" />
                                    Review
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}