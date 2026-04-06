import { useState } from 'react';
import TheaterLiveEnhanced from './TheaterLiveEnhanced';
import { VODSection } from '@/components/VODSection';
import { RadioSection } from '@/components/RadioSection';
import { Play, Film, Radio, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TheaterLiveWrapper() {
  const [activeTab, setActiveTab] = useState<'live' | 'vod' | 'radio'>('live');

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Back Button */}
      <div className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="gap-2"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Theater Live</h1>
          <div className="w-16" /> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="sticky top-12 z-40 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('live')}
              className={`px-6 py-4 font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'live'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Play className="w-5 h-5" />
              Live Channels
            </button>
            <button
              onClick={() => setActiveTab('vod')}
              className={`px-6 py-4 font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'vod'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Film className="w-5 h-5" />
              Video on Demand
            </button>
            <button
              onClick={() => setActiveTab('radio')}
              className={`px-6 py-4 font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'radio'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Radio className="w-5 h-5" />
              Satellite Radio
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'live' && <TheaterLiveEnhanced />}
        {activeTab === 'vod' && <VODSection />}
        {activeTab === 'radio' && <RadioSection />}
      </div>
    </div>
  );
}
