import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Newspaper, ExternalLink, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  source: string;
  category: string;
  url?: string;
  publishedAt: string;
}

interface NewsWidgetProps {
  className?: string;
  compact?: boolean;
  categories?: string[];
}

// Sample news data - in production this would come from an API
const sampleNews: NewsItem[] = [
  {
    id: "1",
    title: "IRS Announces 2025 Tax Brackets and Standard Deduction Increases",
    source: "IRS.gov",
    category: "Tax",
    publishedAt: "2025-01-30",
  },
  {
    id: "2",
    title: "Small Business Administration Opens New Grant Applications",
    source: "SBA.gov",
    category: "Grants",
    publishedAt: "2025-01-29",
  },
  {
    id: "3",
    title: "Federal Reserve Holds Interest Rates Steady",
    source: "Federal Reserve",
    category: "Finance",
    publishedAt: "2025-01-28",
  },
  {
    id: "4",
    title: "New Nonprofit Compliance Requirements Take Effect",
    source: "Treasury Dept",
    category: "Compliance",
    publishedAt: "2025-01-27",
  },
  {
    id: "5",
    title: "State of Georgia Updates LLC Filing Requirements",
    source: "GA SOS",
    category: "Business",
    publishedAt: "2025-01-26",
  },
  {
    id: "6",
    title: "Community Development Block Grants Now Available",
    source: "HUD",
    category: "Grants",
    publishedAt: "2025-01-25",
  },
];

const categoryColors: Record<string, string> = {
  Tax: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Grants: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  Finance: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  Compliance: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  Business: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
};

export function NewsWidget({ className = "", compact = false, categories }: NewsWidgetProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  // Filter news by categories if provided
  const filteredNews = categories 
    ? sampleNews.filter(news => categories.includes(news.category))
    : sampleNews;

  // Auto-rotate news every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying || filteredNews.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredNews.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying, filteredNews.length]);

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + filteredNews.length) % filteredNews.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % filteredNews.length);
  };

  if (filteredNews.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-12 text-muted-foreground">
            <Newspaper className="w-5 h-5 mr-2" />
            <span className="text-sm">No news available</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentNews = filteredNews[currentIndex];

  if (compact) {
    return (
      <div className={`bg-primary/5 border-b border-primary/10 ${className}`}>
        <div className="container max-w-7xl">
          <div className="flex items-center gap-4 py-2 px-4">
            <div className="flex items-center gap-2 text-primary">
              <Newspaper className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">News</span>
            </div>
            <div className="flex-1 flex items-center gap-3 overflow-hidden">
              <Badge className={`text-xs shrink-0 ${categoryColors[currentNews.category] || ''}`}>
                {currentNews.category}
              </Badge>
              <p className="text-sm truncate">{currentNews.title}</p>
              <span className="text-xs text-muted-foreground shrink-0">— {currentNews.source}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handlePrev}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs text-muted-foreground w-8 text-center">
                {currentIndex + 1}/{filteredNews.length}
              </span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleNext}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            Latest News
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrev}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-muted-foreground w-10 text-center">
              {currentIndex + 1} / {filteredNews.length}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <Badge className={categoryColors[currentNews.category] || ''}>
              {currentNews.category}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(currentNews.publishedAt).toLocaleDateString()}
            </span>
          </div>
          <h3 className="font-medium leading-tight">{currentNews.title}</h3>
          <p className="text-sm text-muted-foreground">Source: {currentNews.source}</p>
        </div>
        
        {/* News indicators */}
        <div className="flex justify-center gap-1.5 pt-2">
          {filteredNews.map((_, idx) => (
            <button
              key={idx}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentIndex(idx);
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function NewsBanner({ className = "" }: { className?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sampleNews.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const currentNews = sampleNews[currentIndex];

  return (
    <div className={`bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b border-primary/20 ${className}`}>
      <div className="container max-w-7xl">
        <div className="flex items-center gap-4 py-2.5 px-4">
          <div className="flex items-center gap-2 text-primary shrink-0">
            <Newspaper className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Breaking</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs shrink-0">
                {currentNews.category}
              </Badge>
              <p className="text-sm font-medium truncate">{currentNews.title}</p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">
            {currentNews.source}
          </span>
        </div>
      </div>
    </div>
  );
}

export default NewsWidget;
