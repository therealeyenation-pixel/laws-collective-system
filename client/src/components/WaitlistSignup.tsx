import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mail, Loader2, CheckCircle, Bell } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export function WaitlistSignup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitWaitlist = trpc.contact.submit.useMutation({
    onSuccess: () => {
      toast.success("You've been added to our waitlist!");
      setEmail("");
      setName("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to join waitlist. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !name) {
      toast.error("Please enter your name and email");
      return;
    }

    submitWaitlist.mutate({
      name,
      email,
      subject: "Waitlist Signup",
      message: `I would like to join the waitlist for The L.A.W.S. Collective platform launch.`,
      source: "waitlist",
    });
  };

  if (submitted) {
    return (
      <Card className="p-8 text-center bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          You're On The List!
        </h3>
        <p className="text-muted-foreground">
          We'll notify you as soon as we launch. Thank you for your interest!
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-6 h-6 text-primary" />
        <div>
          <h3 className="text-2xl font-bold text-foreground">Join Our Waitlist</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Be the first to know when we launch
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Full Name *
          </label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Email Address *
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={submitWaitlist.isPending}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {submitWaitlist.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Adding to Waitlist...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4 mr-2" />
              Join Waitlist
            </>
          )}
        </Button>
      </form>

      <p className="text-xs text-muted-foreground mt-4 text-center">
        We'll send you launch updates and exclusive early-access information.
      </p>
    </Card>
  );
}
