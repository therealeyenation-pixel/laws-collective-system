import re

with open('client/src/App.tsx', 'r') as f:
    content = f.read()

lines = content.split('\n')

# Pattern for single default page imports
page_import_pattern = re.compile(r'^import\s+(\w+)\s+from\s+["\'](@\/pages\/|\.\/pages\/)(.*?)["\'];?\s*$')

# Pattern for the multi-import from placeholders (starts with import { and ends with from "@/pages/placeholders")
# We need to handle multi-line imports too

lazy_imports = []
kept_lines = []
in_placeholder_import = False
placeholder_buffer = ""

for line in lines:
    # Handle multi-line placeholder import
    if in_placeholder_import:
        placeholder_buffer += " " + line.strip()
        if "from" in line and "placeholders" in line:
            in_placeholder_import = False
            # Parse all names from the buffer
            names_match = re.search(r'\{([^}]+)\}', placeholder_buffer)
            if names_match:
                names = [n.strip() for n in names_match.group(1).split(',') if n.strip()]
                for name in names:
                    lazy_imports.append(f'const {name} = lazy(() => import("@/pages/placeholders").then(m => ({{ default: m.{name} }})));')
            continue
        continue

    # Check for start of placeholder multi-import
    if re.match(r'^import\s+\{', line) and 'placeholders' in line:
        # Single-line placeholder import
        names_match = re.search(r'\{([^}]+)\}', line)
        if names_match:
            names = [n.strip() for n in names_match.group(1).split(',') if n.strip()]
            for name in names:
                lazy_imports.append(f'const {name} = lazy(() => import("@/pages/placeholders").then(m => ({{ default: m.{name} }})));')
        continue
    
    if re.match(r'^import\s+\{', line) and 'pages/' in line and 'placeholders' not in line:
        # Check if it's a page import with named exports
        # Skip - these are rare, handle individually
        kept_lines.append(line)
        continue

    # Check for multi-line placeholder import start
    if re.match(r'^import\s+\{$', line.strip()) or (re.match(r'^import\s+\{', line) and '}' not in line and 'pages' not in line):
        # Could be start of multi-line import - peek ahead by checking next context
        # Actually let's just check if this is a placeholder import start
        if re.match(r'^import\s+\{', line) and '}' not in line:
            in_placeholder_import = True
            placeholder_buffer = line.strip()
            continue

    match = page_import_pattern.match(line)
    if match:
        name = match.group(1)
        path_prefix = match.group(2)
        path_rest = match.group(3)
        if path_prefix == './pages/':
            full_path = './pages/' + path_rest
        else:
            full_path = '@/pages/' + path_rest
        lazy_imports.append(f'const {name} = lazy(() => import("{full_path}"));')
    else:
        kept_lines.append(line)

# Now insert: 
# 1. Add { lazy, Suspense } to the react import
# 2. Add all lazy imports after the regular imports
# 3. Wrap Router content in Suspense

new_lines = []
imports_done = False
added_lazy = False

for line in kept_lines:
    # Add lazy and Suspense to existing react import if present
    if 'from "react"' in line and 'lazy' not in line:
        # Add lazy, Suspense
        line = line.replace('from "react"', '').rstrip(';').rstrip()
        # Extract existing imports
        existing = re.search(r'\{([^}]+)\}', line)
        if existing:
            existing_imports = existing.group(1)
            line = f'import {{ {existing_imports}, lazy, Suspense }} from "react";'
        new_lines.append(line)
        continue
    
    new_lines.append(line)

# Find where to insert lazy imports - after the last regular import
insert_idx = 0
for i, line in enumerate(new_lines):
    if line.startswith('import ') or line.startswith('} from '):
        insert_idx = i + 1

# Insert lazy imports
lazy_block = '\n// Lazy-loaded page components for code-splitting\n' + '\n'.join(lazy_imports) + '\n'
new_lines.insert(insert_idx, lazy_block)

# Add Suspense wrapper around the Switch in Router function
final_content = '\n'.join(new_lines)

# Wrap the Switch content with Suspense
final_content = final_content.replace(
    '<Switch>',
    '<Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>\n      <Switch>'
)

# Find the closing </Switch> and add </Suspense> after it
final_content = final_content.replace(
    '</Switch>',
    '</Switch>\n      </Suspense>'
)

with open('client/src/App.tsx', 'w') as f:
    f.write(final_content)

print(f"Converted {len(lazy_imports)} imports to lazy")
print(f"Total lines: {len(final_content.split(chr(10)))}")
