import React, { useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LayoutDashboard, Search, FileText, Settings } from "lucide-react";

const tabs = [
  { label: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
  { label: "Search", icon: Search, page: "ProductSearch" },
  { label: "Quotes", icon: FileText, page: "QuoteLists" },
  { label: "Settings", icon: Settings, page: "ProfileSettings" },
];

// Persists scroll positions so switching tabs restores where you left off
const scrollPositions = {};

export default function BottomTabBar() {
  const location = useLocation();

  const handleTabClick = useCallback((targetUrl) => {
    // Save current scroll position of active tab before leaving
    const currentUrl = location.pathname;
    scrollPositions[currentUrl] = window.scrollY;

    // Schedule scroll restore after navigation renders
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const savedY = scrollPositions[targetUrl] ?? 0;
        window.scrollTo({ top: savedY, behavior: "instant" });
      });
    });
  }, [location.pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#263238] border-t-2 border-slate-700 flex lg:hidden safe-bottom">
      {tabs.map(({ label, icon: Icon, page }) => {
        const url = createPageUrl(page);
        const isActive = location.pathname === url;
        return (
          <Link
            key={page}
            to={url}
            onClick={() => handleTabClick(url)}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-1 transition-colors ${
              isActive ? "text-cyan-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-semibold">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}