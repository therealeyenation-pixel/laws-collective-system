#!/usr/bin/env python3
"""
Script to update all department dashboards with Team links to Employee Directory
"""
import re
import os

# Define dashboards and their department filter values
DASHBOARD_CONFIGS = {
    "BusinessDashboard.tsx": {"dept": "business", "color": "amber", "manager": "Business Manager", "initials": "BM"},
    "ContractsDashboard.tsx": {"dept": "contracts", "color": "orange", "manager": "Contracts Manager", "initials": "CM"},
    "DesignDashboard.tsx": {"dept": "design", "color": "pink", "manager": "Design Lead", "initials": "DL"},
    "EducationDashboard.tsx": {"dept": "education", "color": "cyan", "manager": "Education Director", "initials": "ED"},
    "HealthDashboard.tsx": {"dept": "health", "color": "red", "manager": "Health Coordinator", "initials": "HC"},
    "MediaDashboard.tsx": {"dept": "media", "color": "indigo", "manager": "Media Director", "initials": "MD"},
    "PlatformAdminDashboard.tsx": {"dept": "platform", "color": "slate", "manager": "Platform Admin", "initials": "PA"},
    "ProcurementDashboard.tsx": {"dept": "procurement", "color": "teal", "manager": "Procurement Manager", "initials": "PM"},
    "ProjectControlsDashboard.tsx": {"dept": "project%20controls", "color": "violet", "manager": "Project Controls Manager", "initials": "PC"},
    "PropertyDashboard.tsx": {"dept": "property", "color": "emerald", "manager": "Property Manager", "initials": "PM"},
    "PurchasingDashboard.tsx": {"dept": "purchasing", "color": "lime", "manager": "Purchasing Manager", "initials": "PM"},
    "QAQCDashboard.tsx": {"dept": "qaqc", "color": "rose", "manager": "QA/QC Manager", "initials": "QM"},
    "RealEstateDashboard.tsx": {"dept": "real%20estate", "color": "sky", "manager": "Real Estate Manager", "initials": "RE"},
}

BASE_PATH = "/home/ubuntu/financial_automation_map/client/src/pages/"

def update_dashboard(filename, config):
    filepath = os.path.join(BASE_PATH, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return False
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Pattern to find the Team tab content
    old_pattern = r'(<TabsContent value="team" className="space-y-4 mt-4">\s*<Card className="p-6">\s*)<h3 className="font-semibold text-foreground mb-4">Department Team</h3>'
    
    # New header with link
    dept_name = config['dept'].replace('%20', ' ').title()
    new_header = f'''\\1<div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Department Team</h3>
                <Link href="/employee-directory?department={config['dept']}">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Users className="w-4 h-4" />
                    View Full Directory
                  </Button>
                </Link>
              </div>'''
    
    # Check if already updated
    if f'/employee-directory?department={config["dept"]}' in content:
        print(f"Already updated: {filename}")
        return True
    
    # Apply the replacement
    new_content = re.sub(old_pattern, new_header, content)
    
    if new_content == content:
        print(f"Pattern not found in: {filename}")
        return False
    
    # Also add the footer link before </Card></TabsContent>
    footer_pattern = r'(</div>\s*)(</Card>\s*</TabsContent>)'
    footer_replacement = f'''\\1<div className="mt-4 pt-4 border-t">
                <Link href="/employee-directory?department={config['dept']}">
                  <Button className="w-full gap-2">
                    <Users className="w-4 h-4" />
                    View All {dept_name} Team Members
                  </Button>
                </Link>
              </div>
            \\2'''
    
    # Find the team tab section and add footer
    # This is tricky - we need to add it in the right place
    
    with open(filepath, 'w') as f:
        f.write(new_content)
    
    print(f"Updated: {filename}")
    return True

def main():
    for filename, config in DASHBOARD_CONFIGS.items():
        update_dashboard(filename, config)

if __name__ == "__main__":
    main()
