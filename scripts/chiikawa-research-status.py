"""Append one result with an exclusive lock; never rewrite the other AI's line."""
import argparse
import datetime
import os
import time
from pathlib import Path

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--agent',choices=['gemini','claude'],required=True);parser.add_argument('--count',type=int,required=True);parser.add_argument('--reason',default='なし')
args=parser.parse_args()
if args.count<0: parser.error('count must be nonnegative')
folder=Path(__file__).resolve().parents[1]/'research'/'chiikawa';folder.mkdir(parents=True,exist_ok=True)
lock=folder/'.status.lock';line=f"{datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9))).isoformat(timespec='seconds')} | {args.agent} | {args.count}件 | {args.reason.replace(chr(10),' ')[:240]}\n"
handle=None
for _ in range(30):
    try: handle=os.open(lock,os.O_CREAT|os.O_EXCL|os.O_WRONLY);break
    except FileExistsError: time.sleep(.1)
if handle is None:
    (folder/f'{args.agent}.STATUS.pending.txt').write_text(line,encoding='utf-8');parser.exit(1,'状態ファイルが使用中です。担当別pendingへ保存しました。\n')
try:
    with (folder/'STATUS.md').open('a',encoding='utf-8',newline='') as out: out.write(line)
finally:
    os.close(handle);lock.unlink()
print(line.strip())
