import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Send, 
  Smile, 
  Settings, 
  Users, 
  TrendingUp, 
  AlertCircle,
  Trash2,
  Ban,
  Volume2,
  MoreVertical
} from "lucide-react";

export default function LiveChat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [participants, setParticipants] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage = {
        id: `msg-${Date.now()}`,
        username: "You",
        message: inputValue,
        timestamp: new Date(),
        reactions: {},
        isModerator: false,
      };
      setMessages([...messages, newMessage]);
      setInputValue("");
    }
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    setMessages(
      messages.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              reactions: {
                ...msg.reactions,
                [emoji]: (msg.reactions[emoji] || 0) + 1,
              },
            }
          : msg
      )
    );
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((msg) => msg.id !== messageId));
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-secondary border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Live Chat</h1>
            <p className="text-sm text-muted-foreground">Global Broadcast Discussion</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-background rounded-lg">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">{participants} viewers</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden p-4">
        {/* Chat Messages */}
        <div className="flex-1 flex flex-col bg-secondary rounded-lg overflow-hidden">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className="group p-3 bg-background rounded-lg hover:bg-background/80 transition-colors"
                  onMouseEnter={() => setSelectedMessage(msg.id)}
                  onMouseLeave={() => setSelectedMessage(null)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-sm">
                          {msg.username}
                        </span>
                        {msg.isModerator && (
                          <span className="text-xs bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded">
                            MOD
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-foreground mt-1">{msg.message}</p>

                      {/* Reactions */}
                      {Object.keys(msg.reactions).length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {Object.entries(msg.reactions).map(([emoji, count]) => (
                            <button
                              key={emoji}
                              className="text-xs bg-background px-2 py-1 rounded hover:bg-background/80"
                              onClick={() => handleAddReaction(msg.id, emoji)}
                            >
                              {emoji} {count}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Message Actions */}
                    {selectedMessage === msg.id && (
                      <div className="flex gap-1 ml-2">
                        <button
                          className="p-1 hover:bg-background rounded text-muted-foreground hover:text-foreground"
                          onClick={() => handleAddReaction(msg.id, "❤️")}
                          title="React with heart"
                        >
                          <Smile className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 hover:bg-background rounded text-muted-foreground hover:text-foreground"
                          onClick={() => handleDeleteMessage(msg.id)}
                          title="Delete message"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-border p-4 bg-background">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Type a message... (Max 500 characters)"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value.slice(0, 500))}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} size="sm">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {inputValue.length}/500 characters
            </p>
          </div>
        </div>

        {/* Sidebar */}
        {showSettings && (
          <div className="w-80 bg-secondary rounded-lg p-4 overflow-y-auto space-y-4">
            <h2 className="font-bold text-foreground">Chat Settings</h2>

            {/* Moderation */}
            <Card className="p-3">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Moderation
              </h3>
              <div className="space-y-2 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Allow emojis</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Allow links</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Require moderation</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Slow mode (5s)</span>
                </label>
              </div>
            </Card>

            {/* Analytics */}
            <Card className="p-3">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Analytics
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Messages:</span>
                  <span className="font-medium">{messages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Users:</span>
                  <span className="font-medium">{participants}</span>
                </div>
                <div className="flex justify-between">
                  <span>Engagement:</span>
                  <span className="font-medium">85%</span>
                </div>
              </div>
            </Card>

            {/* Emoji Reactions */}
            <Card className="p-3">
              <h3 className="font-semibold text-foreground mb-2">Quick Reactions</h3>
              <div className="grid grid-cols-4 gap-2">
                {["😀", "❤️", "🔥", "👍", "😂", "🎉", "🚀", "💯"].map((emoji) => (
                  <button
                    key={emoji}
                    className="text-2xl hover:scale-125 transition-transform"
                    title={`React with ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </Card>

            {/* Participants */}
            <Card className="p-3">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Top Contributors
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Alice</span>
                  <span className="text-muted-foreground">45 messages</span>
                </div>
                <div className="flex justify-between">
                  <span>Bob</span>
                  <span className="text-muted-foreground">38 messages</span>
                </div>
                <div className="flex justify-between">
                  <span>Charlie</span>
                  <span className="text-muted-foreground">32 messages</span>
                </div>
              </div>
            </Card>

            {/* Sentiment */}
            <Card className="p-3">
              <h3 className="font-semibold text-foreground mb-2">Sentiment</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-green-500/20 rounded h-2">
                    <div className="bg-green-500 h-full rounded" style={{ width: "75%" }}></div>
                  </div>
                  <span>Positive: 75%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-500/20 rounded h-2">
                    <div className="bg-gray-500 h-full rounded" style={{ width: "20%" }}></div>
                  </div>
                  <span>Neutral: 20%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-red-500/20 rounded h-2">
                    <div className="bg-red-500 h-full rounded" style={{ width: "5%" }}></div>
                  </div>
                  <span>Negative: 5%</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
