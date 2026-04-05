import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp, Users, DollarSign, Eye, MessageSquare, Share2 } from 'lucide-react';

export default function SponsorAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Mock data
  const metrics = {
    totalRevenue: 15750.50,
    sponsorshipRevenue: 8500.00,
    adRevenue: 5200.00,
    donationRevenue: 2050.50,
    totalImpressions: 1250000,
    cpm: 0.012,
    rpm: 12.60,
    engagementRate: 4.6,
  };

  const revenueData = [
    { month: 'Jan', sponsorship: 7500, ads: 4200, donations: 1800 },
    { month: 'Feb', sponsorship: 8200, ads: 4800, donations: 1900 },
    { month: 'Mar', sponsorship: 8500, ads: 5200, donations: 2050 },
  ];

  const demographicsData = [
    { name: '18-24', value: 24 },
    { name: '25-34', value: 36 },
    { name: '35-44', value: 18 },
    { name: '45-54', value: 13 },
    { name: '55+', value: 9 },
  ];

  const topContent = [
    { title: 'Investment Strategies for Beginners', views: 185000, engagement: 8.5, revenue: 2500 },
    { title: 'Crypto Deep Dive', views: 165000, engagement: 8.2, revenue: 2200 },
    { title: 'Tax Optimization Guide', views: 145000, engagement: 7.9, revenue: 1950 },
  ];

  const sponsorships = [
    { company: 'TechCorp Inc', amount: 5000, status: 'active', progress: 90 },
    { company: 'FinanceFlow', amount: 3500, status: 'active', progress: 70 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sponsor Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-2">Track your monetization and audience metrics</p>
          </div>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-6">
          {(['month', 'quarter', 'year'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              onClick={() => setTimeRange(range)}
              className="capitalize"
            >
              {range}
            </Button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground mt-2">${metrics.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-accent" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Impressions</p>
                <p className="text-2xl font-bold text-foreground mt-2">{(metrics.totalImpressions / 1000000).toFixed(1)}M</p>
              </div>
              <Eye className="w-8 h-8 text-accent" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CPM</p>
                <p className="text-2xl font-bold text-foreground mt-2">${(metrics.cpm * 1000).toFixed(2)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-accent" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Engagement Rate</p>
                <p className="text-2xl font-bold text-foreground mt-2">{metrics.engagementRate}%</p>
              </div>
              <MessageSquare className="w-8 h-8 text-accent" />
            </div>
          </Card>
        </div>

        {/* Revenue Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-foreground mb-4">Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sponsorship" fill="#3b82f6" name="Sponsorship" />
                <Bar dataKey="ads" fill="#10b981" name="Ads" />
                <Bar dataKey="donations" fill="#f59e0b" name="Donations" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Revenue Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Sponsorship', value: 54 },
                    { name: 'Ads', value: 33 },
                    { name: 'Donations', value: 13 },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[0, 1, 2].map((index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Audience Demographics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Audience by Age Group</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={demographicsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {demographicsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Top Countries</h2>
            <div className="space-y-3">
              {[
                { country: 'United States', viewers: 450000, percentage: 87 },
                { country: 'United Kingdom', viewers: 35000, percentage: 7 },
                { country: 'Canada', viewers: 20000, percentage: 4 },
                { country: 'Australia', viewers: 10000, percentage: 2 },
              ].map((item) => (
                <div key={item.country} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{item.country}</p>
                    <p className="text-sm text-muted-foreground">{item.viewers.toLocaleString()} viewers</p>
                  </div>
                  <div className="w-16 bg-secondary rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Active Sponsorships */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Active Sponsorships</h2>
            <div className="space-y-4">
              {sponsorships.map((sponsor) => (
                <div key={sponsor.company} className="border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-foreground">{sponsor.company}</p>
                      <p className="text-sm text-muted-foreground">${sponsor.amount.toLocaleString()}</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full"
                      style={{ width: `${sponsor.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{sponsor.progress}% impressions delivered</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Top Performing Content</h2>
            <div className="space-y-3">
              {topContent.map((content, index) => (
                <div key={index} className="border-b border-border pb-3 last:border-0">
                  <p className="font-medium text-foreground text-sm">{content.title}</p>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>{(content.views / 1000).toFixed(0)}K views</span>
                      <span>{content.engagement}/10 engagement</span>
                    </div>
                    <span className="text-sm font-medium text-accent">${content.revenue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Performance Recommendations */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Performance Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              'Increase upload frequency to 4 per week',
              'Engage more with comments (target 5% engagement)',
              'Cross-promote on other platforms',
              'Consider longer-form content (15+ min)',
            ].map((recommendation, index) => (
              <div key={index} className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-foreground">{recommendation}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
