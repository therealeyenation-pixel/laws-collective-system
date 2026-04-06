import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Radio, Users, Clock, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function LiveBroadcasts() {
  const [channelId, setChannelId] = useState<number | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduledStartTime: "",
    isRecorded: true,
  });

  // Fetch all channels
  const { data: channels } = trpc.broadcast.channels.getAll.useQuery();

  // Fetch live broadcasts
  const { data: broadcasts, isLoading, refetch } = trpc.broadcast.liveBroadcasts.getAll.useQuery(
    { channelId: channelId || undefined },
    { enabled: !!channelId }
  );

  const createBroadcastMutation = trpc.broadcast.liveBroadcasts.create.useMutation({
    onSuccess: () => {
      toast.success("Broadcast scheduled successfully");
      setFormData({
        title: "",
        description: "",
        scheduledStartTime: "",
        isRecorded: true,
      });
      setIsScheduling(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Error scheduling broadcast: ${error.message}`);
    },
  });

  const updateBroadcastMutation = trpc.broadcast.liveBroadcasts.update.useMutation({
    onSuccess: () => {
      toast.success("Broadcast updated successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Error updating broadcast: ${error.message}`);
    },
  });

  const deleteBroadcastMutation = trpc.broadcast.liveBroadcasts.delete.useMutation({
    onSuccess: () => {
      toast.success("Broadcast deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Error deleting broadcast: ${error.message}`);
    },
  });

  const handleScheduleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.scheduledStartTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!channelId) {
      toast.error("Please select a channel");
      return;
    }

    await createBroadcastMutation.mutateAsync({
      channelId,
      title: formData.title,
      description: formData.description || undefined,
      scheduledStartTime: new Date(formData.scheduledStartTime),
      isRecorded: formData.isRecorded,
    });
  };

  const handleDeleteBroadcast = async (broadcastId: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this broadcast?");
    if (!confirmed) return;
    await deleteBroadcastMutation.mutateAsync({ id: broadcastId });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 animate-pulse font-semibold";
      case "scheduled":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
      case "ended":
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300";
      case "cancelled":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300";
    }
  };

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Radio className="w-8 h-8 text-red-600 animate-pulse" />
          <div>
            <h1 className="text-3xl font-bold">Live Broadcasts</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {broadcasts?.length || 0} broadcasts in selected channel
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsScheduling(!isScheduling)}
          className="gap-2"
          disabled={!channelId}
        >
          <Plus className="w-4 h-4" />
          Schedule Broadcast
        </Button>
      </div>

      {/* Channel Selection */}
      <Card className="p-4">
        <label className="block text-sm font-medium mb-2">Select Channel</label>
        <Select value={channelId?.toString() || ""} onValueChange={(val) => setChannelId(parseInt(val))}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a channel to view broadcasts..." />
          </SelectTrigger>
          <SelectContent>
            {channels?.map((channel) => (
              <SelectItem key={channel.id} value={channel.id.toString()}>
                {channel.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {/* Schedule Broadcast Form */}
      {isScheduling && channelId && (
        <Card className="p-6 bg-secondary/30">
          <h2 className="text-xl font-semibold mb-4">Schedule New Broadcast</h2>
          <form onSubmit={handleScheduleBroadcast} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Broadcast Title *</label>
              <Input
                placeholder="e.g., Live Q&A Session"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                placeholder="Broadcast description..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Scheduled Start Time *
                </label>
                <Input
                  type="datetime-local"
                  value={formData.scheduledStartTime}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scheduledStartTime: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Record Broadcast</label>
                <Select
                  value={formData.isRecorded ? "true" : "false"}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      isRecorded: value === "true",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes, record this broadcast</SelectItem>
                    <SelectItem value="false">No, don't record</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={createBroadcastMutation.isPending}
              >
                {createBroadcastMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  "Schedule Broadcast"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsScheduling(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Broadcasts List */}
      {!channelId ? (
        <Card className="p-8 text-center text-muted-foreground">
          <p>Select a channel to view and manage live broadcasts</p>
        </Card>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : broadcasts && broadcasts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {broadcasts.map((broadcast) => (
            <Card key={broadcast.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{broadcast.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${getStatusColor(broadcast.status)}`}>
                      {broadcast.status.toUpperCase()}
                    </span>
                  </div>

                  {broadcast.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {broadcast.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDateTime(broadcast.scheduledStartTime)}
                    </div>

                    {broadcast.status === "live" && (
                      <>
                        <div className="flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold">
                          <Users className="w-4 h-4" />
                          {broadcast.currentViewers} watching
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          Peak: {broadcast.peakViewers}
                        </div>
                      </>
                    )}

                    {broadcast.status === "ended" && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {broadcast.totalViewers} total viewers
                      </div>
                    )}

                    {broadcast.isRecorded && (
                      <span className="px-2 py-1 bg-accent/10 text-accent rounded text-xs font-medium">
                        🎥 Recorded
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {broadcast.status === "scheduled" && (
                    <Button
                      size="sm"
                      onClick={() =>
                        updateBroadcastMutation.mutateAsync({
                          id: broadcast.id,
                          status: "live",
                        })
                      }
                      disabled={updateBroadcastMutation.isPending}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {updateBroadcastMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Start Live"
                      )}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteBroadcast(broadcast.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center text-muted-foreground">
          <Radio className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No broadcasts scheduled. Schedule your first live broadcast!</p>
        </Card>
      )}
    </div>
  );
}
