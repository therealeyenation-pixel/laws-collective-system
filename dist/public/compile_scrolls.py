import os
import re
from pathlib import Path
from collections import defaultdict

upload_dir = Path("/home/ubuntu/upload")

# Organize scrolls by category
categories = {
    'House & Activation': (41, 60),
    'Financial & Ledger': (54, 61),
}

output = []
output.append("# LuvOnPurpose Master Developer Archive - Complete Scroll Compilation\n")
output.append("## Archive Version: v1.0\n")
output.append("## Last Updated: November 17, 2024\n\n")

# Get all code files
code_files = sorted(upload_dir.glob("Scroll_*_FULL_CODE.txt"))

for code_file in code_files:
    match = re.match(r"Scroll_(\d+)_(.+)_FULL_CODE\.txt", code_file.name)
    if match:
        scroll_num = int(match.group(1))
        scroll_name = match.group(2).replace("_", " ")
        
        output.append(f"\n## Scroll {scroll_num}: {scroll_name}\n")
        
        # Read the file
        with open(code_file, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
            # Take first 80 lines
            output.append("```\n")
            output.extend(lines[:80])
            output.append("...\n")
            output.append("```\n")

# Write to file
output_file = "/home/ubuntu/LuvOnPurpose_Master_Compilation.md"
with open(output_file, 'w') as f:
    f.writelines(output)

print(f"✓ Master compilation created: {output_file}")
print(f"✓ Total scrolls compiled: {len(code_files)}")
