import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { X, Star, Bug, Lightbulb, MessageSquare, Loader2 } from "lucide-react";

interface FeedbackWidgetProps {
  trialUserId: number;
  sessionId?: number;
  onClose: () => void;
  featureName?: string;
  pagePath?: string;
}

export function FeedbackWidget({
  trialUserId,
  sessionId,
  onClose,
  featureName,
  pagePath,
}: FeedbackWidgetProps) {
  const [feedbackType, setFeedbackType] = useState<string>("overall_rating");
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [wantsResponse, setWantsResponse] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const submitMutation = trpc.trial.submitFeedback.useMutation({
    onSuccess: () => {
      toast.success("Thank you for your feedback!");
      onClose();
    },
    onError: (error) => {
      toast.error("Failed to submit feedback", { description: error.message });
    },
  });

  const handleSubmit = () => {
    if (feedbackType === "overall_rating" || feedbackType === "feature_rating") {
      if (rating === 0) {
        toast.error("Please select a rating");
        return;
      }
    }

    if ((feedbackType === "bug_report" || feedbackType === "suggestion") && !comment.trim()) {
      toast.error("Please provide details");
      return;
    }

    submitMutation.mutate({
      trialUserId,
      sessionId,
      feedbackType: feedbackType as any,
      rating: rating > 0 ? rating : undefined,
      featureName,
      pagePath: pagePath || window.location.pathname,
      comment: comment.trim() || undefined,
      wantsResponse,
    });
  };

  const feedbackTypes = [
    { value: "overall_rating", label: "Rate Overall Experience", icon: Star },
    { value: "feature_rating", label: "Rate This Feature", icon: Star },
    { value: "bug_report", label: "Report a Bug", icon: Bug },
    { value: "suggestion", label: "Suggest Improvement", icon: Lightbulb },
    { value: "inline_comment", label: "General Comment", icon: MessageSquare },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Share Your Feedback</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Feedback Type Selection */}
          <div className="space-y-2">
            <Label>What would you like to share?</Label>
            <RadioGroup value={feedbackType} onValueChange={setFeedbackType}>
              {feedbackTypes.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={type.value} id={type.value} />
                  <Label htmlFor={type.value} className="flex items-center gap-2 cursor-pointer">
                    <type.icon className="h-4 w-4 text-muted-foreground" />
                    {type.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Star Rating */}
          {(feedbackType === "overall_rating" || feedbackType === "feature_rating") && (
            <div className="space-y-2">
              <Label>Your Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-1 transition-transform hover:scale-110"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoveredRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            </div>
          )}

          {/* Comment Box */}
          <div className="space-y-2">
            <Label htmlFor="comment">
              {feedbackType === "bug_report"
                ? "Describe the bug *"
                : feedbackType === "suggestion"
                ? "Your suggestion *"
                : "Additional comments (optional)"}
            </Label>
            <Textarea
              id="comment"
              placeholder={
                feedbackType === "bug_report"
                  ? "What happened? What did you expect?"
                  : feedbackType === "suggestion"
                  ? "What would you like to see improved?"
                  : "Share your thoughts..."
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>

          {/* Want Response */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="wantsResponse"
              checked={wantsResponse}
              onCheckedChange={(checked) => setWantsResponse(checked as boolean)}
            />
            <Label htmlFor="wantsResponse" className="text-sm">
              I'd like someone to follow up with me
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Feedback"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
