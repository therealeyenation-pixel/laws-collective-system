#!/bin/bash
# Script to identify department dashboards that need Team link updates
# List dashboards with their department names

echo "Department Dashboards to update:"
echo "================================"

# Find all dashboard files and check for Team-related content
for file in /home/ubuntu/financial_automation_map/client/src/pages/*Dashboard.tsx; do
  filename=$(basename "$file")
  if [[ "$filename" != "Dashboard.tsx" && "$filename" != "MemberBusinessDashboard.tsx" && "$filename" != "TrialDashboard.tsx" && "$filename" != "SystemDashboard.tsx" && "$filename" != "SystemHealthDashboard.tsx" && "$filename" != "PlatformAdminDashboard.tsx" ]]; then
    echo "$filename"
  fi
done
