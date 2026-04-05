import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, Plus, Hash } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

interface ChatWidgetProps {
  entityType: "house" | "trust" | "business";
  entityId: number;
  entityName?: string;
  limit?: number;
  showCreateButton?: boolean;
}

export function ChatWidget({
  entityType,
  entityId,
  entityName,
  limit = 5,
  showCreateButton = true,
}: ChatWidgetProps) {
  const getChatsQuery = () => {
    if (entityType === "house") {
      return trpc.chat.getHouseChats.useQuery({ houseId: entityId, limit });
    } else if (entityType === "trust") {
      return trpc.chat.getTrustChats.useQuery({ trustId: entityId, limit });
    } else {
      return trpc.chat.getBusinessChats.useQuery({ businessId: entityId, limit });
    }
  };

  const { data: chats, isLoading } = getChatsQuery();

  const getChatIcon = (chatType: string) => {
    if (chatType === "channel") {
      return <Hash className="h-4 w-4 text-muted-foreground" />;
    }
    return <MessageSquare className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Chat Channels
        </CardTitle>
        {showCreateButton && (
          <Link
            href={`/chat?create=true&entityType=${entityType}&entityId=${entityId}&entityName=${encodeURIComponent(entityName || "")}`}
          >
            <Button size="sm" variant="outline" className="gap-1">
              <Plus className="h-4 w-4" />
              New Channel
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : !chats || chats.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No chat channels yet</p>
            {showCreateButton && (
              <Link
                href={`/chat?create=true&entityType=${entityType}&entityId=${entityId}`}
              >
                <Button variant="link" className="mt-2">
                  Create a channel
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map((chat: any) => (
              <Link key={chat.id} href={`/chat?id=${chat.id}`}>
                <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getChatIcon(chat.chatType)}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">
                          {chat.name || "Direct Message"}
                        </h4>
                        {chat.lastMessagePreview && (
                          <p className="text-xs text-muted-foreground truncate">
                            {chat.lastMessagePreview}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {chat.unreadCount > 0 && (
                        <Badge className="bg-primary">{chat.unreadCount}</Badge>
                      )}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {chat.memberCount || 0}
                      </span>
                      {chat.lastMessageAt && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(chat.lastMessageAt), {
                            addSuffix: true,
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            <Link href={`/chat?entityType=${entityType}&entityId=${entityId}`}>
              <Button variant="ghost" className="w-full mt-2">
                View All Channels
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ChatWidget;
