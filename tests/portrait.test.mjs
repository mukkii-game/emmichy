import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {inflateSync} from 'node:zlib';
import {pngChunks,digitalPalette} from '../scripts/portrait-png.mjs';
import {portraitPalette} from '../src/portrait-palette.js';

test('shipped portrait is an opaque 248x336 indexed image using eight PC-98 analog palette colors',async()=>{
 const chunks=pngChunks(await fs.readFile(new URL('../assets/emmichy-nordic-muted-bust-20261008.png',import.meta.url)));
 const head=chunks.find(c=>c.type==='IHDR').data,palette=chunks.find(c=>c.type==='PLTE').data;
 assert.equal(head.readUInt32BE(0),248);assert.equal(head.readUInt32BE(4),336);
 assert.equal(head[8],8);assert.equal(head[9],3);assert.deepEqual([...palette],portraitPalette.flat());
 assert.ok([...palette].every(v=>v%17===0),'all components lie on the16-level analog RGB grid');
 assert.ok(!chunks.some(c=>c.type==='tRNS'));
 const rows=inflateSync(Buffer.concat(chunks.filter(c=>c.type==='IDAT').map(c=>c.data))),used=new Set();
 assert.equal(rows.length,249*336);
 for(let y=0;y<336;y++){assert.equal(rows[y*249],0);for(const value of rows.subarray(y*249+1,(y+1)*249)){assert.ok(value<8);used.add(value);}}
 assert.equal(used.size,8);
});

test('palette edit keeps every previous portrait dot and lowers saturation of all six chromatic colors',async()=>{
 const read=async name=>pngChunks(await fs.readFile(new URL(`../assets/${name}`,import.meta.url)));
 const old=await read('emmichy-nordic-soft-bust-20261008.png'),next=await read('emmichy-nordic-muted-bust-20261008.png');
 const pixels=chunks=>inflateSync(Buffer.concat(chunks.filter(c=>c.type==='IDAT').map(c=>c.data)));
 assert.deepEqual(pixels(next),pixels(old),'exact pixel indices and positions must remain unchanged');
 const saturation=rgb=>(Math.max(...rgb)-Math.min(...rgb))/Math.max(...rgb);
 for(let i=1;i<=6;i++)assert.ok(saturation(portraitPalette[i])<saturation(digitalPalette[i]));
 assert.deepEqual(portraitPalette[0],digitalPalette[0]);assert.deepEqual(portraitPalette[7],digitalPalette[7]);
});
