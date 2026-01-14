import json
import re
from pathlib import Path

upload_dir = Path("/home/ubuntu/upload")
code_files = sorted(upload_dir.glob("Scroll_*_FULL_CODE.txt"))

scrolls = []

for code_file in code_files:
    match = re.match(r"Scroll_(\d+)_(.+)_FULL_CODE\.txt", code_file.name)
    if match:
        scroll_num = int(match.group(1))
        scroll_name = match.group(2).replace("_", " ")
        
        # Read the file to extract purpose and key info
        with open(code_file, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # Extract purpose section
        purpose_match = re.search(r"I\. PURPOSE OF THIS SCROLL\s*\n(.+?)(?=\n\n|\nII\.)", content, re.DOTALL)
        purpose = purpose_match.group(1).strip() if purpose_match else "Purpose not found"
        
        # Categorize scroll
        if 41 <= scroll_num <= 53:
            category = "House & Activation"
        elif 54 <= scroll_num <= 61:
            category = "Financial & Ledger"
        else:
            category = "Other"
        
        scrolls.append({
            "number": scroll_num,
            "name": scroll_name,
            "category": category,
            "purpose": purpose[:200],
            "file": code_file.name
        })

# Write JSON
output_file = "/home/ubuntu/scrolls_data.json"
with open(output_file, 'w') as f:
    json.dump(scrolls, f, indent=2)

print(f"✓ JSON data created: {output_file}")
print(f"✓ Total scrolls: {len(scrolls)}")
print("\nScrolls by category:")
for scroll in scrolls:
    print(f"  Scroll {scroll['number']:02d}: {scroll['name']}")
