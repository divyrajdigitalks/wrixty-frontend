"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { ToastProvider } from "../../context/ToastContext";
import {
  Dashboard as DashboardIcon,
  People,
  RestoreFromTrash,
  ShoppingCart,
  History,
  Notifications,
  ViewKanban,
  AssignmentReturn,
  LocalShipping,
  Assessment,
  Badge,
  Security,
  Groups,
  Palette,
  ShoppingBag,
  Category,
  Person,
  Menu,
  Close,
  Logout,
  KeyboardArrowDown,
  KeyboardArrowRight,
  Apps,
  Spa,
  Description
} from "@mui/icons-material";

export const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{name: string; email: string; avatar: string} | null>(null);
  
  // Collapsible Submenu states
  const [teamOpen, setTeamOpen] = useState(false);
  const [masterOpen, setMasterOpen] = useState(false);

  // Initialize theme and auth status
  useEffect(() => {
    // Auth Check
    const auth = localStorage.getItem("wrixty_authenticated");
    if (!auth && pathname !== "/login") {
      router.push("/login");
    } else if (auth) {
      setIsAuthenticated(true);
      const userDataStr = localStorage.getItem("wrixty_authenticated_user");
      if (userDataStr) {
        try {
          const u = JSON.parse(userDataStr);
          setCurrentUser({
            name: u.name || "Admin",
            email: u.email || "superadmin@gmail.com",
            avatar: u.name ? u.name.charAt(0).toUpperCase() : "A"
          });
        } catch (e) {}
      } else {
        setCurrentUser({
          name: "Admin",
          email: "superadmin@gmail.com",
          avatar: "A"
        });
      }
      if (pathname === "/login") {
        router.push("/dashboard");
      }
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("wrixty_authenticated");
    localStorage.removeItem("wrixty_authenticated_user");
    setIsAuthenticated(false);
    router.push("/login");
  };

  if (pathname === "/login" || pathname === "/") {
    return (
      <ToastProvider>
        {children}
      </ToastProvider>
    );
  }

  if (!isAuthenticated) {
    return (
      <ToastProvider>
        <div className="min-h-screen bg-background flex items-center justify-center text-text-primary font-sans">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-teal"></div>
        </div>
      </ToastProvider>
    );
  }

  const renderLink = (name: string, path: string, icon: React.ReactNode) => {
    const active = pathname === path;
    return (
      <Link
        key={path}
        href={path}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-[13px] font-medium capitalize tracking-wide transition-all duration-205 ${
          active
            ? "bg-gradient-primary text-white shadow-md font-semibold"
            : "text-text-secondary hover:bg-background hover:text-text-primary"
        }`}
      >
        {icon}
        <span>{name}</span>
      </Link>
    );
  };

  const renderSubLink = (name: string, path: string) => {
    const active = pathname === path;
    return (
      <Link
        key={path}
        href={path}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-200 ${
          active
            ? "text-primary-teal font-bold bg-primary-teal/5"
            : "text-text-secondary hover:text-text-primary"
        }`}
      >
        <span>{name}</span>
      </Link>
    );
  };

  return (
    <ToastProvider>
      <div className="h-screen w-screen flex overflow-hidden bg-background text-text-primary font-sans transition-all duration-300">
          
          {/* Desktop Sidebar (Fixed & Independent Scrolling area) */}
          <aside className="hidden lg:flex flex-col w-64 border-r border-border-ui bg-card-bg shrink-0 h-full overflow-hidden">
            <div className="h-16 flex items-center px-6 border-b border-border-ui shrink-0 gap-2 bg-gradient-to-b from-primary-teal/5 to-transparent">
              <Spa className="text-primary-teal w-6 h-6" />
              <span className="font-extrabold text-lg tracking-wider text-gradient-primary font-sans">
                Wrixty
              </span>
            </div>
            
            {/* Sidebar navigation list: matches screenshot exactly */}
            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 no-scrollbar">
              {renderLink("Dashboards", "/dashboard", <DashboardIcon className="w-4.5 h-4.5" />)}
              {renderLink("Lead", "/lead-list", <People className="w-4.5 h-4.5" />)}
              {renderLink("Restore Lead", "/restore-data", <RestoreFromTrash className="w-4.5 h-4.5" />)}
              {renderLink("Order", "/order-list", <ShoppingCart className="w-4.5 h-4.5" />)}
              {renderLink("Activity Log", "/activity-log", <History className="w-4.5 h-4.5" />)}
              {renderLink("Task List", "/task-list", <Description className="w-4.5 h-4.5" />)}
              {renderLink("Reminder List", "/reminder-list", <Notifications className="w-4.5 h-4.5" />)}
              {renderLink("Kanban", "/kanban-list", <ViewKanban className="w-4.5 h-4.5" />)}
              {renderLink("Return Order", "/return-order", <AssignmentReturn className="w-4.5 h-4.5" />)}
              {renderLink("Courier", "/currier-list", <LocalShipping className="w-4.5 h-4.5" />)}
              {renderLink("Return Order Report", "/staff-return-order-list", <Assessment className="w-4.5 h-4.5" />)}
              
              {/* Collapsible Team Member Menu */}
              <div className="space-y-1 text-left">
                <button
                  onClick={() => setTeamOpen(!teamOpen)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-[13px] font-medium capitalize tracking-wide text-text-secondary hover:bg-background transition-all duration-200"
                >
                  <div className="flex items-center gap-3.5">
                    <Groups className="w-4.5 h-4.5" />
                    <span>Team Member</span>
                  </div>
                  {teamOpen ? <KeyboardArrowDown className="w-4 h-4" /> : <KeyboardArrowRight className="w-4 h-4" />}
                </button>
                {teamOpen && (
                  <div className="border-l-2 border-primary-teal/50 ml-6 pl-4 space-y-1 animate-fade-in text-left">
                    {renderSubLink("User", "/users")}
                    {renderSubLink("Role", "/roles-list")}
                    {renderSubLink("Team", "/team-list")}
                  </div>
                )}
              </div>

              {/* Collapsible Master Menu */}
              <div className="space-y-1 text-left">
                <button
                  onClick={() => setMasterOpen(!masterOpen)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-[13px] font-medium capitalize tracking-wide text-text-secondary hover:bg-background transition-all duration-200"
                >
                  <div className="flex items-center gap-3.5">
                    <Security className="w-4.5 h-4.5" />
                    <span>Master</span>
                  </div>
                  {masterOpen ? <KeyboardArrowDown className="w-4 h-4" /> : <KeyboardArrowRight className="w-4 h-4" />}
                </button>
                {masterOpen && (
                  <div className="border-l-2 border-primary-teal/50 ml-6 pl-4 space-y-1 animate-fade-in text-left">
                    {renderSubLink("Status", "/status")}
                    {renderSubLink("Product", "/product")}
                    {renderSubLink("Return Order Type", "/return-order-type")}
                    {renderSubLink("Reason to Call", "/reason-to-call")}
                  </div>
                )}
              </div>
            </nav>
            
            <div className="p-4 border-t border-border-ui shrink-0">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider text-error hover:bg-error/5 transition-all border border-error/20"
              >
                <Logout className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </aside>

          {/* Mobile Sidebar Panel */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex h-full">
              <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
              <aside className="relative flex flex-col w-64 max-w-xs bg-card-bg border-r border-border-ui animate-slide-in h-full overflow-hidden">
                <div className="h-16 flex items-center px-6 border-b border-border-ui shrink-0 gap-2">
                  <Spa className="text-primary-teal w-6 h-6" />
                  <span className="font-extrabold text-lg text-gradient-primary">Wrixty</span>
                  <button onClick={() => setSidebarOpen(false)} className="ml-auto text-text-secondary hover:text-text-primary">
                    <Close className="w-5 h-5" />
                  </button>
                </div>
                
                <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 no-scrollbar">
                  {renderLink("Dashboards", "/dashboard", <DashboardIcon className="w-4.5 h-4.5" />)}
                  {renderLink("Lead", "/lead-list", <People className="w-4.5 h-4.5" />)}
                  {renderLink("Restore Lead", "/restore-data", <RestoreFromTrash className="w-4.5 h-4.5" />)}
                  {renderLink("Order", "/order-list", <ShoppingCart className="w-4.5 h-4.5" />)}
                  {renderLink("Activity Log", "/activity-log", <History className="w-4.5 h-4.5" />)}
                  {renderLink("Task List", "/task-list", <Description className="w-4.5 h-4.5" />)}
                  {renderLink("Reminder List", "/reminder-list", <Notifications className="w-4.5 h-4.5" />)}
                  {renderLink("Kanban", "/kanban-list", <ViewKanban className="w-4.5 h-4.5" />)}
                  {renderLink("Return Order", "/return-order", <AssignmentReturn className="w-4.5 h-4.5" />)}
                  {renderLink("Courier", "/currier-list", <LocalShipping className="w-4.5 h-4.5" />)}
                  {renderLink("Return Order Report", "/staff-return-order-list", <Assessment className="w-4.5 h-4.5" />)}
                  
                  {/* Collapsible Mobile Team Member */}
                  <div className="space-y-1 text-left">
                    <button
                      onClick={() => setTeamOpen(!teamOpen)}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-[13px] font-medium capitalize tracking-wide text-text-secondary hover:bg-background transition-all duration-200"
                    >
                      <div className="flex items-center gap-3.5">
                        <Groups className="w-4.5 h-4.5" />
                        <span>Team Member</span>
                      </div>
                      {teamOpen ? <KeyboardArrowDown className="w-4 h-4" /> : <KeyboardArrowRight className="w-4 h-4" />}
                    </button>
                    {teamOpen && (
                      <div className="border-l-2 border-primary-teal/50 ml-6 pl-4 space-y-1 animate-fade-in text-left">
                        {renderSubLink("User", "/users")}
                        {renderSubLink("Role", "/roles-list")}
                        {renderSubLink("Team", "/team-list")}
                      </div>
                    )}
                  </div>

                  {/* Collapsible Mobile Master */}
                  <div className="space-y-1 text-left">
                    <button
                      onClick={() => setMasterOpen(!masterOpen)}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-[13px] font-medium capitalize tracking-wide text-text-secondary hover:bg-background transition-all duration-200"
                    >
                      <div className="flex items-center gap-3.5">
                        <Security className="w-4.5 h-4.5" />
                        <span>Master</span>
                      </div>
                      {masterOpen ? <KeyboardArrowDown className="w-4 h-4" /> : <KeyboardArrowRight className="w-4 h-4" />}
                    </button>
                    {masterOpen && (
                      <div className="border-l-2 border-primary-teal/50 ml-6 pl-4 space-y-1 animate-fade-in text-left">
                        {renderSubLink("Status", "/status")}
                        {renderSubLink("Product", "/product")}
                        {renderSubLink("Return Order Type", "/return-order-type")}
                        {renderSubLink("Reason to Call", "/reason-to-call")}
                      </div>
                    )}
                  </div>
                </nav>
                
                <div className="p-4 border-t border-border-ui shrink-0">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider text-error hover:bg-error/5 transition-all border border-error/20"
                  >
                    <Logout className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </aside>
            </div>
          )}

          {/* Right-side Main Content View (Sticky Header + Independent Scroll content) */}
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
            {/* Global Sticky Header with Glassmorphism, Premium Alignment, and Motion */}
            <header className="h-16 flex items-center justify-between px-6 border-b border-border-ui/50 bg-card-bg/80 backdrop-blur-md sticky top-0 z-40 shrink-0 transition-all duration-300">
              <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-primary-teal/20 to-transparent"></div>
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-text-secondary hover:text-text-primary transition-all active:scale-95 duration-150"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="hidden sm:flex items-center gap-3">
                <span className="text-xs font-medium text-primary-teal bg-primary-teal/5 px-3 py-1 rounded-full border border-primary-teal/10 shadow-soft transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
                  Super Admin Console
                </span>
                <span className="text-border-ui">/</span>
                <span className="text-xs font-bold text-text-primary transition-all cursor-pointer capitalize">
                  {pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") || "Dashboard"}
                </span>
              </div>

              {/* Exact Right Header User Info display matching screenshot */}
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-3 p-1 group cursor-pointer">
                  <div className="w-9 h-9 rounded-lg bg-gradient-primary text-white font-bold text-xs flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
                    {currentUser?.avatar || "A"}
                  </div>
                  <div className="flex flex-col text-left transition-all duration-200 group-hover:translate-x-0.5">
                    <span className="text-xs font-bold text-text-primary">{currentUser?.name || "Admin"}</span>
                    <span className="text-[10px] text-text-secondary font-semibold tracking-wide">{currentUser?.email || "superadmin@gmail.com"}</span>
                  </div>
                </div>
              </div>
            </header>

            {/* Scrollable Page body: Scrolls independently of Sidebar */}
            <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-background">
              {children}
            </main>
          </div>
          
        </div>
      </ToastProvider>
    );
  };
