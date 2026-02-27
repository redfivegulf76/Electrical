import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import {
  LayoutDashboard,
  Search,
  FileText,
  Send,
  Sparkles,
  Package,
  Building2,
  Crown,
  LogOut,
  Menu,
  Zap,
  Settings,
  Users,
  CreditCard,
  Bot,
  Database
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
    tierAccess: "all"
  },
  {
    title: "Product Search",
    url: createPageUrl("ProductSearch"),
    icon: Search,
    tierAccess: "all"
  },
  {
    title: "Product Management",
    url: createPageUrl("ProductManagement"),
    icon: Package,
    tierAccess: "all"
  },
  {
    title: "Quote Lists",
    url: createPageUrl("QuoteLists"),
    icon: FileText,
    tierAccess: "all"
  },
  {
    title: "AI Estimator",
    url: createPageUrl("AIEstimator"),
    icon: Sparkles,
    tierAccess: ["Pro", "Enterprise"]
  },
  {
    title: "Templates & Kits",
    url: createPageUrl("Templates"),
    icon: Package,
    tierAccess: ["Pro", "Enterprise"]
  },
  {
    title: "Supplier Directory",
    url: createPageUrl("SupplierDirectory"),
    icon: Building2,
    tierAccess: ["Enterprise"]
  },
  {
    title: "Electrician Directory",
    url: createPageUrl("ElectricianDirectory"),
    icon: Users,
    tierAccess: "all"
  },
  {
    title: "AI Data Extractor",
    url: createPageUrl("DataExtractor"),
    icon: Bot,
    adminOnly: true
  },
  {
    title: "Extraction Dashboard",
    url: createPageUrl("ExtractionDashboard"),
    icon: Database,
    adminOnly: true
  },
  {
    title: "Upgrade Plan",
    url: createPageUrl("PaymentPortal"),
    icon: CreditCard,
    tierAccess: "all"
  },
  {
    title: "Profile Settings",
    url: createPageUrl("ProfileSettings"),
    icon: Settings,
    tierAccess: "all"
  }
];

const tierColors = {
  Free: "bg-slate-700 text-slate-200 border-slate-600",
  Pro: "bg-cyan-500 text-white border-cyan-400",
  Enterprise: "bg-orange-500 text-white border-orange-400"
};

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  const [onboardingRecord, setOnboardingRecord] = React.useState(null);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      // Check onboarding status
      const records = await base44.entities.UserOnboardingStatus.filter({ user_id: userData.email });
      if (records.length === 0) {
        // First-time user
        setShowOnboarding(true);
      } else {
        const record = records[0];
        setOnboardingRecord(record);
        if (!record.onboarding_completed) {
          setShowOnboarding(true);
        }
      }
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const canAccessFeature = (tierAccess) => {
    if (!user) return false;
    if (tierAccess === "all") return true;
    if (Array.isArray(tierAccess)) {
      return tierAccess.includes(user.subscription_tier);
    }
    return false;
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" />
    </div>;
  }

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --sidebar-width: 280px;
          --primary-dark: #263238;
          --primary-cyan: #00BCD4;
          --primary-orange: #FF7043;
          --success-green: #8BC34A;
        }
      `}</style>
      <div className="min-h-screen flex w-full bg-slate-50">
        <Sidebar className="border-r-2 border-slate-200 bg-[#263238]">
          <SidebarHeader className="border-b-2 border-slate-700 p-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg border-2 border-cyan-300">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg tracking-tight">PackOutAI</h2>
                <p className="text-xs text-cyan-300 font-medium">Electrical Estimating</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-2 mb-1">
                Main Menu
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const hasAccess = canAccessFeature(item.tierAccess);
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild={hasAccess}
                          disabled={!hasAccess}
                          className={`
                            group relative rounded-md mb-1 transition-all duration-200 border-2
                            ${location.pathname === item.url 
                              ? 'bg-cyan-500 text-white border-cyan-400 shadow-lg' 
                              : hasAccess 
                                ? 'hover:bg-slate-700 text-slate-200 border-transparent hover:border-slate-600' 
                                : 'opacity-40 cursor-not-allowed text-slate-500 border-transparent'
                            }
                          `}
                        >
                          {hasAccess ? (
                            <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5">
                              <item.icon className="w-5 h-5" />
                              <span className="font-semibold text-sm">{item.title}</span>
                            </Link>
                          ) : (
                            <div className="flex items-center gap-3 px-3 py-2.5">
                              <item.icon className="w-5 h-5" />
                              <span className="font-semibold text-sm">{item.title}</span>
                              <Crown className="w-3 h-3 ml-auto text-orange-400" />
                            </div>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {user && user.subscription_tier === "Free" && (
              <SidebarGroup className="mt-6">
                <div className="mx-3 p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg border-2 border-orange-400">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-5 h-5 text-yellow-300" />
                    <span className="font-bold text-white text-sm">Upgrade to Pro</span>
                  </div>
                  <p className="text-xs text-orange-100 mb-3 leading-relaxed">
                    Unlock AI tools, unlimited projects, and premium features
                  </p>
                  <Link to={createPageUrl("PaymentPortal")}>
                    <Button className="w-full bg-white text-orange-600 hover:bg-orange-50 shadow-md text-sm font-bold border-2 border-white">
                      View Plans
                    </Button>
                  </Link>
                </div>
              </SidebarGroup>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t-2 border-slate-700 p-4">
            {user && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center border-2 border-cyan-300 overflow-hidden">
                    {user.profile_picture_url ? (
                      <img
                        src={user.profile_picture_url}
                        alt={user.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-sm">
                        {user.full_name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">{user.full_name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className={`${tierColors[user.subscription_tier]} border-2 font-bold text-xs`}>
                    {user.subscription_tier}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-slate-400 hover:text-white hover:bg-slate-700"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-[#263238] border-b-2 border-slate-700 px-6 py-4 lg:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-700 p-2 rounded-lg transition-colors text-white">
                <Menu className="w-5 h-5" />
              </SidebarTrigger>
              <h1 className="text-lg font-bold text-white">PackOutAI</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto bg-slate-50">
            {children}
          </div>
        </main>
      </div>

      {showOnboarding && user && (
        <OnboardingModal
          user={user}
          onboardingRecord={onboardingRecord}
          onComplete={() => setShowOnboarding(false)}
        />
      )}
    </SidebarProvider>
  );
}