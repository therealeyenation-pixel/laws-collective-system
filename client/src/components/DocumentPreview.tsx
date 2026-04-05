import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ZoomIn, ZoomOut, RotateCw, Download, FileText, File, 
  ChevronLeft, ChevronRight, Maximize2, Minimize2, Loader2
} from "lucide-react";

interface DocumentPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: {
    title: string;
    type: "pdf" | "text" | "html" | "markdown";
    content?: string;
    url?: string;
    totalPages?: number;
  } | null;
  onSign?: () => void;
  showSignButton?: boolean;
}

export function DocumentPreview({ 
  open, 
  onOpenChange, 
  document, 
  onSign,
  showSignButton = false 
}: DocumentPreviewProps) {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!document) return null;

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    if (document.totalPages) {
      setCurrentPage(prev => Math.min(prev + 1, document.totalPages!));
    }
  };

  const handleDownload = () => {
    if (document.url) {
      window.open(document.url, "_blank");
    } else if (document.content) {
      const blob = new Blob([document.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = `${document.title}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    switch (document.type) {
      case "pdf":
        if (document.url) {
          return (
            <iframe
              src={`${document.url}#page=${currentPage}`}
              className="w-full h-full border-0"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left" }}
              title={document.title}
            />
          );
        }
        return (
          <div className="flex items-center justify-center h-96 text-muted-foreground">
            <FileText className="w-12 h-12 mr-4" />
            <span>PDF preview not available</span>
          </div>
        );

      case "html":
        return (
          <div 
            className="prose dark:prose-invert max-w-none p-6"
            style={{ fontSize: `${zoom}%` }}
            dangerouslySetInnerHTML={{ __html: document.content || "" }}
          />
        );

      case "markdown":
        return (
          <div 
            className="prose dark:prose-invert max-w-none p-6 whitespace-pre-wrap"
            style={{ fontSize: `${zoom}%` }}
          >
            {document.content}
          </div>
        );

      case "text":
      default:
        return (
          <pre 
            className="p-6 whitespace-pre-wrap font-mono text-sm"
            style={{ fontSize: `${zoom}%` }}
          >
            {document.content || "No content available"}
          </pre>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${isFullscreen ? "max-w-[95vw] h-[95vh]" : "max-w-4xl h-[80vh]"} flex flex-col`}>
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {document.type === "pdf" ? (
                <File className="w-5 h-5 text-red-500" />
              ) : (
                <FileText className="w-5 h-5 text-blue-500" />
              )}
              <DialogTitle className="text-lg">{document.title}</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          </div>
          <DialogDescription>
            Review the document before signing
          </DialogDescription>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-secondary/30 rounded-lg flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={zoom <= 50}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm w-12 text-center">{zoom}%</span>
            <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={zoom >= 200}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleResetZoom}>
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>

          {document.type === "pdf" && document.totalPages && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handlePrevPage} disabled={currentPage <= 1}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {document.totalPages}
              </span>
              <Button variant="ghost" size="icon" onClick={handleNextPage} disabled={currentPage >= document.totalPages}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          <Button variant="ghost" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 border rounded-lg bg-background">
          {renderContent()}
        </ScrollArea>

        {/* Footer with Sign Button */}
        {showSignButton && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t flex-shrink-0">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={onSign}>
              I have read and agree to sign
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Simplified preview button component
interface DocumentPreviewButtonProps {
  document: {
    title: string;
    type: "pdf" | "text" | "html" | "markdown";
    content?: string;
    url?: string;
    totalPages?: number;
  };
  onSign?: () => void;
  showSignButton?: boolean;
  children?: React.ReactNode;
}

export function DocumentPreviewButton({ 
  document, 
  onSign, 
  showSignButton = false,
  children 
}: DocumentPreviewButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        {children || "Preview"}
      </Button>
      <DocumentPreview
        open={open}
        onOpenChange={setOpen}
        document={document}
        onSign={onSign}
        showSignButton={showSignButton}
      />
    </>
  );
}

export default DocumentPreview;
