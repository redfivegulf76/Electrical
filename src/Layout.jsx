import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import BottomTabBar from "@/components/mobile/BottomTabBar";
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
    tierAccess: "all",
    requiresProducts: true
  },
  {
    title: "Product Management",
    url: createPageUrl("ProductManagement"),
    icon: Package,
    tierAccess: "all",
    requiresProducts: true
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
  Free: "bg-slate-100 text-slate-600 border-slate-200",
  Pro: "bg-blue-50 text-blue-700 border-blue-100",
  Enterprise: "bg-violet-50 text-violet-700 border-violet-100"
};

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  const [onboardingRecord, setOnboardingRecord] = React.useState(null);
  const [hasProducts, setHasProducts] = React.useState(false);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      // Check if product data exists
      const products = await base44.entities.CoreProduct.list('-created_date', 1);
      setHasProducts(products.length > 0);

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

  const canAccessFeature = (tierAccess, adminOnly, requiresProducts) => {
    if (!user) return false;
    if (adminOnly) return user.role === 'admin';
    if (requiresProducts && !hasProducts && user.role !== 'admin') return false;
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
          --sidebar-width: 260px;
        }
        body { font-family: 'Inter', system-ui, sans-serif; }
      `}</style>
      <div className="min-h-screen flex w-full bg-slate-50">
        <Sidebar className="border-r border-slate-200 bg-white">
          <SidebarHeader className="border-b border-slate-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 text-base tracking-tight">AIpartsFinder</h2>
                <p className="text-xs text-slate-400">Electrical Estimating</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-slate-400 uppercase tracking-wider px-2 py-2 mb-1">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const hasAccess = canAccessFeature(item.tierAccess, item.adminOnly);
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild={hasAccess}
                          disabled={!hasAccess}
                          className={`
                            group relative rounded-lg mb-0.5 transition-all duration-150
                            ${location.pathname === item.url 
                              ? 'bg-blue-50 text-blue-700' 
                              : hasAccess 
                                ? 'hover:bg-slate-100 text-slate-600 hover:text-slate-900' 
                                : 'opacity-40 cursor-not-allowed text-slate-400'
                            }
                          `}
                        >
                          {hasAccess ? (
                            <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                              <item.icon className={`w-4 h-4 ${location.pathname === item.url ? 'text-blue-600' : 'text-slate-400'}`} />
                              <span className="font-medium text-sm">{item.title}</span>
                            </Link>
                          ) : (
                            <div className="flex items-center gap-3 px-3 py-2">
                              <item.icon className="w-4 h-4 text-slate-400" />
                              <span className="font-medium text-sm">{item.title}</span>
                              <Crown className="w-3 h-3 ml-auto text-slate-400" />
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
              <SidebarGroup className="mt-4">
                <div className="mx-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Crown className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold text-slate-800 text-sm">Upgrade to Pro</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                    Unlock AI tools, unlimited projects, and more
                  </p>
                  <Link to={createPageUrl("PaymentPortal")}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">
                      View Plans
                    </Button>
                  </Link>
                </div>
              </SidebarGroup>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-100 p-4">
            {user && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
                    {user.profile_picture_url ? (
                      <img
                        src={user.profile_picture_url}
                        alt={user.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-slate-600 font-semibold text-sm">
                        {user.full_name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm truncate">{user.full_name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 h-8 w-8 p-0"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
                <Badge className={`${tierColors[user.subscription_tier]} text-xs font-medium`}>
                  {user.subscription_tier}
                </Badge>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-slate-200 px-5 py-3 lg:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors text-slate-600">
                <Menu className="w-5 h-5" />
              </SidebarTrigger>
              <h1 className="text-base font-semibold text-slate-900">AIpartsFinder</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto bg-slate-50 pb-safe">
            {children}
          </div>
        </main>
      </div>
      <BottomTabBar />

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