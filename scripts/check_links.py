"""Check local markdown links outside generated/vendor content."""
from pathlib import Path
import re
import sys
from urllib.parse import unquote

root = Path(__file__).resolve().parents[1]
errors = []
for path in root.rglob('*.md'):
    if any(part in ('node_modules', '.git', 'dist', 'build', '.build', '.dart_tool') for part in path.relative_to(root).parts):
        continue
    for target in re.findall(r'\]\(([^)]+)\)', path.read_text(encoding='utf-8')):
        if target.startswith(('http:', 'https:', '#', 'mailto:')):
            continue
        target = unquote(target.split('#')[0])
        if not target or target.startswith('<'):
            continue
        if not (path.parent / target).exists():
            errors.append(f'{path.relative_to(root)} -> {target}')
print('\n'.join(errors) if errors else 'PASS local markdown links')
sys.exit(bool(errors))
