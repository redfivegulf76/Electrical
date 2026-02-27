import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Project } from "@/entities/Project";
import { QuoteList } from "@/entities/QuoteList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FolderOpen, FileText, DollarSign, Calendar, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { motion } from "framer-motion";

import StatCard from "../components/shared/StatCard";
import PullToRefresh from "../components/mobile/PullToRefresh";
import TierBadge from "../components/shared/TierBadge";
import OnboardingModal from "../components/onboarding/OnboardingModal";
import { useOnboarding } from "../components/onboarding/useOnboarding";

const tierLimits = {
  Free: { maxProjects: 3 },
  Pro: { maxProjects: Infinity },
  Enterprise: { maxProjects: Infinity }
};

const statusColors = {
  planning: "bg-cyan-50 text-cyan-700 border-2 border-cyan-200",
  in_progress: "bg-orange-50 text-orange-700 border-2 border-orange-200",
  completed: "bg-green-50 text-green-700 border-2 border-green-200",
  archived: "bg-slate-100 text-slate-700 border-2 border-slate-300"
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [quoteLists, setQuoteLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewProject, setShowNewProject] = useState(false);

  const { showOnboarding, onboardingRecord, completeOnboarding } = useOnboarding(user);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const userData = await User.me();
    setUser(userData);
    
    const projectsData = await Project.list("-created_date");
    setProjects(projectsData);
    
    const quoteListsData = await QuoteList.list("-created_date", 10);
    setQuoteLists(quoteListsData);
    
    setLoading(false);
  };

  const canCreateProject = () => {
    if (!user || !user.subscription_tier) return false;
    const limit = tierLimits[user.subscription_tier]?.maxProjects;
    if (limit === undefined) {
      return false;
    }
    return projects.length < limit;
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await Project.create({
      name: formData.get("name"),
      description: formData.get("description"),
      client_name: formData.get("client_name"),
      location: formData.get("location"),
      status: "planning"
    });
    setShowNewProject(false);
    loadData();
  };

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>;
  }

  return (
    <PullToRefresh onRefresh={loadData}>
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      {showOnboarding && (
        <OnboardingModal
          onComplete={completeOnboarding}
          onboardingRecord={onboardingRecord}
        />
      )}
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            {user?.profile_picture_url && (
              <img
                src={user.profile_picture_url}
                alt={user.full_name}
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
              />
            )}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[#263238] tracking-tight">
                Welcome back, {user?.full_name?.split(' ')[0] || 'there'}
              </h1>
              <p className="text-slate-600 mt-2 font-medium">Manage your electrical projects and estimates</p>
              {user?.bio && (
                <p className="text-sm text-slate-500 mt-1 line-clamp-1">{user.bio}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TierBadge tier={user?.subscription_tier} showIcon />
            <Link to={createPageUrl("ProductSearch")}>
              <Button className="bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg border-2 border-cyan-400 font-bold">
                <Plus className="w-4 h-4 mr-2" />
                New Quote
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Projects"
            value={projects.filter(p => p.status !== 'archived').length}
            icon={FolderOpen}
            color="cyan"
            subtitle={`${projects.length} total`}
          />
          <StatCard
            title="Quote Lists"
            value={quoteLists.length}
            icon={FileText}
            color="green"
            subtitle="All time"
          />
          <StatCard
            title="Est. Budget"
            value={`$${projects.reduce((sum, p) => sum + (p.estimated_budget || 0), 0).toLocaleString()}`}
            icon={DollarSign}
            color="orange"
            subtitle="Total value"
          />
          <StatCard
            title="This Month"
            value={projects.filter(p => {
              const created = new Date(p.created_date);
              const now = new Date();
              return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
            }).length}
            icon={Calendar}
            color="purple"
            subtitle="New projects"
          />
        </div>

        {/* Project Limit Warning */}
        {user?.subscription_tier === "Free" && projects.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-2 border-orange-300 bg-orange-50 shadow-md">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <div className="flex-1">
                  <p className="font-bold text-orange-900">
                    {projects.length === 3 ? "Project Limit Reached" : "Almost at Project Limit"}
                  </p>
                  <span className="text-orange-700 font-medium">Upgrade to Pro for unlimited projects.</span>
                </div>
                <Link to={createPageUrl("Pricing")}>
                  <Button variant="outline" className="border-2 border-orange-400 text-orange-700 hover:bg-orange-100 font-bold">
                    Upgrade
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Projects Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#263238]">Your Projects</h2>
            <Button
              onClick={() => setShowNewProject(true)}
              disabled={!canCreateProject()}
              variant="outline"
              className="border-2 border-slate-300 hover:bg-slate-100 font-bold"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>

          {showNewProject && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="mb-6 border-2 border-cyan-300 shadow-lg bg-white">
                <CardHeader className="border-b-2 border-slate-100">
                  <CardTitle className="text-[#263238] font-bold">Create New Project</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleCreateProject} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-bold text-slate-700 mb-2 block">Project Name *</label>
                        <input
                          name="name"
                          required
                          className="w-full px-4 py-2 border-2 border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 font-medium"
                          placeholder="Main Street Office Remodel"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-700 mb-2 block">Client Name</label>
                        <input
                          name="client_name"
                          className="w-full px-4 py-2 border-2 border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 font-medium"
                          placeholder="ABC Corporation"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 mb-2 block">Description</label>
                      <textarea
                        name="description"
                        rows={3}
                        className="w-full px-4 py-2 border-2 border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 font-medium"
                        placeholder="Complete electrical upgrade for office building..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 mb-2 block">Location</label>
                      <input
                        name="location"
                        className="w-full px-4 py-2 border-2 border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 font-medium"
                        placeholder="123 Main St, City, State"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setShowNewProject(false)} className="border-2 border-slate-300 font-bold">
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white border-2 border-cyan-400 font-bold">
                        Create Project
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="hover:shadow-xl transition-all duration-300 border-2 border-slate-200 h-full bg-white">
                  <CardHeader className="border-b-2 border-slate-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-[#263238] mb-2">
                          {project.name}
                        </CardTitle>
                        <Badge className={`${statusColors[project.status]} font-bold text-xs`}>
                          {project.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <FolderOpen className="w-8 h-8 text-cyan-500" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4">
                    {project.client_name && (
                      <div>
                        <p className="text-xs text-slate-500 font-bold uppercase">Client</p>
                        <p className="text-sm text-[#263238] font-semibold">{project.client_name}</p>
                      </div>
                    )}
                    {project.location && (
                      <div>
                        <p className="text-xs text-slate-500 font-bold uppercase">Location</p>
                        <p className="text-sm text-[#263238] font-semibold">{project.location}</p>
                      </div>
                    )}
                    {project.description && (
                      <p className="text-sm text-slate-600 line-clamp-2 font-medium">{project.description}</p>
                    )}
                    <div className="pt-3 border-t-2 border-slate-100">
                      <p className="text-xs text-slate-500 font-semibold">
                        Created {format(new Date(project.created_date), "MMM d, yyyy")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {projects.length === 0 && (
              <Card className="md:col-span-2 lg:col-span-3 border-2 border-dashed border-slate-300 bg-slate-100">
                <CardContent className="p-12 text-center">
                  <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-[#263238] mb-2">No projects yet</h3>
                  <p className="text-slate-600 mb-6 font-medium">Create your first project to get started</p>
                  <Button onClick={() => setShowNewProject(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white border-2 border-cyan-400 font-bold">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Project
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Recent Quote Lists */}
        {quoteLists.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#263238]">Recent Quote Lists</h2>
              <Link to={createPageUrl("QuoteLists")}>
                <Button variant="outline" className="border-2 border-slate-300 hover:bg-slate-100 font-bold">
                  View All
                </Button>
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quoteLists.slice(0, 6).map((list) => (
                <Card key={list.id} className="hover:shadow-lg transition-all border-2 border-slate-200 bg-white">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-green-500" />
                      <div className="flex-1">
                        <CardTitle className="text-base font-bold text-[#263238]">{list.name}</CardTitle>
                        <p className="text-xs text-slate-500 mt-1 font-semibold">
                          {format(new Date(list.created_date), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </PullToRefresh>
  );
}