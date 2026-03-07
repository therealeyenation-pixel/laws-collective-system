import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function QRHolding() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/10 px-4">
      <div className="max-w-md text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Coming Soon
          </h1>
          <p className="text-lg text-muted-foreground">
            The L.A.W.S. Collective Platform
          </p>
        </div>

        <div className="space-y-4 pt-8">
          <p className="text-foreground leading-relaxed">
            We're building something revolutionary for sovereign wealth management and multi-generational prosperity.
          </p>
          <p className="text-sm text-muted-foreground">
            Join our waitlist to be among the first to access the platform.
          </p>
        </div>

        <div className="space-y-4 pt-8">
          <Button 
            className="w-full" 
            size="lg"
            onClick={() => window.location.href = "/#waitlist"}
          >
            <Mail className="w-4 h-4 mr-2" />
            Join Waitlist
          </Button>
          <p className="text-xs text-muted-foreground">
            Scan this QR code again soon for full platform access
          </p>
        </div>

        <div className="pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground">
            For more information, visit the main site or contact us
          </p>
        </div>
      </div>
    </div>
  );
}
