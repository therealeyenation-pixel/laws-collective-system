import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Plus, Trash2, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function IPTVAdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('channels');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [contentRatingFilter, setContentRatingFilter] = useState('all');
  const [m3uContent, setM3uContent] = useState('');
  const [csvContent, setCsvContent] = useState('');
  const [batchName, setBatchName] = useState('');

  // Queries
  const { data: channels, isLoading: channelsLoading } = trpc.iptvTheater.getChannels.useQuery({
    limit: 100,
    offset: 0,
  });

  const { data: batches } = trpc.iptvBulkImport?.getImportBatches?.useQuery?.({
    limit: 50,
    offset: 0,
  });

  // Mutations
  const createChannelMutation = trpc.iptvTheater.createChannel.useMutation({
    onSuccess: () => {
      toast.success('Channel created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create channel: ${error.message}`);
    },
  });

  const importM3UMutation = trpc.iptvBulkImport?.importFromM3U?.useMutation?.({
    onSuccess: (data) => {
      toast.success(`Imported ${data.totalImported} channels`);
      setM3uContent('');
      setBatchName('');
    },
    onError: (error) => {
      toast.error(`Import failed: ${error.message}`);
    },
  });

  const importCSVMutation = trpc.iptvBulkImport?.importFromCSV?.useMutation?.({
    onSuccess: (data) => {
      toast.success(`Imported ${data.totalImported} channels`);
      setCsvContent('');
      setBatchName('');
    },
    onError: (error) => {
      toast.error(`Import failed: ${error.message}`);
    },
  });

  const deleteChannelMutation = trpc.iptvTheater.deleteChannel?.useMutation?.({
    onSuccess: () => {
      toast.success('Channel deleted');
    },
  });

  const handleImportM3U = () => {
    if (!m3uContent.trim() || !batchName.trim()) {
      toast.error('Please provide M3U content and batch name');
      return;
    }
    importM3UMutation.mutate({
      m3uContent,
      batchName,
      defaultAccessLevel: 'public',
    });
  };

  const handleImportCSV = () => {
    if (!csvContent.trim() || !batchName.trim()) {
      toast.error('Please provide CSV content and batch name');
      return;
    }
    importCSVMutation.mutate({
      csvContent,
      batchName,
    });
  };

  const handleCreateChannel = () => {
    createChannelMutation.mutate({
      name: 'New Channel',
      category: 'entertainment',
      description: 'New channel description',
    });
  };

  // Filter channels
  const filteredChannels = channels?.filter((channel) => {
    const matchesSearch =
      channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      channel.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || channel.category === categoryFilter;
    const matchesRating = contentRatingFilter === 'all' || channel.contentRating === contentRatingFilter;
    return matchesSearch && matchesCategory && matchesRating;
  });

  if (!user?.role || !['admin', 'staff'].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <p className="text-center text-muted-foreground">
            You do not have permission to access this panel.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">IPTV Theater Admin Panel</h1>
          <p className="text-muted-foreground">Manage channels, import content, and configure access controls</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="channels">Channels ({channels?.length || 0})</TabsTrigger>
            <TabsTrigger value="import-m3u">Import M3U</TabsTrigger>
            <TabsTrigger value="import-csv">Import CSV</TabsTrigger>
            <TabsTrigger value="batches">Batches</TabsTrigger>
          </TabsList>

          {/* Channels Tab */}
          <TabsContent value="channels" className="mt-6 space-y-4">
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search channels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="all">All Categories</option>
                <option value="live">Live</option>
                <option value="sports">Sports</option>
                <option value="entertainment">Entertainment</option>
                <option value="educational">Educational</option>
                <option value="news">News</option>
              </select>
              <select
                value={contentRatingFilter}
                onChange={(e) => setContentRatingFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="all">All Ratings</option>
                <option value="G">G</option>
                <option value="PG">PG</option>
                <option value="PG-13">PG-13</option>
                <option value="R">R</option>
                <option value="NC-17">NC-17</option>
                <option value="X">X (Adult)</option>
              </select>
              <Button onClick={handleCreateChannel} className="gap-2">
                <Plus className="w-4 h-4" />
                New Channel
              </Button>
            </div>

            {channelsLoading ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Loading channels...</p>
              </Card>
            ) : filteredChannels && filteredChannels.length > 0 ? (
              <div className="grid gap-4">
                {filteredChannels.map((channel) => (
                  <Card key={channel.id} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">{channel.name}</h3>
                          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                            {channel.category}
                          </span>
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                            {channel.contentRating}
                          </span>
                          {channel.isAdultContent && (
                            <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                              18+
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {channel.description}
                        </p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>👥 {channel.currentViewers} watching</span>
                          <span>📊 {channel.totalViewers} total</span>
                          <span>🔗 {channel.accessLevel}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteChannelMutation.mutate({ channelId: channel.id })}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No channels found. Import channels to get started.</p>
              </Card>
            )}
          </TabsContent>

          {/* Import M3U Tab */}
          <TabsContent value="import-m3u" className="mt-6 space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Import from M3U Playlist
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Batch Name
                  </label>
                  <Input
                    placeholder="e.g., IPTV-2024-Q1"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    M3U Content
                  </label>
                  <textarea
                    placeholder={`#EXTINF:-1 tvg-id="1" tvg-name="Channel 1" tvg-logo="logo.png" group-title="Entertainment",Channel 1
http://stream.url/channel1.m3u8

#EXTINF:-1 tvg-id="2" tvg-name="Channel 2" group-title="Sports",Channel 2
http://stream.url/channel2.m3u8`}
                    value={m3uContent}
                    onChange={(e) => setM3uContent(e.target.value)}
                    className="w-full h-64 p-3 border border-border rounded-md bg-background text-foreground font-mono text-sm"
                  />
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-md">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Format:</strong> Standard M3U playlist format. Supports tvg-id, tvg-name, tvg-logo, and group-title attributes.
                    Channels with "adult" or "xxx" in the name will be automatically marked as 18+ content.
                  </p>
                </div>

                <Button
                  onClick={handleImportM3U}
                  disabled={importM3UMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {importM3UMutation.isPending ? 'Importing...' : 'Import Channels'}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Import CSV Tab */}
          <TabsContent value="import-csv" className="mt-6 space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Import from CSV
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Batch Name
                  </label>
                  <Input
                    placeholder="e.g., IPTV-2024-Q1"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    CSV Content
                  </label>
                  <textarea
                    placeholder={`name,description,category,streamUrl,contentRating,isAdultContent,accessLevel
Channel 1,Description 1,Entertainment,http://stream.url/1.m3u8,G,false,public
Channel 2,Description 2,Sports,http://stream.url/2.m3u8,PG,false,public
Adult Channel,Adult Content,Adult,http://stream.url/adult.m3u8,X,true,verified_18`}
                    value={csvContent}
                    onChange={(e) => setCsvContent(e.target.value)}
                    className="w-full h-64 p-3 border border-border rounded-md bg-background text-foreground font-mono text-sm"
                  />
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-md">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Columns:</strong> name, description, category, streamUrl, contentRating, isAdultContent, accessLevel
                  </p>
                </div>

                <Button
                  onClick={handleImportCSV}
                  disabled={importCSVMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {importCSVMutation.isPending ? 'Importing...' : 'Import Channels'}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Batches Tab */}
          <TabsContent value="batches" className="mt-6 space-y-4">
            {batches && batches.length > 0 ? (
              <div className="grid gap-4">
                {batches.map((batch: any) => (
                  <Card key={batch.batchId} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{batch.batchId}</h3>
                        <p className="text-sm text-muted-foreground">
                          {batch.count} channels • Imported {new Date(batch.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No import batches yet.</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
