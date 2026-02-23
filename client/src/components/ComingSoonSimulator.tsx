import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Construction, 
  ArrowLeft, 
  Bell, 
  Calendar,
  Sparkles,
  Clock,
  Target,
  CheckCircle2
} from "lucide-react";

interface ComingSoonSimulatorProps {
  title: string;
  department: string;
  description: string;
  plannedFeatures?: string[];
  estimatedRelease?: string;
  backPath?: string;
}

export default function ComingSoonSimulator({
  title,
  department,
  description,
  plannedFeatures = [],
  estimatedRelease = "Q2 2026",
  backPath = "/dashboard"
}: ComingSoonSimulatorProps) {
  return (
    <DashboardLayout>
      <div className="container max-w-4xl py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-4">
            <Construction className="w-10 h-10 text-amber-600" />
          </div>
          <Badge variant="outline" className="mb-4 text-amber-600 border-amber-300 bg-amber-50">
            Coming Soon
          </Badge>
          <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {description}
          </p>
        </div>

        {/* Info Card */}
        <Card className="mb-6 border-amber-200 bg-gradient-to-br from-amber-50/50 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-amber-600" />
              {department} Department Simulator
            </CardTitle>
            <CardDescription>
              This simulator is currently under development
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>Estimated Release: <strong>{estimatedRelease}</strong></span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>Development Status: <Badge variant="secondary">In Progress</Badge></span>
            </div>
          </CardContent>
        </Card>

        {/* Planned Features */}
        {plannedFeatures.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-primary" />
                Planned Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plannedFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" asChild>
            <Link href={backPath}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <Button variant="default" disabled>
            <Bell className="w-4 h-4 mr-2" />
            Notify Me When Ready
          </Button>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Have suggestions for this simulator? Contact the {department} department team.
        </p>
      </div>
    </DashboardLayout>
  );
}
