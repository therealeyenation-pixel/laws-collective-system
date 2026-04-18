import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Mail, FileText, Plus, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

export default function CustomReportScheduling() {
  const [reports, setReports] = useState([
    {
      id: 1,
      name: "Weekly Campaign Performance",
      frequency: "weekly",
      day: "Monday",
      time: "09:00",
      format: "PDF",
      recipients: ["manager@company.com"],
      lastRun: "2026-03-24",
      nextRun: "2026-03-31",
      status: "active",
    },
    {
      id: 2,
      name: "Monthly Financial Summary",
      frequency: "monthly",
      day: "1st",
      time: "08:00",
      format: "Excel",
      recipients: ["finance@company.com", "cfo@company.com"],
      lastRun: "2026-03-01",
      nextRun: "2026-04-01",
      status: "active",
    },
    {
      id: 3,
      name: "Daily Email Metrics",
      frequency: "daily",
      day: "N/A",
      time: "06:00",
      format: "CSV",
      recipients: ["analytics@company.com"],
      lastRun: "2026-03-24",
      nextRun: "2026-03-25",
      status: "active",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    frequency: "weekly",
    time: "09:00",
    format: "PDF",
    recipients: "",
  });

  const handleAddReport = () => {
    if (formData.name && formData.recipients) {
      const newReport = {
        id: Math.max(...reports.map((r) => r.id), 0) + 1,
        ...formData,
        recipients: formData.recipients.split(",").map((r) => r.trim()),
        day: formData.frequency === "weekly" ? "Monday" : formData.frequency === "monthly" ? "1st" : "N/A",
        lastRun: "Never",
        nextRun: new Date().toISOString().split("T")[0],
        status: "active",
      };
      setReports([...reports, newReport]);
      setFormData({ name: "", frequency: "weekly", time: "09:00", format: "PDF", recipients: "" });
      setShowForm(false);
    }
  };

  const handleDeleteReport = (id: number) => {
    setReports(reports.filter((r) => r.id !== id));
  };

  return (
    <DashboardLayout>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Custom Report Scheduling</h1>
          <p className="text-muted-foreground mt-2">Create and manage automated report delivery</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          New Report
        </Button>
      </div>

      {/* Create Report Form */}
      {showForm && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Create New Report</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Report Name</label>
              <input
                type="text"
                placeholder="e.g., Weekly Campaign Report"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full mt-2 px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full mt-2 px-3 py-2 border rounded-lg"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full mt-2 px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Format</label>
              <select
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                className="w-full mt-2 px-3 py-2 border rounded-lg"
              >
                <option value="PDF">PDF</option>
                <option value="Excel">Excel</option>
                <option value="CSV">CSV</option>
                <option value="JSON">JSON</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Recipients (comma-separated)</label>
              <input
                type="text"
                placeholder="email1@company.com, email2@company.com"
                value={formData.recipients}
                onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                className="w-full mt-2 px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleAddReport}>Create Report</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Reports List */}
      <div className="space-y-3">
        {reports.map((report) => (
          <Card key={report.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{report.name}</h3>
                  <Badge variant={report.status === "active" ? "default" : "secondary"}>{report.status}</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {report.frequency.charAt(0).toUpperCase() + report.frequency.slice(1)} on {report.day}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{report.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{report.format}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{report.recipients.length} recipients</span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Last run: {report.lastRun} | Next run: {report.nextRun}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteReport(report.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Report Templates */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Report Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "Campaign Performance", metrics: "Open Rate, Click Rate, Conversion" },
            { name: "Financial Summary", metrics: "Revenue, Expenses, ROI" },
            { name: "Member Activity", metrics: "New Members, Engagement, Retention" },
          ].map((template, i) => (
            <Card key={i} className="p-4 border">
              <h3 className="font-medium">{template.name}</h3>
              <p className="text-sm text-muted-foreground mt-2">{template.metrics}</p>
              <Button variant="outline" size="sm" className="mt-3 w-full">
                Use Template
              </Button>
            </Card>
          ))}
        </div>
      </Card>
    </div>
    </DashboardLayout>
  );
}
