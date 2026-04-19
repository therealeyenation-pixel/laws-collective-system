import os
import re
from pathlib import Path

# Get all scroll files
upload_dir = Path("/home/ubuntu/upload")
scroll_files = sorted(upload_dir.glob("Scroll_*_FULL_CODE.txt"))

scrolls_data = []

for file in scroll_files:
    # Extract scroll number and name from filename
    match = re.match(r"Scroll_(\d+)_(.+)_FULL_CODE\.txt", file.name)
    if match:
        scroll_num = int(match.group(1))
        scroll_name = match.group(2).replace("_", " ")
        
        # Read first 50 lines to get purpose
        with open(file, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read(2000)
            
        scrolls_data.append({
            'number': scroll_num,
            'name': scroll_name,
            'filename': file.name,
            'preview': content[:300]
        })

# Print summary
print(f"Total Scrolls Found: {len(scrolls_data)}\n")
print("=" * 80)
for scroll in scrolls_data:
    print(f"Scroll {scroll['number']:02d}: {scroll['name']}")
print("=" * 80)
