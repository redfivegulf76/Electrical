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
  planning: "bg-blue-50 text-blue-600 border border-blue-100",
  in_progress: "bg-amber-50 text-amber-700 border border-amber-100",
  completed: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  archived: "bg-slate-100 text-slate-500 border border-slate-200"
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
    const optimisticProject = {
      id: `temp-${Date.now()}`,
      name: formData.get("name"),
      description: formData.get("description"),
      client_name: formData.get("client_name"),
      location: formData.get("location"),
      status: "planning",
      created_date: new Date().toISOString(),
      estimated_budget: 0
    };
    setProjects(prev => [optimisticProject, ...prev]);
    setShowNewProject(false);
    const created = await Project.create({
      name: optimisticProject.name,
      description: optimisticProject.description,
      client_name: optimisticProject.client_name,
      location: optimisticProject.location,
      status: "planning"
    });
    setProjects(prev => prev.map(p => p.id === optimisticProject.id ? created : p));
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
        {/* Hero Section with Image */}
        <div className="relative rounded-2xl overflow-hidden shadow-lg mb-8">
          <img 
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663482556260/EWcGRR7qmXf7LDYqcb4EN4/aipartsfinder-hero-dashboard-Y9rvGPRYidKf4F4nrZKnpE.webp"
            alt="Dashboard Hero"
            className="w-full h-64 lg:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-transparent"></div>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            {user?.profile_picture_url && (
              <img
                src={user.profile_picture_url}
                alt={user.full_name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
              />
            )}
            <div>
              <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 tracking-tight">
                Welcome back, {user?.full_name?.split(' ')[0] || 'there'}
              </h1>
              <p className="text-slate-500 mt-1 text-sm">Manage your electrical projects and estimates</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TierBadge tier={user?.subscription_tier} showIcon />
            <Link to={createPageUrl("ProductSearch")}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
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
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border border-amber-200 bg-amber-50">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-amber-900 text-sm">
                    {projects.length === 3 ? "Project Limit Reached" : "Almost at Project Limit"}
                  </p>
                  <span className="text-amber-700 text-sm">Upgrade to Pro for unlimited projects.</span>
                </div>
                <Link to={createPageUrl("Pricing")}>
                  <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100 text-xs">
                    Upgrade
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Projects Section */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-slate-900">Your Projects</h2>
            <Button
              onClick={() => setShowNewProject(true)}
              disabled={!canCreateProject()}
              variant="outline"
              size="sm"
              className="border-slate-200 text-slate-600 hover:bg-slate-100 text-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Project
            </Button>
          </div>

          {showNewProject && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="mb-5 border border-slate-200 shadow-sm bg-white">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-slate-900 font-semibold text-base">Create New Project</CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  <form onSubmit={handleCreateProject} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1.5 block">Project Name *</label>
                        <input
                          name="name"
                          required
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 placeholder-slate-400 bg-white outline-none"
                          placeholder="Main Street Office Remodel"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1.5 block">Client Name</label>
                        <input
                          name="client_name"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 placeholder-slate-400 bg-white outline-none"
                          placeholder="ABC Corporation"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1.5 block">Description</label>
                      <textarea
                        name="description"
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 placeholder-slate-400 bg-white outline-none resize-none"
                        placeholder="Complete electrical upgrade for office building..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1.5 block">Location</label>
                      <input
                        name="location"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 placeholder-slate-400 bg-white outline-none"
                        placeholder="123 Main St, City, State"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewProject(false)} className="text-slate-600">
                        Cancel
                      </Button>
                      <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                        Create Project
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <motion.div key={project.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="hover:shadow-md transition-all duration-200 border border-slate-200 h-full bg-white">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <CardTitle className="text-base font-semibold text-slate-900 mb-2 leading-snug">
                          {project.name}
                        </CardTitle>
                        <Badge className={`${statusColors[project.status]} text-xs font-medium`}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <FolderOpen className="w-5 h-5 text-slate-300 mt-0.5" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    {project.client_name && (
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Client</p>
                        <p className="text-sm text-slate-700">{project.client_name}</p>
                      </div>
                    )}
                    {project.location && (
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Location</p>
                        <p className="text-sm text-slate-700">{project.location}</p>
                      </div>
                    )}
                    {project.description && (
                      <p className="text-sm text-slate-500 line-clamp-2">{project.description}</p>
                    )}
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-xs text-slate-400">
                        Created {format(new Date(project.created_date), "MMM d, yyyy")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {projects.length === 0 && (
              <Card className="md:col-span-2 lg:col-span-3 border border-dashed border-slate-200 bg-white">
                <CardContent className="p-12 text-center">
                  <FolderOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-slate-700 mb-1">No projects yet</h3>
                  <p className="text-slate-400 text-sm mb-5">Create your first project to get started</p>
                  <Button onClick={() => setShowNewProject(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                    <Plus className="w-4 h-4 mr-1.5" />
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
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-900">Recent Quote Lists</h2>
              <Link to={createPageUrl("QuoteLists")}>
                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700 text-sm">
                  View All
                </Button>
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quoteLists.slice(0, 6).map((list) => (
                <Card key={list.id} className="hover:shadow-md transition-all border border-slate-200 bg-white">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium text-slate-900 truncate">{list.name}</CardTitle>
                        <p className="text-xs text-slate-400 mt-0.5">
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