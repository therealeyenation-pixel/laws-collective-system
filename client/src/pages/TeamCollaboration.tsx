import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, CheckCircle, AlertCircle, User, Clock, Send } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

export default function TeamCollaboration() {
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "Sarah Johnson",
      role: "Campaign Manager",
      avatar: "SJ",
      timestamp: "2 hours ago",
      content: "The email open rate looks great this week! Let's analyze the subject line performance.",
      replies: 2,
      likes: 3,
    },
    {
      id: 2,
      author: "Mike Chen",
      role: "Analyst",
      avatar: "MC",
      timestamp: "1 hour ago",
      content: "I noticed a spike in unsubscribes on Tuesday. Should we review the content?",
      replies: 1,
      likes: 1,
    },
  ]);

  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Review campaign performance metrics",
      assignee: "Sarah Johnson",
      status: "in_progress",
      dueDate: "2026-03-25",
      priority: "high",
      comments: 3,
    },
    {
      id: 2,
      title: "Optimize email templates",
      assignee: "Mike Chen",
      status: "pending",
      dueDate: "2026-03-28",
      priority: "medium",
      comments: 1,
    },
    {
      id: 3,
      title: "Create member segmentation report",
      assignee: "You",
      status: "completed",
      dueDate: "2026-03-24",
      priority: "high",
      comments: 5,
    },
  ]);

  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([
        ...comments,
        {
          id: Math.max(...comments.map((c) => c.id), 0) + 1,
          author: "You",
          role: "Admin",
          avatar: "YO",
          timestamp: "now",
          content: newComment,
          replies: 0,
          likes: 0,
        },
      ]);
      setNewComment("");
    }
  };

  return (
    <DashboardLayout>
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Team Collaboration</h1>
        <p className="text-muted-foreground mt-2">Coordinate with your team through comments, mentions, and task assignments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Comments Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Comments */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Discussion Thread
            </h2>

            <div className="space-y-4 mb-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-medium text-sm">
                      {comment.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{comment.author}</p>
                        <span className="text-xs text-muted-foreground">{comment.role}</span>
                        <span className="text-xs text-muted-foreground">• {comment.timestamp}</span>
                      </div>
                      <p className="text-sm mt-2">{comment.content}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <button className="hover:text-foreground">👍 {comment.likes}</button>
                        <button className="hover:text-foreground">💬 {comment.replies} replies</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Comment */}
            <div className="border-t pt-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center font-medium text-sm">
                  YO
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment... (use @mention to notify team members)"
                    className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button variant="outline" size="sm" onClick={() => setNewComment("")}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleAddComment}>
                      <Send className="w-4 h-4 mr-2" />
                      Comment
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Tasks Sidebar */}
        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Team Tasks</h2>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    {task.status === "completed" ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : task.status === "in_progress" ? (
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        <span>{task.assignee}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{task.dueDate}</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {task.priority}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {task.comments} comments
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4">
              View All Tasks
            </Button>
          </Card>

          {/* Team Members */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Team Members</h2>
            <div className="space-y-3">
              {[
                { name: "Sarah Johnson", role: "Campaign Manager", status: "online" },
                { name: "Mike Chen", role: "Analyst", status: "online" },
                { name: "Lisa Park", role: "Designer", status: "away" },
              ].map((member, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${member.status === "online" ? "bg-green-500" : "bg-gray-400"}`} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}
