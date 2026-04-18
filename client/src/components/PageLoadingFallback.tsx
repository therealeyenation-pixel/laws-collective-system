/**
 * PageLoadingFallback — Branded loading screen for lazy-loaded page transitions.
 * Displays the LuvOnPurpose branding with an animated spinner while chunks load.
 */
export function PageLoadingFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/10 gap-6">
      {/* Animated logo mark */}
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg animate-pulse">
          <span className="text-white text-2xl font-bold">L</span>
        </div>
        {/* Orbiting ring */}
        <div className="absolute inset-0 w-16 h-16 rounded-2xl border-2 border-amber-400/30 animate-spin" style={{ animationDuration: '3s' }} />
      </div>

      {/* Brand text */}
      <div className="text-center space-y-1">
        <h2 className="text-lg font-semibold text-foreground tracking-wide">LuvOnPurpose</h2>
        <p className="text-sm text-muted-foreground">Loading your experience...</p>
      </div>

      {/* Progress bar */}
      <div className="w-48 h-1 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
          style={{
            animation: 'loading-bar 1.5s ease-in-out infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { width: 0%; margin-left: 0; }
          50% { width: 60%; margin-left: 20%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}
