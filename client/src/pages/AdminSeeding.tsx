/**
 * Admin Seeding Page
 * Populate database with initial IPTV channels and VOD content
 * Admin only - protected route
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader2, Database } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { useAuth } from '@/_core/hooks/useAuth';

export default function AdminSeeding() {
  const { user } = useAuth();
  const [seedingStatus, setSeedingStatus] = useState<{
    channels?: { success: boolean; created: number };
    movies?: { success: boolean; created: number };
    series?: { success: boolean; created: number };
  }>({});

  // Seeding mutations
  const { mutate: seedChannels, isPending: seedingChannels } =
    trpc.adminSeed.seedIPTVChannels.useMutation({
      onSuccess: (result) => {
        setSeedingStatus((prev) => ({ ...prev, channels: result }));
        toast.success(`✓ Created ${result.created} IPTV channels`);
      },
      onError: (error) => {
        toast.error(`Failed to seed channels: ${error.message}`);
      },
    });

  const { mutate: seedMovies, isPending: seedingMovies } =
    trpc.adminSeed.seedVODMovies.useMutation({
      onSuccess: (result) => {
        setSeedingStatus((prev) => ({ ...prev, movies: result }));
        toast.success(`✓ Created ${result.created} VOD movies`);
      },
      onError: (error) => {
        toast.error(`Failed to seed movies: ${error.message}`);
      },
    });

  const { mutate: seedSeries, isPending: seedingSeries } =
    trpc.adminSeed.seedVODSeries.useMutation({
      onSuccess: (result) => {
        setSeedingStatus((prev) => ({ ...prev, series: result }));
        toast.success(`✓ Created ${result.created} VOD series`);
      },
      onError: (error) => {
        toast.error(`Failed to seed series: ${error.message}`);
      },
    });

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <h1 className="text-xl font-bold">Access Denied</h1>
          </div>
          <p className="text-muted-foreground">
            Only administrators can access this page.
          </p>
        </Card>
      </div>
    );
  }

  const isSeeding = seedingChannels || seedingMovies || seedingSeries;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Database Seeding</h1>
          <p className="text-muted-foreground">
            Populate the database with initial streaming content
          </p>
        </div>

        {/* Seeding Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* IPTV Channels */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">IPTV Channels</h2>
              {seedingStatus.channels?.success && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Seed 40+ live broadcast channels including:
              </p>
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                <li>News (BBC, CNN, Sky News)</li>
                <li>Sports (ESPN, Sky Sports)</li>
                <li>Entertainment (Netflix, HBO)</li>
                <li>International channels</li>
                <li>Adult content (18+)</li>
              </ul>
            </div>

            {seedingStatus.channels && (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded p-3">
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                  ✓ {seedingStatus.channels.created} channels created
                </p>
              </div>
            )}

            <Button
              onClick={() => seedChannels()}
              disabled={isSeeding || seedingStatus.channels?.success}
              className="w-full"
            >
              {seedingChannels && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {seedingStatus.channels?.success ? 'Completed' : 'Seed Channels'}
            </Button>
          </Card>

          {/* VOD Movies */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">VOD Movies</h2>
              {seedingStatus.movies?.success && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Seed 15 movies across genres:
              </p>
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                <li>Action & Adventure</li>
                <li>Drama & Thriller</li>
                <li>Comedy</li>
                <li>Sci-Fi & Horror</li>
                <li>Animation & Family</li>
              </ul>
            </div>

            {seedingStatus.movies && (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded p-3">
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                  ✓ {seedingStatus.movies.created} movies created
                </p>
              </div>
            )}

            <Button
              onClick={() => seedMovies()}
              disabled={isSeeding || seedingStatus.movies?.success}
              className="w-full"
            >
              {seedingMovies && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {seedingStatus.movies?.success ? 'Completed' : 'Seed Movies'}
            </Button>
          </Card>

          {/* VOD Series */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">VOD Series</h2>
              {seedingStatus.series?.success && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Seed 10 premium series:
              </p>
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                <li>Breaking Bad</li>
                <li>Game of Thrones</li>
                <li>Stranger Things</li>
                <li>The Crown</li>
                <li>And more...</li>
              </ul>
            </div>

            {seedingStatus.series && (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded p-3">
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                  ✓ {seedingStatus.series.created} series created
                </p>
              </div>
            )}

            <Button
              onClick={() => seedSeries()}
              disabled={isSeeding || seedingStatus.series?.success}
              className="w-full"
            >
              {seedingSeries && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {seedingStatus.series?.success ? 'Completed' : 'Seed Series'}
            </Button>
          </Card>
        </div>

        {/* Summary */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Seeding Summary</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded">
              <p className="text-sm text-muted-foreground mb-1">IPTV Channels</p>
              <p className="text-2xl font-bold">
                {seedingStatus.channels?.created || 0}/40
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded">
              <p className="text-sm text-muted-foreground mb-1">VOD Movies</p>
              <p className="text-2xl font-bold">
                {seedingStatus.movies?.created || 0}/15
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded">
              <p className="text-sm text-muted-foreground mb-1">VOD Series</p>
              <p className="text-2xl font-bold">
                {seedingStatus.series?.created || 0}/10
              </p>
            </div>
          </div>

          {seedingStatus.channels?.success &&
            seedingStatus.movies?.success &&
            seedingStatus.series?.success && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded">
                <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                  ✓ All content seeded successfully!
                </p>
                <p className="text-sm text-green-600 dark:text-green-500">
                  You can now visit the Theater and Broadcast pages to see live channels and
                  VOD content.
                </p>
              </div>
            )}

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded">
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">
              ℹ️ Next Steps
            </p>
            <ul className="text-sm space-y-1 text-blue-600 dark:text-blue-500 list-disc list-inside">
              <li>Visit /theater-live to see live IPTV channels</li>
              <li>Visit /theater-vod to browse movies and series</li>
              <li>Visit /broadcast-channels for radio and podcasts</li>
              <li>Use /iptv-admin to manage channels</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
