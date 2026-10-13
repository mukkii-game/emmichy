"""Offline structural checks. Passing does not verify a claim against its source."""
import copy
import argparse
import datetime
import json
import sys
from pathlib import Path
from urllib.parse import urlparse

def validate(data):
    errors, ids = [], set()
    for row in data.get('records', []):
        key = row.get('id', '<missing>')
        if key in ids:
            errors.append(f'{key}: duplicate id')
        ids.add(key)
        for field in ('id', 'subject', 'predicate', 'object', 'fact', 'feeling', 'source', 'checkedAt', 'scope', 'spoiler', 'limits'):
            if not row.get(field):
                errors.append(f'{key}: missing {field}')
        source = urlparse(row.get('source', ''))
        if source.scheme != 'https' or not source.netloc:
            errors.append(f'{key}: invalid source URL')
        try:
            if datetime.date.fromisoformat(row.get('checkedAt', '')) > datetime.date.today():
                errors.append(f'{key}: future check date')
        except ValueError:
            errors.append(f'{key}: invalid check date')
        if row.get('evidence') not in ('official', 'reported', 'wiki', 'fan-wiki'):
            errors.append(f'{key}: unknown evidence type')
        if row.get('scope') == 'current-serial' and not data.get('serialCoverage', {}).get('currentVerified'):
            errors.append(f'{key}: unverified latest serial claim')
    if not ids:
        errors.append('empty knowledge bundle')
    return errors

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('path', nargs='?', default='docs/chiikawa-knowledge-20261012.json')
    parser.add_argument('--self-test', action='store_true')
    args = parser.parse_args()
    path = Path(args.path)
    data = json.loads(path.read_text(encoding='utf-8'))
    if args.self_test:
        for mutation in ('duplicate', 'source', 'date', 'current'):
            bad = copy.deepcopy(data)
            if mutation == 'duplicate': bad['records'].append(bad['records'][0])
            if mutation == 'source': bad['records'][0]['source'] = ''
            if mutation == 'date': bad['records'][0]['checkedAt'] = 'not-a-date'
            if mutation == 'current': bad['records'][0]['scope'] = 'current-serial'
            assert validate(bad), mutation
    problems = validate(data)
    print(json.dumps({'records': len(data['records']), 'errors': problems, 'semanticVerification': False}, ensure_ascii=False))
    sys.exit(bool(problems))
