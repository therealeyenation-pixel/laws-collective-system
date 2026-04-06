import { VODSection } from '@/components/VODSection';

export default function VideoOnDemand() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border sticky top-0 z-40 bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">Video on Demand</h1>
          <p className="text-sm text-muted-foreground mt-1">Browse and watch movies</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto">
        <VODSection />
      </div>
    </div>
  );
}
