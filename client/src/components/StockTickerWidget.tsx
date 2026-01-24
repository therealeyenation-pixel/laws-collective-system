import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Bell,
  AlertTriangle,
  DollarSign,
  Calendar,
  FileText,
  Users,
  Pause,
  Play,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  PieChart,
  BarChart3,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface StockTickerWidgetProps {
  entityId?: number;
  showAlerts?: boolean;
  showStats?: boolean;
  compact?: boolean;
  className?: string;
}

const alertTypeIcons: Record<string, React.ReactNode> = {
  price_up: <TrendingUp className="w-4 h-4 text-green-500" />,
  price_down: <TrendingDown className="w-4 h-4 text-red-500" />,
  earnings_upcoming: <Calendar className="w-4 h-4 text-blue-500" />,
  earnings_released: <BarChart3 className="w-4 h-4 text-purple-500" />,
  dividend_announced: <DollarSign className="w-4 h-4 text-green-500" />,
  dividend_ex_date: <Calendar className="w-4 h-4 text-green-600" />,
  sec_filing: <FileText className="w-4 h-4 text-gray-500" />,
  analyst_upgrade: <TrendingUp className="w-4 h-4 text-green-500" />,
  analyst_downgrade: <TrendingDown className="w-4 h-4 text-red-500" />,
  insider_buy: <Users className="w-4 h-4 text-green-500" />,
  insider_sell: <Users className="w-4 h-4 text-orange-500" />,
  news_major: <Bell className="w-4 h-4 text-blue-500" />,
  "52_week_high": <TrendingUp className="w-4 h-4 text-green-600" />,
  "52_week_low": <TrendingDown className="w-4 h-4 text-red-600" />,
};

const alertTypeLabels: Record<string, string> = {
  price_up: "Price Up",
  price_down: "Price Down",
  earnings_upcoming: "Earnings Coming",
  earnings_released: "Earnings Released",
  dividend_announced: "Dividend Announced",
  dividend_ex_date: "Dividend Ex-Date",
  sec_filing: "SEC Filing",
  analyst_upgrade: "Analyst Upgrade",
  analyst_downgrade: "Analyst Downgrade",
  insider_buy: "Insider Purchase",
  insider_sell: "Insider Sale",
  news_major: "Major News",
  "52_week_high": "52-Week High",
  "52_week_low": "52-Week Low",
};

export function StockTickerWidget({
  entityId,
  showAlerts = true,
  showStats = true,
  compact = false,
  className = "",
}: StockTickerWidgetProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const tickerRef = useRef<HTMLDivElement>(null);

  const { data: tickerData, isLoading: loadingTicker } = trpc.stockTicker.getTickerData.useQuery({
    entityId,
    includeAlerts: showAlerts,
  });

  const { data: stats } = trpc.stockTicker.getPortfolioStats.useQuery(
    { entityId },
    { enabled: showStats }
  );

  const { data: alerts } = trpc.stockTicker.listAlerts.useQuery(
    { unreadOnly: true, limit: 20 },
    { enabled: showAlerts }
  );

  const holdings = tickerData?.holdings || [];

  // Auto-scroll through holdings
  useEffect(() => {
    if (isPaused || holdings.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % holdings.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused, holdings.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + holdings.length) % holdings.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % holdings.length);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  const currentHolding = holdings[currentIndex];

  if (loadingTicker) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    // Compact scrolling ticker view
    return (
      <Card className={`overflow-hidden ${className}`}>
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="flex items-center">
            {/* Scrolling ticker */}
            <div
              ref={tickerRef}
              className="flex-1 overflow-hidden whitespace-nowrap py-2 px-4"
            >
              <div className="inline-flex gap-8 animate-scroll">
                {holdings.map((holding, idx) => (
                  <span key={idx} className="inline-flex items-center gap-2">
                    <span className="font-bold">{holding.symbol}</span>
                    <span>{formatCurrency(holding.price)}</span>
                    <span
                      className={`flex items-center ${
                        holding.changePercent >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {holding.changePercent >= 0 ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {formatPercent(holding.changePercent)}
                    </span>
                  </span>
                ))}
                {/* Duplicate for seamless loop */}
                {holdings.map((holding, idx) => (
                  <span key={`dup-${idx}`} className="inline-flex items-center gap-2">
                    <span className="font-bold">{holding.symbol}</span>
                    <span>{formatCurrency(holding.price)}</span>
                    <span
                      className={`flex items-center ${
                        holding.changePercent >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {holding.changePercent >= 0 ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {formatPercent(holding.changePercent)}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Alert indicator */}
            {alerts && alerts.length > 0 && (
              <div className="px-3 border-l border-slate-700">
                <Badge variant="destructive" className="animate-pulse">
                  <Bell className="w-3 h-3 mr-1" />
                  {alerts.length}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Full widget view
  return (
    <>
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Portfolio Ticker
            </CardTitle>
            {alerts && alerts.length > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                <Bell className="w-3 h-3 mr-1" />
                {alerts.length} alerts
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Portfolio Summary */}
          {showStats && stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-2 bg-muted rounded">
                <p className="text-lg font-bold">{formatCurrency(stats.totalValue)}</p>
                <p className="text-xs text-muted-foreground">Total Value</p>
              </div>
              <div className={`text-center p-2 rounded ${stats.dayChange >= 0 ? "bg-green-100 dark:bg-green-950/30" : "bg-red-100 dark:bg-red-950/30"}`}>
                <p className={`text-lg font-bold ${stats.dayChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(stats.dayChange)}
                </p>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
              <div className={`text-center p-2 rounded ${stats.totalGain >= 0 ? "bg-green-100 dark:bg-green-950/30" : "bg-red-100 dark:bg-red-950/30"}`}>
                <p className={`text-lg font-bold ${stats.totalGain >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatPercent(stats.totalGainPercent)}
                </p>
                <p className="text-xs text-muted-foreground">Total Return</p>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <p className="text-lg font-bold">{stats.holdingsCount}</p>
                <p className="text-xs text-muted-foreground">Holdings</p>
              </div>
            </div>
          )}

          {/* Current Stock Display */}
          {currentHolding && (
            <div className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevious}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex-1 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-2xl font-bold">{currentHolding.symbol}</span>
                    <Badge variant="outline" className="text-xs">
                      {currentHolding.shares} shares
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {currentHolding.companyName}
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-xl font-semibold">
                      {formatCurrency(currentHolding.price)}
                    </span>
                    <span
                      className={`flex items-center text-lg font-medium ${
                        currentHolding.changePercent >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {currentHolding.changePercent >= 0 ? (
                        <TrendingUp className="w-5 h-5 mr-1" />
                      ) : currentHolding.changePercent < 0 ? (
                        <TrendingDown className="w-5 h-5 mr-1" />
                      ) : (
                        <Minus className="w-5 h-5 mr-1" />
                      )}
                      {formatPercent(currentHolding.changePercent)}
                    </span>
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="text-muted-foreground">Value: </span>
                    <span className="font-medium">{formatCurrency(currentHolding.value)}</span>
                    <span className="mx-2">|</span>
                    <span className="text-muted-foreground">Gain: </span>
                    <span className={currentHolding.gain >= 0 ? "text-green-600" : "text-red-600"}>
                      {formatCurrency(currentHolding.gain)}
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  className="h-8 w-8"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-1 mt-3">
                {holdings.slice(0, 10).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === currentIndex ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  />
                ))}
                {holdings.length > 10 && (
                  <span className="text-xs text-muted-foreground ml-1">
                    +{holdings.length - 10}
                  </span>
                )}
              </div>

              {/* Play/Pause */}
              <div className="flex justify-center mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPaused(!isPaused)}
                  className="text-xs"
                >
                  {isPaused ? (
                    <>
                      <Play className="w-3 h-3 mr-1" /> Resume
                    </>
                  ) : (
                    <>
                      <Pause className="w-3 h-3 mr-1" /> Pause
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {holdings.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <PieChart className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No portfolio holdings tracked</p>
              <Button variant="outline" size="sm" className="mt-2" asChild>
                <a href="/investments">Manage Portfolio</a>
              </Button>
            </div>
          )}

          {/* Recent Alerts */}
          {showAlerts && alerts && alerts.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Recent Alerts
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {alerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-2 rounded border cursor-pointer hover:bg-accent/50 transition-colors ${
                      !alert.isRead ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200" : "border-border"
                    }`}
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <div className="flex items-start gap-2">
                      {alertTypeIcons[alert.alertType] || <Bell className="w-4 h-4" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{alert.symbol}</span>
                          <Badge variant="outline" className="text-xs">
                            {alertTypeLabels[alert.alertType]}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {alert.title}
                        </p>
                      </div>
                      {alert.changePercent && (
                        <span
                          className={`text-sm font-medium ${
                            Number(alert.changePercent) >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {formatPercent(Number(alert.changePercent))}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Detail Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAlert && alertTypeIcons[selectedAlert.alertType]}
              {selectedAlert?.symbol} - {selectedAlert && alertTypeLabels[selectedAlert.alertType]}
            </DialogTitle>
          </DialogHeader>

          {selectedAlert && (
            <div className="space-y-4">
              <p className="text-sm">{selectedAlert.title}</p>
              
              {selectedAlert.description && (
                <p className="text-sm text-muted-foreground">{selectedAlert.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedAlert.priceAtAlert && (
                  <div>
                    <p className="text-xs text-muted-foreground">Price at Alert</p>
                    <p className="font-medium">{formatCurrency(Number(selectedAlert.priceAtAlert))}</p>
                  </div>
                )}
                {selectedAlert.changePercent && (
                  <div>
                    <p className="text-xs text-muted-foreground">Change</p>
                    <p className={`font-medium ${Number(selectedAlert.changePercent) >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatPercent(Number(selectedAlert.changePercent))}
                    </p>
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(selectedAlert.createdAt), { addSuffix: true })}
              </p>

              {selectedAlert.sourceUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={selectedAlert.sourceUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Source
                  </a>
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </>
  );
}

export default StockTickerWidget;
