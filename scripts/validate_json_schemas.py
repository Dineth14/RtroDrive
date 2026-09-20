"""Validate checked-in shared examples and profiles against Draft2020-12 schemas."""
import json
from pathlib import Path
from jsonschema import Draft202012Validator

root = Path(__file__).resolve().parents[1]
for schema_file in (root / 'shared/schemas').glob('*.json'):
    schema = json.loads(schema_file.read_text(encoding='utf-8'))
    Draft202012Validator.check_schema(schema)
    validator = Draft202012Validator(schema)
    files = ((root / 'shared/vehicle-profiles').glob('*.json') if 'vehicle-profile' in schema_file.name
             else [root / 'apps/mobile/assets/demo-telemetry.json'])
    for path in files:
        validator.validate(json.loads(path.read_text(encoding='utf-8')))
        print('PASS', path.relative_to(root))
