import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Menu,
  X,
  Home,
  AlertCircle,
  Video,
  Music,
  Radio,
  Tv,
  Settings,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  BarChart3,
  Users,
  FileText,
  Zap,
} from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [location] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const mainMenuItems = [
    { label: "Dashboard", href: "/", icon: Home },
    { label: "Theater", href: "/theater", icon: Tv },
    { label: "Broadcast", href: "/broadcast-channels", icon: Radio },
    { label: "Music", href: "/music", icon: Music },
    { label: "Conference", href: "/conference", icon: Video },
    { label: "Emergency", href: "/emergency", icon: AlertCircle },
  ];

  const secondaryMenuItems = [
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Community", href: "/community", icon: Users },
    { label: "Documents", href: "/documents", icon: FileText },
    { label: "Automation", href: "/automation", icon: Zap },
  ];

  const isActive = (href: string) => location === href;

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-background border-r border-border transition-all duration-300 z-40 ${
          isOpen ? "w-64" : "w-20"
        } md:w-64 flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {isOpen && (
              <h1 className="text-xl font-bold text-foreground truncate">
                L.A.W.S.
              </h1>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="hidden md:flex p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isOpen && (
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 text-sm"
              />
            </div>
          </div>
        )}

        {/* Main Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="space-y-1">
            {isOpen && (
              <p className="text-xs font-semibold text-muted-foreground px-2 py-2">
                MAIN
              </p>
            )}
            {mainMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <a
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {isOpen && <span className="text-sm font-medium">{item.label}</span>}
                  </a>
                </Link>
              );
            })}
          </div>

          {/* Secondary Menu */}
          <div className="space-y-1 pt-4 border-t border-border">
            {isOpen && (
              <p className="text-xs font-semibold text-muted-foreground px-2 py-2">
                TOOLS
              </p>
            )}
            {secondaryMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <a
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {isOpen && <span className="text-sm font-medium">{item.label}</span>}
                  </a>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4 space-y-2">
          {/* Notifications */}
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-foreground hover:bg-secondary transition-colors">
            <Bell className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="text-sm font-medium">Notifications</span>}
          </button>

          {/* Settings */}
          <Link href="/settings">
            <a className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-foreground hover:bg-secondary transition-colors">
              <Settings className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span className="text-sm font-medium">Settings</span>}
            </a>
          </Link>

          {/* User Profile */}
          {isOpen && (
            <div className="px-3 py-2 bg-secondary rounded-lg">
              <p className="text-xs font-semibold text-muted-foreground">Logged in as</p>
              <p className="text-sm font-medium text-foreground truncate">
                {user?.email || "User"}
              </p>
            </div>
          )}

          {/* Logout */}
          <Button
            onClick={() => logout()}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {isOpen && "Logout"}
          </Button>
        </div>
      </aside>

      {/* Main Content Offset */}
      <div className={`transition-all duration-300 ${isOpen ? "md:ml-64" : "md:ml-20"}`}>
        {/* Content goes here */}
      </div>
    </>
  );
}
