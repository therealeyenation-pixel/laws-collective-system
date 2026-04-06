import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ChevronDown, Menu, X, BarChart3, MessageSquare, Zap, DollarSign, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/_core/hooks/useAuth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  category: 'core' | 'analytics' | 'operations' | 'settings';
  badge?: string;
}

const navItems: NavItem[] = [
  // Core Features
  { label: 'Dashboard', href: '/dashboard', icon: <BarChart3 className="w-4 h-4" />, category: 'core' },
  { label: 'Email Campaigns', href: '/email-campaigns', icon: <MessageSquare className="w-4 h-4" />, category: 'core' },
  { label: 'Communication Hub', href: '/communication-hub', icon: <MessageSquare className="w-4 h-4" />, category: 'core', badge: 'New' },
  
  // Analytics
  { label: 'Campaign Analytics', href: '/email-campaign-analytics', icon: <BarChart3 className="w-4 h-4" />, category: 'analytics' },
  { label: 'Advanced Analytics', href: '/advanced-analytics', icon: <BarChart3 className="w-4 h-4" />, category: 'analytics', badge: 'New' },
  { label: 'Segmentation Engine', href: '/segmentation-engine', icon: <Zap className="w-4 h-4" />, category: 'analytics', badge: 'New' },
  
  // Operations
  { label: 'Financial Reconciliation', href: '/financial-reconciliation', icon: <DollarSign className="w-4 h-4" />, category: 'operations', badge: 'New' },
  { label: 'Payment Processing', href: '/payment-processing', icon: <DollarSign className="w-4 h-4" />, category: 'operations' },
  { label: 'Data Export', href: '/data-export', icon: <BarChart3 className="w-4 h-4" />, category: 'operations' },
  
  // Settings
  { label: 'Settings', href: '/settings', icon: <Settings className="w-4 h-4" />, category: 'settings' },
];

export function EnhancedDashboardNav() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('core');
  const { logout } = useAuth();

  const categories = {
    core: 'Core Features',
    analytics: 'Analytics & Insights',
    operations: 'Operations',
    settings: 'Settings',
  };

  const groupedItems = navItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  const isActive = (href: string) => location === href;

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden flex items-center justify-between p-4 bg-background border-b border-border">
        <h1 className="text-lg font-bold text-foreground">Financial Automation</h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-secondary rounded-lg"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className={`${isOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-background border-r border-border min-h-screen overflow-y-auto`}>
        <div className="p-4 space-y-6">
          {/* Header */}
          <div className="hidden md:block">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Navigation</h2>
          </div>

          {/* Navigation Categories */}
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              <button
                onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                <span>{categories[category as keyof typeof categories]}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${expandedCategory === category ? 'rotate-180' : ''}`}
                />
              </button>

              {expandedCategory === category && (
                <div className="mt-2 space-y-1 pl-2">
                  {items.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <a
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive(item.href)
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-secondary'
                        }`}
                      >
                        {item.icon}
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 bg-accent text-accent-foreground text-xs rounded-full font-medium">
                            {item.badge}
                          </span>
                        )}
                      </a>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Logout */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="w-full gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </nav>
    </>
  );
}

export default EnhancedDashboardNav;
