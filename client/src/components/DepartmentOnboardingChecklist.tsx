import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircle,
  Circle,
  Clock,
  Users,
  Laptop,
  FileText,
  Shield,
  Building2,
  GraduationCap,
  Key,
  Mail,
  Phone,
  Briefcase,
  Heart,
  Scale,
  DollarSign,
  Palette,
  Video,
  Package,
  ClipboardCheck,
  Settings,
  BookOpen,
} from "lucide-react";

// Onboarding task categories
const onboardingCategories = {
  hr: {
    title: "HR & Administrative",
    icon: Users,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    tasks: [
      { id: "hr-1", task: "Complete I-9 Employment Eligibility Verification", required: true },
      { id: "hr-2", task: "Submit W-4 Tax Withholding Form", required: true },
      { id: "hr-3", task: "Complete Direct Deposit Authorization", required: true },
      { id: "hr-4", task: "Sign Employee Handbook Acknowledgment", required: true },
      { id: "hr-5", task: "Complete Emergency Contact Information", required: true },
      { id: "hr-6", task: "Review and Sign Confidentiality Agreement", required: true },
      { id: "hr-7", task: "Enroll in Benefits (if applicable)", required: false },
      { id: "hr-8", task: "Complete Background Check Authorization", required: true },
    ],
  },
  it: {
    title: "IT & Systems Access",
    icon: Laptop,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    tasks: [
      { id: "it-1", task: "Set up company email account", required: true },
      { id: "it-2", task: "Configure multi-factor authentication (MFA)", required: true },
      { id: "it-3", task: "Install required software and tools", required: true },
      { id: "it-4", task: "Complete cybersecurity awareness training", required: true },
      { id: "it-5", task: "Set up VPN access (if remote)", required: false },
      { id: "it-6", task: "Configure communication tools (Teams/Slack)", required: true },
      { id: "it-7", task: "Request access to department-specific systems", required: true },
      { id: "it-8", task: "Review IT security policies", required: true },
    ],
  },
  property: {
    title: "Equipment & Property",
    icon: Building2,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    tasks: [
      { id: "prop-1", task: "Receive and inventory assigned equipment", required: true },
      { id: "prop-2", task: "Sign equipment responsibility agreement", required: true },
      { id: "prop-3", task: "Set up home office (if remote)", required: false },
      { id: "prop-4", task: "Request additional equipment if needed", required: false },
      { id: "prop-5", task: "Confirm shipping address for equipment", required: true },
    ],
  },
  training: {
    title: "Training & Development",
    icon: GraduationCap,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    tasks: [
      { id: "train-1", task: "Complete company orientation", required: true },
      { id: "train-2", task: "Review organizational structure and mission", required: true },
      { id: "train-3", task: "Complete compliance training modules", required: true },
      { id: "train-4", task: "Meet with department manager", required: true },
      { id: "train-5", task: "Review department procedures and SOPs", required: true },
      { id: "train-6", task: "Complete role-specific training", required: true },
    ],
  },
};

// Department-specific additional tasks
const departmentSpecificTasks: Record<string, { title: string; icon: any; color: string; bgColor: string; tasks: { id: string; task: string; required: boolean }[] }> = {
  finance: {
    title: "Finance Department",
    icon: DollarSign,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    tasks: [
      { id: "fin-1", task: "Review financial policies and procedures", required: true },
      { id: "fin-2", task: "Set up access to accounting software", required: true },
      { id: "fin-3", task: "Complete financial compliance training", required: true },
      { id: "fin-4", task: "Review budget management guidelines", required: true },
      { id: "fin-5", task: "Understand expense approval workflows", required: true },
    ],
  },
  hr: {
    title: "HR Department",
    icon: Users,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    tasks: [
      { id: "hrd-1", task: "Review HR policies and employment law basics", required: true },
      { id: "hrd-2", task: "Set up access to HRIS system", required: true },
      { id: "hrd-3", task: "Complete HR compliance certifications", required: true },
      { id: "hrd-4", task: "Review recruitment and hiring procedures", required: true },
      { id: "hrd-5", task: "Understand employee relations protocols", required: true },
    ],
  },
  legal: {
    title: "Legal Department",
    icon: Scale,
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
    tasks: [
      { id: "leg-1", task: "Review legal department procedures", required: true },
      { id: "leg-2", task: "Set up access to legal document management", required: true },
      { id: "leg-3", task: "Complete legal ethics training", required: true },
      { id: "leg-4", task: "Review contract templates and standards", required: true },
      { id: "leg-5", task: "Understand compliance reporting requirements", required: true },
    ],
  },
  it: {
    title: "IT Department",
    icon: Laptop,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    tasks: [
      // Infrastructure & Systems
      { id: "itd-1", task: "Review IT infrastructure documentation and network topology", required: true },
      { id: "itd-2", task: "Set up admin access to servers and cloud platforms", required: true },
      { id: "itd-3", task: "Review system monitoring and alerting tools", required: true },
      // Security Protocols
      { id: "itd-4", task: "Complete advanced cybersecurity certification training", required: true },
      { id: "itd-5", task: "Review and understand incident response procedures", required: true },
      { id: "itd-6", task: "Complete security audit and penetration testing protocols", required: true },
      { id: "itd-7", task: "Review data backup and disaster recovery procedures", required: true },
      { id: "itd-8", task: "Understand access control and privilege management", required: true },
      // Communications Systems
      { id: "itd-9", task: "Review email server administration procedures", required: true },
      { id: "itd-10", task: "Understand Teams/video conferencing system management", required: true },
      { id: "itd-11", task: "Review phone system and VoIP administration", required: false },
      // Support & Troubleshooting
      { id: "itd-12", task: "Review helpdesk ticketing system and SLA requirements", required: true },
      { id: "itd-13", task: "Complete troubleshooting and escalation procedures training", required: true },
      { id: "itd-14", task: "Understand change management and deployment processes", required: true },
      // Compliance
      { id: "itd-15", task: "Review IT compliance requirements (SOC2, GDPR, etc.)", required: true },
      { id: "itd-16", task: "Complete vendor management and third-party risk assessment training", required: false },
    ],
  },
  operations: {
    title: "Operations Department",
    icon: Settings,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    tasks: [
      { id: "ops-1", task: "Review operational procedures and SOPs", required: true },
      { id: "ops-2", task: "Set up access to project management tools", required: true },
      { id: "ops-3", task: "Complete process improvement training", required: true },
      { id: "ops-4", task: "Review cross-department coordination protocols", required: true },
      { id: "ops-5", task: "Understand reporting and metrics requirements", required: true },
    ],
  },
  marketing: {
    title: "Marketing Department",
    icon: Palette,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    tasks: [
      { id: "mkt-1", task: "Review brand guidelines and style guide", required: true },
      { id: "mkt-2", task: "Set up access to marketing tools and platforms", required: true },
      { id: "mkt-3", task: "Complete content creation guidelines training", required: true },
      { id: "mkt-4", task: "Review campaign management procedures", required: true },
      { id: "mkt-5", task: "Understand Real-Eye-Nation creative services process", required: true },
    ],
  },
  education: {
    title: "Education Department",
    icon: BookOpen,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    tasks: [
      { id: "edu-1", task: "Review curriculum development guidelines", required: true },
      { id: "edu-2", task: "Set up access to learning management system", required: true },
      { id: "edu-3", task: "Complete instructional design training", required: true },
      { id: "edu-4", task: "Review student assessment procedures", required: true },
      { id: "edu-5", task: "Understand academy house structure", required: true },
    ],
  },
  health: {
    title: "Health Department",
    icon: Heart,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    tasks: [
      { id: "hlt-1", task: "Review health and wellness program guidelines", required: true },
      { id: "hlt-2", task: "Complete HIPAA compliance training", required: true },
      { id: "hlt-3", task: "Set up access to health management systems", required: true },
      { id: "hlt-4", task: "Review wellness initiative procedures", required: true },
      { id: "hlt-5", task: "Understand member health support protocols", required: true },
    ],
  },
  media: {
    title: "Media Department",
    icon: Video,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    tasks: [
      { id: "med-1", task: "Review media production guidelines", required: true },
      { id: "med-2", task: "Set up access to video editing software", required: true },
      { id: "med-3", task: "Complete content creation training", required: true },
      { id: "med-4", task: "Review Real-Eye-Nation brand standards", required: true },
      { id: "med-5", task: "Understand documentary and podcast workflows", required: true },
    ],
  },
  procurement: {
    title: "Procurement Department",
    icon: Package,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    tasks: [
      { id: "proc-1", task: "Review procurement policies and procedures", required: true },
      { id: "proc-2", task: "Set up access to vendor management system", required: true },
      { id: "proc-3", task: "Complete purchasing compliance training", required: true },
      { id: "proc-4", task: "Review vendor evaluation criteria", required: true },
      { id: "proc-5", task: "Understand purchase order workflows", required: true },
    ],
  },
};

interface DepartmentOnboardingChecklistProps {
  department: string;
  employeeName?: string;
  showProgress?: boolean;
}

export function DepartmentOnboardingChecklist({
  department,
  employeeName = "New Employee",
  showProgress = true,
}: DepartmentOnboardingChecklistProps) {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  // Get all tasks for this department
  const allCategories = [
    onboardingCategories.hr,
    onboardingCategories.it,
    onboardingCategories.property,
    onboardingCategories.training,
  ];

  // Add department-specific tasks if available
  const deptKey = department.toLowerCase().replace(/\s+/g, "");
  if (departmentSpecificTasks[deptKey]) {
    allCategories.push(departmentSpecificTasks[deptKey]);
  }

  // Calculate progress
  const totalTasks = allCategories.reduce((sum, cat) => sum + cat.tasks.length, 0);
  const completedCount = completedTasks.size;
  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      {showProgress && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5" />
                  Onboarding Progress
                </CardTitle>
                <CardDescription>
                  {employeeName} - {department} Department
                </CardDescription>
              </div>
              <Badge variant={progressPercent === 100 ? "default" : "secondary"} className="text-lg px-4 py-1">
                {progressPercent}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercent} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>{completedCount} of {totalTasks} tasks completed</span>
              <span>{totalTasks - completedCount} remaining</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {allCategories.map((category) => {
          const categoryCompleted = category.tasks.filter((t) => completedTasks.has(t.id)).length;
          const CategoryIcon = category.icon;

          return (
            <Card key={category.title}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className={`p-2 rounded-lg ${category.bgColor} ${category.color}`}>
                      <CategoryIcon className="w-4 h-4" />
                    </div>
                    {category.title}
                  </CardTitle>
                  <Badge variant="outline">
                    {categoryCompleted}/{category.tasks.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {category.tasks.map((task) => {
                    const isCompleted = completedTasks.has(task.id);
                    return (
                      <div
                        key={task.id}
                        className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                          isCompleted ? "bg-green-50 dark:bg-green-900/20" : ""
                        }`}
                        onClick={() => toggleTask(task.id)}
                      >
                        <Checkbox
                          checked={isCompleted}
                          onCheckedChange={() => toggleTask(task.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <p className={`text-sm ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {task.task}
                          </p>
                          {task.required && !isCompleted && (
                            <Badge variant="destructive" className="text-xs mt-1">
                              Required
                            </Badge>
                          )}
                        </div>
                        {isCompleted && (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Completion Message */}
      {progressPercent === 100 && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200">
                  Onboarding Complete!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  All onboarding tasks have been completed. Welcome to the team!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default DepartmentOnboardingChecklist;
