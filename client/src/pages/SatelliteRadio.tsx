import { RadioSection } from '@/components/RadioSection';

export default function SatelliteRadio() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border sticky top-0 z-40 bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">Satellite Radio</h1>
          <p className="text-sm text-muted-foreground mt-1">Browse and listen to music stations by genre</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto">
        <RadioSection />
      </div>
    </div>
  );
}
