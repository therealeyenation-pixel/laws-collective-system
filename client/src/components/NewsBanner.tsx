import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Newspaper, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  TrendingUp,
  AlertCircle,
  Bell,
  X
} from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: "business" | "legal" | "financial" | "education" | "announcement";
  date: string;
  url?: string;
  priority?: "high" | "normal" | "low";
}

// Sample news items - in production, these would come from an API
const NEWS_ITEMS: NewsItem[] = [
  {
    id: "1",
    title: "New Grant Opportunities for Faith-Based Organizations",
    summary: "Federal funding available for faith-based educational nonprofits. Application deadline: March 15, 2026.",
    category: "financial",
    date: "2026-01-30",
    priority: "high",
  },
  {
    id: "2",
    title: "L.A.W.S. Academy Launches New Financial Literacy Course",
    summary: "Comprehensive 12-module course now available for all members. Earn tokens while learning!",
    category: "education",
    date: "2026-01-28",
  },
  {
    id: "3",
    title: "Business Formation Tax Benefits Extended for 2026",
    summary: "IRS extends small business tax incentives through December 2026. LLC formations may qualify.",
    category: "legal",
    date: "2026-01-25",
  },
  {
    id: "4",
    title: "Quarterly Trust Distribution Scheduled",
    summary: "Q1 2026 distributions will be processed on February 15. Ensure beneficiary information is current.",
    category: "announcement",
    date: "2026-01-20",
    priority: "high",
  },
  {
    id: "5",
    title: "Real Estate Market Update: Atlanta Metro",
    summary: "Property values continue to rise in key investment areas. View our latest market analysis.",
    category: "business",
    date: "2026-01-18",
  },
];

const categoryColors: Record<NewsItem["category"], string> = {
  business: "bg-blue-100 text-blue-700 border-blue-200",
  legal: "bg-purple-100 text-purple-700 border-purple-200",
  financial: "bg-green-100 text-green-700 border-green-200",
  education: "bg-amber-100 text-amber-700 border-amber-200",
  announcement: "bg-red-100 text-red-700 border-red-200",
};

const categoryIcons: Record<NewsItem["category"], React.ReactNode> = {
  business: <TrendingUp className="w-3 h-3" />,
  legal: <AlertCircle className="w-3 h-3" />,
  financial: <TrendingUp className="w-3 h-3" />,
  education: <Newspaper className="w-3 h-3" />,
  announcement: <Bell className="w-3 h-3" />,
};

interface NewsBannerProps {
  className?: string;
  compact?: boolean;
  autoRotate?: boolean;
  rotateInterval?: number;
}

export function NewsBanner({ 
  className = "", 
  compact = false,
  autoRotate = true,
  rotateInterval = 8000 
}: NewsBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!autoRotate || isPaused || dismissed) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % NEWS_ITEMS.length);
    }, rotateInterval);

    return () => clearInterval(interval);
  }, [autoRotate, isPaused, dismissed, rotateInterval]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + NEWS_ITEMS.length) % NEWS_ITEMS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % NEWS_ITEMS.length);
  };

  if (dismissed) return null;

  const currentNews = NEWS_ITEMS[currentIndex];

  if (compact) {
    return (
      <div 
        className={`bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 ${className}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="flex items-center gap-3">
          <Newspaper className="w-4 h-4 text-green-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{currentNews.title}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handlePrevious}>
              <ChevronLeft className="w-3 h-3" />
            </Button>
            <span className="text-xs text-muted-foreground">{currentIndex + 1}/{NEWS_ITEMS.length}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleNext}>
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card 
      className={`bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <Newspaper className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={`text-xs ${categoryColors[currentNews.category]}`}>
                  {categoryIcons[currentNews.category]}
                  <span className="ml-1 capitalize">{currentNews.category}</span>
                </Badge>
                {currentNews.priority === "high" && (
                  <Badge variant="destructive" className="text-xs">Important</Badge>
                )}
                <span className="text-xs text-muted-foreground">{currentNews.date}</span>
              </div>
              <h4 className="font-medium text-foreground mb-1">{currentNews.title}</h4>
              <p className="text-sm text-muted-foreground">{currentNews.summary}</p>
              {currentNews.url && (
                <Button variant="link" size="sm" className="p-0 h-auto mt-1 text-green-600">
                  Read more <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => setDismissed(true)}
            >
              <X className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handlePrevious}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs text-muted-foreground min-w-[3ch] text-center">
                {currentIndex + 1}/{NEWS_ITEMS.length}
              </span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleNext}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        {/* Progress dots */}
        <div className="flex justify-center gap-1 mt-3">
          {NEWS_ITEMS.map((_, idx) => (
            <button
              key={idx}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                idx === currentIndex ? "bg-green-600" : "bg-green-200"
              }`}
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default NewsBanner;
