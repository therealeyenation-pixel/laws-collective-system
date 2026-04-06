import { useState } from "react";
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
  BarChart3,
  Users,
  FileText,
  Zap,
} from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
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
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-40">
        <Link href="/" className="font-bold text-lg">
          L.A.W.S.
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Desktop Fixed, Mobile Drawer */}
      <aside
        className={`
          fixed md:static top-0 left-0 h-screen md:h-auto
          w-64 md:w-64 bg-white border-r border-gray-200
          transition-transform duration-300 ease-in-out z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          overflow-y-auto md:overflow-visible
          flex flex-col
          md:pt-0 pt-20
        `}
      >
        {/* Desktop Logo */}
        <div className="hidden md:block p-4 border-b border-gray-200">
          <Link href="/" className="font-bold text-xl flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
              L
            </div>
            L.A.W.S.
          </Link>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <Input
              placeholder="Search..."
              className="pl-10 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Main Menu */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="text-xs font-semibold text-gray-500 uppercase mb-3">
              Main
            </div>
            <nav className="space-y-2">
              {mainMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <a
                      onClick={() => setIsOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                        ${
                          isActive(item.href)
                            ? "bg-green-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }
                      `}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </a>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Tools Menu */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs font-semibold text-gray-500 uppercase mb-3">
              Tools
            </div>
            <nav className="space-y-2">
              {secondaryMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <a
                      onClick={() => setIsOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                        ${
                          isActive(item.href)
                            ? "bg-green-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }
                      `}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </a>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Profile & Actions */}
        <div className="p-4 border-t border-gray-200 space-y-3">
          {/* Notifications */}
          <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20} />
            <span className="font-medium">Notifications</span>
          </button>

          {/* Settings */}
          <Link href="/settings">
            <a
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings size={20} />
              <span className="font-medium">Settings</span>
            </a>
          </Link>

          {/* User Profile */}
          <div className="px-3 py-3 bg-green-50 rounded-lg">
            <div className="text-sm font-semibold text-gray-900 truncate">
              {user?.email || "User"}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {user?.role || "Member"}
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
