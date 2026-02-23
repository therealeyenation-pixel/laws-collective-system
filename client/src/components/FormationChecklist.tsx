import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

interface ChecklistItem {
  id: string;
  label: string;
  category: "llc" | "trust" | "nonprofit";
}

const checklistItems: ChecklistItem[] = [
  // LLC Items (Priority)
  { id: "llc-ein", label: "Obtain EIN for LLCs (Have 3: 41-3683894, 39-3122993, 84-4976416)", category: "llc" },
  { id: "llc-articles", label: "File Articles of Organization with GA Secretary of State", category: "llc" },
  { id: "llc-operating", label: "Draft and sign Operating Agreements", category: "llc" },
  { id: "llc-registered-agent", label: "Designate Registered Agent", category: "llc" },
  { id: "llc-bank", label: "Open business bank accounts", category: "llc" },
  { id: "llc-licenses", label: "Obtain required business licenses", category: "llc" },
  
  // Trust Items
  { id: "trust-ein", label: "Apply for EIN for 98 Trust", category: "trust" },
  { id: "trust-agreement", label: "Draft Trust Agreement", category: "trust" },
  { id: "trust-fund", label: "Fund the Trust with initial assets", category: "trust" },
  
  // Nonprofit/508 Items
  { id: "nonprofit-ein", label: "Apply for EIN for 508(c)(1)(a) Academy", category: "nonprofit" },
  { id: "nonprofit-declaration", label: "Prepare 508(c)(1)(a) declaration documentation", category: "nonprofit" },
  { id: "nonprofit-bylaws", label: "Draft Academy bylaws", category: "nonprofit" },
];

export default function FormationChecklist() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("formationChecklist");
    if (saved) {
      setCheckedItems(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage when changed
  const handleCheck = (id: string, checked: boolean) => {
    const updated = { ...checkedItems, [id]: checked };
    setCheckedItems(updated);
    localStorage.setItem("formationChecklist", JSON.stringify(updated));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = checklistItems.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Show only first 6 items on dashboard (priority items)
  const priorityItems = checklistItems.slice(0, 6);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-4">
        <Progress value={progressPercent} className="flex-1 h-3" />
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          {completedCount}/{totalCount} ({progressPercent}%)
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {priorityItems.map((item) => (
          <div
            key={item.id}
            className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
              checkedItems[item.id]
                ? "bg-green-100 dark:bg-green-900/30"
                : "bg-background/50 hover:bg-background/80"
            }`}
          >
            <Checkbox
              id={item.id}
              checked={checkedItems[item.id] || false}
              onCheckedChange={(checked) => handleCheck(item.id, checked as boolean)}
              className="mt-0.5"
            />
            <label
              htmlFor={item.id}
              className={`text-sm cursor-pointer ${
                checkedItems[item.id]
                  ? "line-through text-muted-foreground"
                  : "text-foreground"
              }`}
            >
              {item.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
