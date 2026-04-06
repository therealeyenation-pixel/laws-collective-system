import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  Phone,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function Emergency() {
  const [showSOSForm, setShowSOSForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [sosType, setSOSType] = useState<"medical" | "security" | "fire" | "natural_disaster" | "other">("medical");
  const [sosLocation, setSOSLocation] = useState("");
  const [sosDescription, setSOSDescription] = useState("");
  const [sosSeverity, setSOSSeverity] = useState<"critical" | "high" | "medium" | "low">("critical");

  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactRelationship, setContactRelationship] = useState("");

  const { data: activeAlerts, refetch: refetchAlerts } = trpc.emergency.getActiveAlerts.useQuery();
  const { data: alertHistory } = trpc.emergency.getAlertHistory.useQuery({ limit: 20 });
  const { data: contacts, refetch: refetchContacts } = trpc.emergency.getContacts.useQuery();

  const { mutate: triggerSOS, isPending: isTriggering } = trpc.emergency.triggerSOS.useMutation({
    onSuccess: (data) => {
      toast.success(`SOS triggered! ${data.contactsNotified} contacts notified.`);
      setShowSOSForm(false);
      setSOSLocation("");
      setSOSDescription("");
      refetchAlerts();
    },
    onError: (error) => {
      toast.error(`Failed to trigger SOS: ${error.message}`);
    },
  });

  const { mutate: resolveAlert } = trpc.emergency.resolveAlert.useMutation({
    onSuccess: () => {
      toast.success("Alert resolved");
      refetchAlerts();
    },
    onError: (error) => {
      toast.error(`Failed to resolve alert: ${error.message}`);
    },
  });

  const { mutate: addContact, isPending: isAddingContact } = trpc.emergency.addContact.useMutation({
    onSuccess: () => {
      toast.success("Emergency contact added");
      setShowContactForm(false);
      setContactName("");
      setContactPhone("");
      setContactEmail("");
      setContactRelationship("");
      refetchContacts();
    },
    onError: (error) => {
      toast.error(`Failed to add contact: ${error.message}`);
    },
  });

  const { mutate: deleteContact } = trpc.emergency.deleteContact.useMutation({
    onSuccess: () => {
      toast.success("Contact removed");
      refetchContacts();
    },
    onError: (error) => {
      toast.error(`Failed to delete contact: ${error.message}`);
    },
  });

  const handleTriggerSOS = () => {
    if (!sosLocation.trim() || !sosDescription.trim()) {
      toast.error("Please fill in location and description");
      return;
    }
    triggerSOS({
      type: sosType,
      location: sosLocation,
      description: sosDescription,
      severity: sosSeverity,
    });
  };

  const handleAddContact = () => {
    if (!contactName.trim() || !contactPhone.trim() || !contactEmail.trim()) {
      toast.error("Please fill in all contact fields");
      return;
    }
    addContact({
      name: contactName,
      phone: contactPhone,
      email: contactEmail,
      relationship: contactRelationship,
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50";
      case "high":
        return "text-orange-600 bg-orange-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case "resolved":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <h1 className="text-3xl font-bold text-foreground">Emergency Services</h1>
            </div>
            <Button
              size="lg"
              className="gap-2 bg-red-600 hover:bg-red-700"
              onClick={() => setShowSOSForm(true)}
            >
              <AlertTriangle className="w-5 h-5" />
              TRIGGER SOS
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-4 py-8">
        {/* SOS Form Modal */}
        {showSOSForm && (
          <Card className="mb-8 p-6 border-red-300 bg-red-50">
            <h2 className="text-2xl font-bold text-red-900 mb-4">Trigger Emergency SOS</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Emergency Type
                </label>
                <select
                  value={sosType}
                  onChange={(e) => setSOSType(e.target.value as any)}
                  className="w-full px-4 py-2 border border-border rounded-lg"
                >
                  <option value="medical">Medical Emergency</option>
                  <option value="security">Security Threat</option>
                  <option value="fire">Fire/Hazard</option>
                  <option value="natural_disaster">Natural Disaster</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Severity Level
                </label>
                <select
                  value={sosSeverity}
                  onChange={(e) => setSOSSeverity(e.target.value as any)}
                  className="w-full px-4 py-2 border border-border rounded-lg"
                >
                  <option value="critical">Critical (Life Threatening)</option>
                  <option value="high">High (Urgent)</option>
                  <option value="medium">Medium (Important)</option>
                  <option value="low">Low (Informational)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Location
                </label>
                <Input
                  placeholder="Where is the emergency?"
                  value={sosLocation}
                  onChange={(e) => setSOSLocation(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Describe the emergency situation..."
                  value={sosDescription}
                  onChange={(e) => setSOSDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg min-h-24"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={handleTriggerSOS}
                  disabled={isTriggering}
                >
                  {isTriggering ? "Sending..." : "SEND SOS ALERT"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowSOSForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Active Alerts */}
        {activeAlerts && activeAlerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Active Alerts</h2>
            <div className="space-y-3">
              {activeAlerts.map((alert) => (
                <Card key={alert.id} className="p-4 border-l-4 border-l-red-600">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(alert.status)}
                      <div>
                        <h3 className="font-semibold text-foreground capitalize">
                          {alert.type} - {alert.severity}
                        </h3>
                        <p className="text-sm text-muted-foreground">{alert.location}</p>
                        <p className="text-sm text-foreground mt-1">{alert.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(alert.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        resolveAlert({
                          alertId: alert.id,
                          resolution: "Resolved by user",
                        })
                      }
                    >
                      Resolve
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Emergency Contacts */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Contacts List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">Emergency Contacts</h2>
              <Button
                size="sm"
                onClick={() => setShowContactForm(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Contact
              </Button>
            </div>

            {contacts && contacts.length > 0 ? (
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <Card key={contact.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{contact.name}</h3>
                        <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <a
                            href={`tel:${contact.phone}`}
                            className="text-sm text-primary hover:underline"
                          >
                            {contact.phone}
                          </a>
                        </div>
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {contact.email}
                        </a>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteContact({ contactId: contact.id })}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center">
                <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No emergency contacts added yet</p>
              </Card>
            )}
          </div>

          {/* Add Contact Form */}
          {showContactForm && (
            <Card className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-4">Add Emergency Contact</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Name
                  </label>
                  <Input
                    placeholder="Contact name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone
                  </label>
                  <Input
                    placeholder="Phone number"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Relationship
                  </label>
                  <Input
                    placeholder="e.g., Family, Friend, Doctor"
                    value={contactRelationship}
                    onChange={(e) => setContactRelationship(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={handleAddContact}
                    disabled={isAddingContact}
                  >
                    {isAddingContact ? "Adding..." : "Add Contact"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowContactForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Alert History */}
        {alertHistory && alertHistory.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Alert History</h2>
            <div className="space-y-3">
              {alertHistory.map((alert) => (
                <Card key={alert.id} className="p-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(alert.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground capitalize">
                          {alert.type}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {alert.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.location}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
