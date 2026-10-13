"""Manual official episode-title inventory. No AI, runtime import or scheduling."""
import datetime
import hashlib
import json
import urllib.request
from pathlib import Path

url = 'https://www.anime-chiikawa.jp/json/episodeHistories.json'
request = urllib.request.Request(url, headers={'User-Agent': 'Emmichy source audit (https://github.com/mukkii-game/emmichy)'})
with urllib.request.urlopen(request, timeout=20) as response:
    raw = response.read(4_000_001)
if len(raw) > 4_000_000:
    raise ValueError('Unexpectedly large source; inspect before collecting')
data = json.loads(raw)
episodes = [{'no': str(row['no']), 'title': str(row['title'])} for row in data['episodes']]
if not episodes or len({row['no'] for row in episodes}) != len(episodes):
    raise ValueError('Missing or duplicate episode IDs')
report = {'source': url, 'checkedAt': datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9))).isoformat(),
          'sourceSha256': hashlib.sha256(raw).hexdigest(), 'count': len(episodes),
          'evidenceScope': 'Official episode numbers and titles only; not scene contents, popularity, release dates, or current manga serial.',
          'runtimeImport': False, 'episodes': episodes}
out = Path('docs/chiikawa-official-episode-index-20261012.json')
out.write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(json.dumps({'count': len(episodes), 'path': str(out), 'runtimeImport': False}))
