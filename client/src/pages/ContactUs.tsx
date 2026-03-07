import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Send, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sendEmail = trpc.contact.submit.useMutation({
    onSuccess: () => {
      toast.success("Thank you! Your message has been received. We'll get back to you soon.", {
        description: "Your submission has been recorded and our team will review it.",
      });
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send email");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.message.length < 10) {
      toast.error("Message must be at least 10 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      await sendEmail.mutateAsync({
        ...formData,
        source: "contact_form",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Contact Us</h1>
              <p className="text-sm text-muted-foreground mt-1">Get in touch with the The L.A.W.S. Collective</p>
            </div>
            <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-foreground">Email</h3>
              </div>
              <p className="text-sm text-muted-foreground">luvonpurpose@protonmail.com</p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex items-center gap-3 mb-3">
                <Phone className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-foreground">Phone</h3>
              </div>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-foreground">Location</h3>
              </div>
              <p className="text-sm text-muted-foreground">Global Community</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="bg-card p-8 rounded-lg border border-border space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us more about your inquiry..."
                  rows={6}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || sendEmail.isPending}
                className="w-full bg-accent hover:bg-accent/90 text-white gap-2"
              >
                <Send className="w-4 h-4" />
                {isSubmitting || sendEmail.isPending ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
