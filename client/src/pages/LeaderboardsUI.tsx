import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Flame, TrendingUp, Users, Share2, Award } from 'lucide-react';

export default function LeaderboardsUI() {
  const [selectedCategory, setSelectedCategory] = useState('revenue');
  const [timeframe, setTimeframe] = useState('month');
  const [showFriendsOnly, setShowFriendsOnly] = useState(false);

  const categories = [
    { name: 'revenue', label: 'Revenue', icon: Trophy, color: 'text-yellow-500' },
    { name: 'engagement', label: 'Engagement', icon: Flame, color: 'text-red-500' },
    { name: 'growth', label: 'Growth', icon: TrendingUp, color: 'text-green-500' },
    { name: 'consistency', label: 'Consistency', icon: Award, color: 'text-blue-500' },
    { name: 'community', label: 'Community', icon: Users, color: 'text-purple-500' },
  ];

  const leaderboardData = [
    { rank: 1, name: 'Creator Alpha', score: 125000, badge: '👑', streak: 45 },
    { rank: 2, name: 'Creator Beta', score: 98500, badge: '⭐', streak: 32 },
    { rank: 3, name: 'Creator Gamma', score: 87200, badge: '🔥', streak: 28 },
    { rank: 4, name: 'You', score: 45000, badge: '✨', streak: 18, isYou: true },
    { rank: 5, name: 'Creator Delta', score: 76500, badge: '🎯', streak: 21 },
  ];

  const achievements = [
    { id: 1, title: 'First Steps', icon: '🎬', points: 100, unlocked: true },
    { id: 2, title: 'Milestone 1K', icon: '🌟', points: 250, unlocked: true },
    { id: 3, title: 'Engagement Master', icon: '🔥', points: 500, unlocked: true },
    { id: 4, title: 'Viral Sensation', icon: '🚀', points: 1000, unlocked: false, progress: 45 },
    { id: 5, title: 'Revenue Champion', icon: '💰', points: 1500, unlocked: false, progress: 32 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Community Leaderboards</h1>
          <p className="text-muted-foreground">Compete, achieve, and celebrate with the L.A.W.S. Collective</p>
        </div>

        {/* Category Selection */}
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <Button
                key={cat.name}
                variant={selectedCategory === cat.name ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat.name)}
                className="gap-2"
              >
                <IconComponent className={`w-4 h-4 ${cat.color}`} />
                {cat.label}
              </Button>
            );
          })}
        </div>

        {/* Timeframe & View Options */}
        <div className="flex flex-wrap gap-3 justify-center">
          {['day', 'week', 'month', 'year', 'all_time'].map((tf) => (
            <Button
              key={tf}
              variant={timeframe === tf ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe(tf)}
            >
              {tf === 'all_time' ? 'All Time' : tf.charAt(0).toUpperCase() + tf.slice(1)}
            </Button>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            variant={showFriendsOnly ? 'default' : 'outline'}
            onClick={() => setShowFriendsOnly(!showFriendsOnly)}
            className="gap-2"
          >
            <Users className="w-4 h-4" />
            {showFriendsOnly ? 'Friends Only' : 'Show All'}
          </Button>
        </div>

        {/* Main Leaderboard */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">Top Creators</h2>
          <div className="space-y-3">
            {leaderboardData.map((creator) => (
              <div
                key={creator.rank}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                  creator.isYou
                    ? 'bg-accent/10 border-accent'
                    : 'bg-secondary/5 border-border hover:bg-secondary/10'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-2xl font-bold text-muted-foreground w-8 text-center">
                    {creator.rank === 1 ? '🥇' : creator.rank === 2 ? '🥈' : creator.rank === 3 ? '🥉' : creator.rank}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{creator.name}</p>
                    <p className="text-sm text-muted-foreground">{creator.streak}-day streak</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">{creator.score.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{creator.badge}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Your Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 text-center">
            <p className="text-muted-foreground text-sm">Your Rank</p>
            <p className="text-3xl font-bold text-foreground mt-2">#42</p>
            <p className="text-sm text-accent mt-1">Top 1% 🎉</p>
          </Card>
          <Card className="p-6 text-center">
            <p className="text-muted-foreground text-sm">Total Points</p>
            <p className="text-3xl font-bold text-foreground mt-2">45,000</p>
            <p className="text-sm text-green-500 mt-1">+2,500 this month</p>
          </Card>
          <Card className="p-6 text-center">
            <p className="text-muted-foreground text-sm">Current Streak</p>
            <p className="text-3xl font-bold text-foreground mt-2">18 days</p>
            <p className="text-sm text-muted-foreground mt-1">Keep it going!</p>
          </Card>
          <Card className="p-6 text-center">
            <p className="text-muted-foreground text-sm">Achievements</p>
            <p className="text-3xl font-bold text-foreground mt-2">12/28</p>
            <p className="text-sm text-muted-foreground mt-1">43% complete</p>
          </Card>
        </div>

        {/* Achievements Section */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border text-center transition-all ${
                  achievement.unlocked
                    ? 'bg-accent/10 border-accent'
                    : 'bg-secondary/5 border-border opacity-60'
                }`}
              >
                <p className="text-4xl mb-2">{achievement.icon}</p>
                <p className="font-semibold text-foreground text-sm">{achievement.title}</p>
                <p className="text-xs text-muted-foreground mt-1">+{achievement.points} pts</p>
                {!achievement.unlocked && achievement.progress && (
                  <div className="mt-3 bg-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-accent h-full transition-all"
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Badges Section */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">Badges</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { icon: '🎯', name: 'Starter', rarity: 'common' },
              { icon: '👑', name: 'Influencer', rarity: 'rare' },
              { icon: '⭐', name: 'Legend', rarity: 'epic' },
              { icon: '❤️', name: 'Philanthropist', rarity: 'rare' },
              { icon: '💡', name: 'Innovator', rarity: 'legendary' },
              { icon: '🔥', name: 'Trending', rarity: 'rare' },
            ].map((badge, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-secondary/10 border border-border text-center">
                <p className="text-3xl mb-2">{badge.icon}</p>
                <p className="text-xs font-semibold text-foreground">{badge.name}</p>
                <p className="text-xs text-muted-foreground mt-1 capitalize">{badge.rarity}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Share Achievement */}
        <Card className="p-6 bg-accent/5 border-accent">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Share Your Success</h3>
              <p className="text-sm text-muted-foreground mt-1">Let your network know about your achievements</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="w-4 h-4" />
                Twitter
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="w-4 h-4" />
                LinkedIn
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
