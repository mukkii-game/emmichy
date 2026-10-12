"""Structural CSV check; does not establish factual accuracy."""
import argparse
import csv
import datetime
import json
from pathlib import Path
from urllib.parse import urlparse

HEADERS='ID,名前,種類,媒体,出典区分,確認状況,確認日,本文位置,短い事実,関係の主語,関係,関係の対象,別名,特徴タグ,日常の接点,接続しやすさ,評価理由,えみちぃの感想案,混同禁止事項,ネタバレ,公開日,URL'.split(',')
def load(path):
    with Path(path).open(encoding='utf-8-sig',newline='') as source:
        reader=csv.DictReader(source)
        if reader.fieldnames!=HEADERS: raise ValueError('列名または順番が指定と異なります')
        return list(reader)
def check(rows):
    errors=[]; ids=set()
    for number,row in enumerate(rows,1):
        key=row.get('ID',f'line:{number}')
        if None in row or any(not isinstance(row.get(h),str) or not row[h].strip() for h in HEADERS): errors.append(f'{key}: 空欄または列数の誤り'); continue
        if key in ids: errors.append(f'{key}: 重複ID')
        ids.add(key)
        if row['種類'] not in {'entity','relation','scene','expression','music','item','place','person','arc','latest'}: errors.append(f'{key}: 種類')
        if row['媒体'] not in {'manga','anime','film','official-goods','cross-media'}: errors.append(f'{key}: 媒体')
        if row['確認状況'] not in {'一次本文確認','二次のみ','不明'}: errors.append(f'{key}: 確認状況')
        if row['出典区分'] not in {'一次資料','Wikipedia','個人まとめ','不明'}: errors.append(f'{key}: 出典区分')
        if len(row['短い事実'])>180: errors.append(f'{key}: 要約が長すぎます')
        if row['接続しやすさ'] not in {'1','2','3','4','5','不明'}: errors.append(f'{key}: 接続しやすさ')
        if row['ネタバレ'] not in {'none','minor','major','不明'}: errors.append(f'{key}: ネタバレ')
        if row['確認状況']=='一次本文確認' and (row['出典区分']!='一次資料' or any(row[h]=='不明' for h in ('本文位置','短い事実','URL'))): errors.append(f'{key}: 一次確認の根拠不足')
        if row['URL']!='不明' and (urlparse(row['URL']).scheme!='https' or not urlparse(row['URL']).netloc): errors.append(f'{key}: URL')
        for field in ('公開日','確認日'):
            if row[field]=='不明': continue
            try:
                if datetime.date.fromisoformat(row[field])>datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9))).date(): errors.append(f'{key}: 未来の{field}')
            except ValueError: errors.append(f'{key}: {field}の形式')
    return errors
if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('path');args=parser.parse_args()
    try: rows=load(args.path); errors=check(rows)
    except (OSError,ValueError) as exc: parser.exit(1,f'{exc}\n')
    confirmed=sum(r.get('確認状況')=='一次本文確認' for r in rows)
    print(json.dumps({'rows':len(rows),'primaryConfirmed':confirmed,'errors':errors,'semanticVerification':False},ensure_ascii=False))
    raise SystemExit(bool(errors))
