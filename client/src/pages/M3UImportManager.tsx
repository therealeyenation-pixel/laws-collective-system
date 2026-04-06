import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const SAMPLE_M3U = `#EXTM3U
#EXTINF:-1 tvg-id="bbc1.uk" tvg-name="BBC One" tvg-logo="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/BBC_One.svg/512px-BBC_One.svg.png" group-title="News",BBC One
http://iptv.example.com/live/bbc1
#EXTINF:-1 tvg-id="bbc2.uk" tvg-name="BBC Two" tvg-logo="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/BBC_Two.svg/512px-BBC_Two.svg.png" group-title="News",BBC Two
http://iptv.example.com/live/bbc2
#EXTINF:-1 tvg-id="cnn.us" tvg-name="CNN" tvg-logo="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/CNN.svg/512px-CNN.svg.png" group-title="News",CNN
http://iptv.example.com/live/cnn
#EXTINF:-1 tvg-id="espn.us" tvg-name="ESPN" tvg-logo="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/ESPN.svg/512px-ESPN.svg.png" group-title="Sports",ESPN
http://iptv.example.com/live/espn
#EXTINF:-1 tvg-id="nfl.us" tvg-name="NFL Network" tvg-logo="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/NFL_Network_logo.svg/512px-NFL_Network_logo.svg.png" group-title="Sports",NFL Network
http://iptv.example.com/live/nfl
#EXTINF:-1 tvg-id="netflix.us" tvg-name="Netflix" tvg-logo="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/512px-Netflix_2015_logo.svg.png" group-title="Entertainment",Netflix
http://iptv.example.com/live/netflix
#EXTINF:-1 tvg-id="hbo.us" tvg-name="HBO" tvg-logo="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/HBO_logo.svg/512px-HBO_logo.svg.png" group-title="Entertainment",HBO
http://iptv.example.com/live/hbo
#EXTINF:-1 tvg-id="mtv.us" tvg-name="MTV" tvg-logo="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/MTV_2010_logo.svg/512px-MTV_2010_logo.svg.png" group-title="Music",MTV
http://iptv.example.com/live/mtv
#EXTINF:-1 tvg-id="natgeo.us" tvg-name="National Geographic" tvg-logo="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/National_Geographic_logo.svg/512px-National_Geographic_logo.svg.png" group-title="Educational",National Geographic
http://iptv.example.com/live/natgeo
#EXTINF:-1 tvg-id="cartoon.us" tvg-name="Cartoon Network" tvg-logo="https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Cartoon_Network_2010_logo.svg/512px-Cartoon_Network_2010_logo.svg.png" group-title="Kids",Cartoon Network
http://iptv.example.com/live/cartoon`;

export default function M3UImportManager() {
  const [m3uContent, setM3uContent] = useState("");
  const [parsedChannels, setParsedChannels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const parseM3UMutation = trpc.m3uBulkImport.parseM3U.useMutation({
    onSuccess: (data) => {
      setParsedChannels(data.parsedChannels);
      toast.success(`Parsed ${data.count} channels`);
    },
    onError: (error) => {
      toast.error("Failed to parse M3U");
      console.error(error);
    },
  });

  const importChannelsMutation = trpc.m3uBulkImport.importChannels.useMutation({
    onSuccess: (data) => {
      setImportStatus(
        `Successfully imported ${data.insertedCount}/${data.totalAttempted} channels`
      );
      toast.success(data.message);
      setParsedChannels([]);
      setM3uContent("");
    },
    onError: (error) => {
      toast.error("Import failed");
      console.error(error);
    },
  });

  const handleParseM3U = () => {
    if (!m3uContent.trim()) {
      toast.error("Please enter M3U content");
      return;
    }
    setIsLoading(true);
    parseM3UMutation.mutate({ m3uContent });
    setIsLoading(false);
  };

  const handleImportChannels = () => {
    if (parsedChannels.length === 0) {
      toast.error("No channels to import");
      return;
    }
    importChannelsMutation.mutate({ channels: parsedChannels });
  };

  const handleLoadSample = () => {
    setM3uContent(SAMPLE_M3U);
    setParsedChannels([]);
    setImportStatus(null);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            M3U Playlist Import Manager
          </h1>
          <p className="text-muted-foreground">
            Import IPTV channels from M3U playlists
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* M3U Input */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Step 1: Paste M3U Content
            </h2>
            <textarea
              value={m3uContent}
              onChange={(e) => setM3uContent(e.target.value)}
              placeholder="Paste M3U playlist content here..."
              className="w-full h-64 p-3 border border-border rounded-lg bg-background text-foreground font-mono text-sm resize-none"
            />
            <div className="flex gap-2 mt-4">
              <Button onClick={handleParseM3U} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Parse M3U
                  </>
                )}
              </Button>
              <Button
                onClick={handleLoadSample}
                variant="outline"
                disabled={isLoading}
              >
                Load Sample
              </Button>
            </div>
          </Card>

          {/* Parsed Channels Preview */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Step 2: Review Channels ({parsedChannels.length})
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {parsedChannels.length > 0 ? (
                parsedChannels.map((channel, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-secondary/50 rounded border border-border text-sm"
                  >
                    <div className="font-semibold text-foreground">
                      {channel.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {channel.category}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Parse M3U to see channels
                </p>
              )}
            </div>
            {parsedChannels.length > 0 && (
              <Button
                onClick={handleImportChannels}
                className="w-full mt-4"
                disabled={importChannelsMutation.isPending}
              >
                {importChannelsMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Import {parsedChannels.length} Channels
                  </>
                )}
              </Button>
            )}
          </Card>
        </div>

        {/* Import Status */}
        {importStatus && (
          <Card className="mt-6 p-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-foreground">Import Complete</h3>
                <p className="text-sm text-muted-foreground">{importStatus}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-8 p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            How to Use
          </h3>
          <ol className="space-y-2 text-sm text-foreground list-decimal list-inside">
            <li>Click "Load Sample" to see example M3U format</li>
            <li>Paste your M3U playlist content in the left panel</li>
            <li>Click "Parse M3U" to extract channels</li>
            <li>Review channels in the right panel</li>
            <li>Click "Import Channels" to add them to the database</li>
            <li>Channels will be available in Theater Live immediately</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
