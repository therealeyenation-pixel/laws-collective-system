import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Briefcase,
  Save,
  Linkedin,
  Loader2,
  AlertCircle,
  Link as LinkIcon
} from "lucide-react";
import { Link } from "wouter";

const POSITION_LEVELS: Record<string, { label: string; color: string }> = {
  executive: { label: "Executive", color: "bg-purple-500" },
  manager: { label: "Manager", color: "bg-blue-500" },
  lead: { label: "Lead", color: "bg-cyan-500" },
  coordinator: { label: "Coordinator", color: "bg-green-500" },
  specialist: { label: "Specialist", color: "bg-amber-500" },
  intern: { label: "Intern", color: "bg-gray-500" },
};

const EMPLOYMENT_TYPES: Record<string, string> = {
  full_time: "Full-Time",
  part_time: "Part-Time",
  contract: "Contract",
  intern: "Intern",
};

const WORK_LOCATIONS: Record<string, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  on_site: "On-Site",
};

export default function MyProfile() {
  const [formData, setFormData] = useState({
    preferredName: "",
    phone: "",
    bio: "",
    avatarUrl: "",
    linkedinUrl: "",
  });
  const [hasChanges, setHasChanges] = useState(false);

  const { data: profile, isLoading, refetch } = trpc.employees.getMyProfile.useQuery();

  const updateMutation = trpc.employees.updateMyProfile.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setHasChanges(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        preferredName: profile.preferredName || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        avatarUrl: profile.avatarUrl || "",
        linkedinUrl: profile.linkedinUrl || "",
      });
    }
  }, [profile]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateMutation.mutate({
      preferredName: formData.preferredName || null,
      phone: formData.phone || null,
      bio: formData.bio || null,
      avatarUrl: formData.avatarUrl || null,
      linkedinUrl: formData.linkedinUrl || null,
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-1">Manage your employee profile</p>
          </div>

          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-amber-500 mb-4" />
              <h3 className="text-lg font-semibold">No Employee Profile Found</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                Your user account is not linked to an employee profile. Please contact HR to have your account linked.
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <Link href="/employees">
                  <Button variant="outline" className="gap-2">
                    <User className="w-4 h-4" />
                    View Employee Directory
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button className="gap-2">
                    <Mail className="w-4 h-4" />
                    Contact HR
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const positionLevel = POSITION_LEVELS[profile.positionLevel] || { label: profile.positionLevel, color: "bg-gray-500" };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-1">Manage your employee profile</p>
          </div>
          {hasChanges && (
            <Button onClick={handleSave} disabled={updateMutation.isPending} className="gap-2">
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Profile Overview</CardTitle>
              <CardDescription>Your current employee information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src={profile.avatarUrl || undefined} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(profile.firstName, profile.lastName)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">
                  {profile.preferredName || profile.firstName} {profile.lastName}
                </h3>
                <p className="text-muted-foreground">{profile.jobTitle}</p>
                <div className="flex gap-2 mt-2">
                  <Badge className={`${positionLevel.color} text-white`}>
                    {positionLevel.label}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span>{profile.entityName}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span>{profile.department}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{WORK_LOCATIONS[profile.workLocation] || profile.workLocation}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Started {new Date(profile.startDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Employment Type: {EMPLOYMENT_TYPES[profile.employmentType] || profile.employmentType}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Editable Fields Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>
                Update your personal information. Some fields can only be changed by HR.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preferredName">Preferred Name</Label>
                  <Input
                    id="preferredName"
                    value={formData.preferredName}
                    onChange={(e) => handleChange("preferredName", e.target.value)}
                    placeholder="How you'd like to be called"
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be displayed instead of your first name
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={(e) => handleChange("linkedinUrl", e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatarUrl">Profile Photo URL</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="avatarUrl"
                    value={formData.avatarUrl}
                    onChange={(e) => handleChange("avatarUrl", e.target.value)}
                    placeholder="https://example.com/your-photo.jpg"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter a URL to an image for your profile photo
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  placeholder="Tell us about yourself, your role, and your expertise..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  A brief description that will appear on your profile in the employee directory
                </p>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Read-Only Information</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  The following information can only be changed by HR or your manager:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Full Name:</span>
                    <p className="font-medium">{profile.firstName} {profile.lastName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Department:</span>
                    <p className="font-medium">{profile.department}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Job Title:</span>
                    <p className="font-medium">{profile.jobTitle}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Entity:</span>
                    <p className="font-medium">{profile.entityName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Work Location:</span>
                    <p className="font-medium">{WORK_LOCATIONS[profile.workLocation]}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
