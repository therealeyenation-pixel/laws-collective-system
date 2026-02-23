import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { 
  Sparkles, Zap, Bug, Shield, AlertTriangle, 
  ChevronRight, ChevronLeft, X, Bell, Check
} from "lucide-react";

interface ChangelogEntry {
  id: number;
  version: string;
  title: string;
  description?: string | null;
  changeType: "feature" | "improvement" | "fix" | "security" | "breaking";
  category?: string | null;
  highlights?: string[] | null;
  releaseDate: Date;
  isMajor: boolean;
}

interface WhatsNewProps {
  onClose?: () => void;
  showOnlyIfUnread?: boolean;
}

export default function WhatsNew({ onClose, showOnlyIfUnread = true }: WhatsNewProps) {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const { data: unreadData, refetch } = trpc.changelog.getUnread.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const dismissMutation = trpc.changelog.dismiss.useMutation({
    onSuccess: () => refetch(),
  });

  const dismissAllMutation = trpc.changelog.dismissAll.useMutation({
    onSuccess: () => {
      refetch();
      setOpen(false);
      onClose?.();
    },
  });

  const setDontShowMutation = trpc.changelog.setDontShowAgain.useMutation();

  useEffect(() => {
    if (unreadData?.hasUnread && showOnlyIfUnread) {
      setOpen(true);
    }
  }, [unreadData?.hasUnread, showOnlyIfUnread]);

  const entries = unreadData?.entries || [];
  const currentEntry = entries[currentIndex];

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case "feature":
        return <Sparkles className="w-4 h-4" />;
      case "improvement":
        return <Zap className="w-4 h-4" />;
      case "fix":
        return <Bug className="w-4 h-4" />;
      case "security":
        return <Shield className="w-4 h-4" />;
      case "breaking":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getChangeTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      feature: "bg-green-100 text-green-800",
      improvement: "bg-blue-100 text-blue-800",
      fix: "bg-amber-100 text-amber-800",
      security: "bg-purple-100 text-purple-800",
      breaking: "bg-red-100 text-red-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const handleNext = () => {
    if (currentEntry) {
      dismissMutation.mutate({ changelogId: currentEntry.id });
    }
    if (currentIndex < entries.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleClose = () => {
    if (dontShowAgain) {
      setDontShowMutation.mutate({ dontShow: true });
    }
    dismissAllMutation.mutate();
  };

  const handleDismissAll = () => {
    if (dontShowAgain) {
      setDontShowMutation.mutate({ dontShow: true });
    }
    dismissAllMutation.mutate();
  };

  if (!isAuthenticated || entries.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        handleClose();
      }
      setOpen(isOpen);
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              What's New
            </DialogTitle>
            {entries.length > 1 && (
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} of {entries.length}
              </span>
            )}
          </div>
          <DialogDescription>
            See what's been added or improved in the latest updates
          </DialogDescription>
        </DialogHeader>

        {currentEntry && (
          <div className="space-y-4">
            {/* Version and Type */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="font-mono">
                v{currentEntry.version}
              </Badge>
              <Badge className={getChangeTypeBadge(currentEntry.changeType)}>
                {getChangeTypeIcon(currentEntry.changeType)}
                <span className="ml-1 capitalize">{currentEntry.changeType}</span>
              </Badge>
              {currentEntry.isMajor && (
                <Badge className="bg-primary text-primary-foreground">
                  Major Update
                </Badge>
              )}
              {currentEntry.category && (
                <Badge variant="secondary">{currentEntry.category}</Badge>
              )}
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold">{currentEntry.title}</h3>

            {/* Description */}
            {currentEntry.description && (
              <p className="text-sm text-muted-foreground">
                {currentEntry.description}
              </p>
            )}

            {/* Highlights */}
            {currentEntry.highlights && currentEntry.highlights.length > 0 && (
              <ScrollArea className="max-h-48">
                <ul className="space-y-2">
                  {currentEntry.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}

            {/* Release Date */}
            <p className="text-xs text-muted-foreground">
              Released: {new Date(currentEntry.releaseDate).toLocaleDateString()}
            </p>
          </div>
        )}

        <DialogFooter className="flex-col gap-4 sm:flex-col">
          {/* Don't show again checkbox */}
          <div className="flex items-center space-x-2 w-full">
            <Checkbox
              id="dontShowAgain"
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
            />
            <label
              htmlFor="dontShowAgain"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Don't show these notifications again
            </label>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between w-full gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismissAll}
            >
              Skip All
            </Button>

            <Button
              size="sm"
              onClick={handleNext}
            >
              {currentIndex === entries.length - 1 ? "Done" : "Next"}
              {currentIndex < entries.length - 1 && (
                <ChevronRight className="w-4 h-4 ml-1" />
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Trigger button component for manual access
export function WhatsNewButton() {
  const { isAuthenticated } = useAuth();
  const [showDialog, setShowDialog] = useState(false);

  const { data: unreadData } = trpc.changelog.getUnread.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setShowDialog(true)}
      >
        <Bell className="w-4 h-4" />
        {unreadData?.hasUnread && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
            {unreadData.unreadCount > 9 ? "9+" : unreadData.unreadCount}
          </span>
        )}
      </Button>

      {showDialog && (
        <WhatsNew 
          showOnlyIfUnread={false}
          onClose={() => setShowDialog(false)}
        />
      )}
    </>
  );
}
