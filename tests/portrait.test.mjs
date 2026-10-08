import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {inflateSync} from 'node:zlib';
import {pngChunks,digitalPalette} from '../scripts/portrait-png.mjs';

test('shipped portrait really is an opaque 248x336 indexed image using exactly the eight digital RGB colors',async()=>{
 const chunks=pngChunks(await fs.readFile(new URL('../assets/emmichy-nordic-bust-20261008.png',import.meta.url)));
 const head=chunks.find(c=>c.type==='IHDR').data,palette=chunks.find(c=>c.type==='PLTE').data;
 assert.equal(head.readUInt32BE(0),248);assert.equal(head.readUInt32BE(4),336);
 assert.equal(head[8],8);assert.equal(head[9],3);assert.deepEqual([...palette],digitalPalette.flat());
 assert.ok(!chunks.some(c=>c.type==='tRNS'));
 const rows=inflateSync(Buffer.concat(chunks.filter(c=>c.type==='IDAT').map(c=>c.data))),used=new Set();
 assert.equal(rows.length,249*336);
 for(let y=0;y<336;y++){assert.equal(rows[y*249],0);for(const value of rows.subarray(y*249+1,(y+1)*249)){assert.ok(value<8);used.add(value);}}
 assert.equal(used.size,8);
});
