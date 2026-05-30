"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MockDbProvider } from "../../context/MockDbContext";
import { ToastProvider } from "../../context/ToastContext";
import {
  Dashboard as DashboardIcon,
  People,
  RestoreFromTrash,
  ShoppingCart,
  History,
  Assignment,
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
  DarkMode,
  LightMode,
  Logout,
  KeyboardArrowDown,
  KeyboardArrowRight,
  Apps
} from "@mui/icons-material";

export const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false); // default light-mode based on screenshot!
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

    // Theme Check
    const storedTheme = localStorage.getItem("wrixty_theme");
    if (storedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, [pathname, router]);

  const toggleTheme = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("wrixty_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("wrixty_theme", "light");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("wrixty_authenticated");
    localStorage.removeItem("wrixty_authenticated_user");
    setIsAuthenticated(false);
    router.push("/login");
  };

  if (pathname === "/login" || pathname === "/") {
    return (
      <ToastProvider>
        <MockDbProvider>{children}</MockDbProvider>
      </ToastProvider>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-100 font-sans">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  const renderLink = (name: string, path: string, icon: React.ReactNode) => {
    const active = pathname === path;
    return (
      <Link
        key={path}
        href={path}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3.5 px-4 py-2.5 rounded-md text-[13px] font-medium capitalize tracking-wide transition-all duration-205 ${
          active
            ? "bg-indigo-600 text-white shadow-sm font-semibold"
            : "text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100"
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
        className={`flex items-center px-4 py-1.5 rounded text-[13px] font-semibold transition-all duration-200 ${
          active
            ? "text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-500/5"
            : "text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-150"
        }`}
      >
        <span>{name}</span>
      </Link>
    );
  };

  return (
    <ToastProvider>
      <MockDbProvider>
        <div className="h-screen w-screen flex overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-all duration-300">
          
          {/* Desktop Sidebar (Fixed & Independent Scrolling area) */}
          <aside className="hidden lg:flex flex-col w-64 border-r border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 shrink-0 h-full overflow-hidden">
            <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-900 shrink-0">
              <span className="font-extrabold text-lg tracking-wider text-zinc-800 dark:text-zinc-100 font-sans">
                Wrixty
              </span>
              <div className="w-8 h-8 rounded-md bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                <Apps className="w-4 h-4" />
              </div>
            </div>
            
            {/* Sidebar navigation list: matches screenshot exactly */}
            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 scrollbar-thin">
              {renderLink("Dashboards", "/dashboard", <DashboardIcon className="w-4.5 h-4.5" />)}
              {renderLink("Lead", "/lead-list", <People className="w-4.5 h-4.5" />)}
              {renderLink("Restor Lead", "/restore-data", <RestoreFromTrash className="w-4.5 h-4.5" />)}
              {renderLink("Order", "/order-list", <ShoppingCart className="w-4.5 h-4.5" />)}
              {renderLink("Activity Log", "/activity-log", <History className="w-4.5 h-4.5" />)}
              {renderLink("Lead Try", "/task-list", <Assignment className="w-4.5 h-4.5" />)}
              {renderLink("Reminder List", "/reminder-list", <Notifications className="w-4.5 h-4.5" />)}
              {renderLink("Kanban", "/kanban-list", <ViewKanban className="w-4.5 h-4.5" />)}
              {renderLink("Return Order", "/return-order", <AssignmentReturn className="w-4.5 h-4.5" />)}
              {renderLink("Currier", "/currier-list", <LocalShipping className="w-4.5 h-4.5" />)}
              {renderLink("Return Order Report", "/staff-return-order-list", <Assessment className="w-4.5 h-4.5" />)}
              
              {/* Collapsible Team Member Menu */}
              <div className="space-y-1 text-left">
                <button
                  onClick={() => setTeamOpen(!teamOpen)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-md text-[13px] font-medium capitalize tracking-wide text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-200"
                >
                  <div className="flex items-center gap-3.5">
                    <Groups className="w-4.5 h-4.5" />
                    <span>Team Member</span>
                  </div>
                  {teamOpen ? <KeyboardArrowDown className="w-4 h-4" /> : <KeyboardArrowRight className="w-4 h-4" />}
                </button>
                {teamOpen && (
                  <div className="border-l-2 border-teal-700/80 dark:border-indigo-600/80 ml-6 pl-4 space-y-1 animate-fade-in text-left">
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
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-md text-[13px] font-medium capitalize tracking-wide text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-200"
                >
                  <div className="flex items-center gap-3.5">
                    <Security className="w-4.5 h-4.5" />
                    <span>Master</span>
                  </div>
                  {masterOpen ? <KeyboardArrowDown className="w-4 h-4" /> : <KeyboardArrowRight className="w-4 h-4" />}
                </button>
                {masterOpen && (
                  <div className="border-l-2 border-teal-700/80 dark:border-indigo-600/80 ml-6 pl-4 space-y-1 animate-fade-in text-left">
                    {renderSubLink("Status", "/status")}
                    {renderSubLink("Product", "/product")}
                    {renderSubLink("Return Order Type", "/return-order-type")}
                  </div>
                )}
              </div>
            </nav>
            
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-900 shrink-0">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-50/10 transition-all border border-red-500/20"
              >
                <Logout className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </aside>

          {/* Mobile Sidebar Panel */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex h-full">
              <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
              <aside className="relative flex flex-col w-64 max-w-xs bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-900 animate-slide-in h-full overflow-hidden">
                <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-900 shrink-0">
                  <span className="font-extrabold text-lg text-zinc-800 dark:text-zinc-100">Wrixty</span>
                  <button onClick={() => setSidebarOpen(false)} className="text-zinc-400 hover:text-zinc-100">
                    <Close className="w-5 h-5" />
                  </button>
                </div>
                
                <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 scrollbar-thin">
                  {renderLink("Dashboards", "/dashboard", <DashboardIcon className="w-4.5 h-4.5" />)}
                  {renderLink("Lead", "/lead-list", <People className="w-4.5 h-4.5" />)}
                  {renderLink("Restor Lead", "/restore-data", <RestoreFromTrash className="w-4.5 h-4.5" />)}
                  {renderLink("Order", "/order-list", <ShoppingCart className="w-4.5 h-4.5" />)}
                  {renderLink("Activity Log", "/activity-log", <History className="w-4.5 h-4.5" />)}
                  {renderLink("Lead Try", "/task-list", <Assignment className="w-4.5 h-4.5" />)}
                  {renderLink("Reminder List", "/reminder-list", <Notifications className="w-4.5 h-4.5" />)}
                  {renderLink("Kanban", "/kanban-list", <ViewKanban className="w-4.5 h-4.5" />)}
                  {renderLink("Return Order", "/return-order", <AssignmentReturn className="w-4.5 h-4.5" />)}
                  {renderLink("Currier", "/currier-list", <LocalShipping className="w-4.5 h-4.5" />)}
                  {renderLink("Return Order Report", "/staff-return-order-list", <Assessment className="w-4.5 h-4.5" />)}
                  
                  {/* Collapsible Mobile Team Member */}
                  <div className="space-y-1 text-left">
                    <button
                      onClick={() => setTeamOpen(!teamOpen)}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-md text-[13px] font-medium capitalize tracking-wide text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3.5">
                        <Groups className="w-4.5 h-4.5" />
                        <span>Team Member</span>
                      </div>
                      {teamOpen ? <KeyboardArrowDown className="w-4 h-4" /> : <KeyboardArrowRight className="w-4 h-4" />}
                    </button>
                    {teamOpen && (
                      <div className="border-l-2 border-teal-700/80 dark:border-indigo-600/80 ml-6 pl-4 space-y-1 animate-fade-in text-left">
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
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-md text-[13px] font-medium capitalize tracking-wide text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3.5">
                        <Security className="w-4.5 h-4.5" />
                        <span>Master</span>
                      </div>
                      {masterOpen ? <KeyboardArrowDown className="w-4 h-4" /> : <KeyboardArrowRight className="w-4 h-4" />}
                    </button>
                    {masterOpen && (
                      <div className="border-l-2 border-teal-700/80 dark:border-indigo-600/80 ml-6 pl-4 space-y-1 animate-fade-in text-left">
                        {renderSubLink("Status", "/status")}
                        {renderSubLink("Product", "/product")}
                        {renderSubLink("Return Order Type", "/return-order-type")}
                      </div>
                    )}
                  </div>
                </nav>
                
                <div className="p-4 border-t border-zinc-200 dark:border-zinc-900 shrink-0">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-50/10 transition-all border border-red-500/20"
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
            {/* Global Sticky Header */}
            <header className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 shrink-0 transition-all">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-150 transition-all"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs font-bold uppercase text-indigo-600 tracking-wider">Super Admin Console</span>
                <span className="text-zinc-300 dark:text-zinc-800">|</span>
                <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 tracking-wide uppercase">Wrixty Ayurveda CRM</span>
              </div>

              {/* Exact Right Header User Info display matching screenshot */}
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleTheme}
                  className="p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md transition-all"
                  title="Toggle Theme"
                >
                  {darkMode ? <LightMode className="w-5 h-5" /> : <DarkMode className="w-5 h-5" />}
                </button>

                <div className="flex items-center gap-2.5 p-1">
                  <div className="w-8 h-8 rounded bg-amber-600/10 text-amber-700 font-black text-xs flex items-center justify-center uppercase shadow-sm border border-amber-600/20">
                    {currentUser?.avatar || "A"}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{currentUser?.name || "Admin"}</span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold tracking-wide">{currentUser?.email || "superadmin@gmail.com"}</span>
                  </div>
                </div>
              </div>
            </header>

            {/* Scrollable Page body: Scrolls independently of Sidebar */}
            <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-zinc-50 dark:bg-zinc-900/30">
              {children}
            </main>
          </div>
          
        </div>
      </MockDbProvider>
    </ToastProvider>
  );
};
