// Minimal PNG IO for reproducible portrait builds: 8-bit RGB/RGBA input,
// indexed 8-bit output. No network or image-generation dependency.
import {inflateSync,deflateSync} from 'node:zlib';
const signature=Buffer.from([137,80,78,71,13,10,26,10]);
const crcTable=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc(bytes){let n=0xffffffff;for(const b of bytes)n=crcTable[(n^b)&255]^(n>>>8);return (n^0xffffffff)>>>0;}
function chunk(type,data){const tag=Buffer.from(type),out=Buffer.alloc(data.length+12);out.writeUInt32BE(data.length);tag.copy(out,4);data.copy(out,8);out.writeUInt32BE(crc(Buffer.concat([tag,data])),data.length+8);return out;}
export function pngChunks(bytes){
 if(!bytes.subarray(0,8).equals(signature))throw Error('Not PNG');
 const chunks=[];for(let at=8;at<bytes.length;){const n=bytes.readUInt32BE(at),type=bytes.toString('ascii',at+4,at+8),data=bytes.subarray(at+8,at+8+n);if(crc(bytes.subarray(at+4,at+8+n))!==bytes.readUInt32BE(at+8+n))throw Error('PNG CRC mismatch');chunks.push({type,data});at+=n+12;}
 return chunks;
}
const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
export function decodeRgb(bytes){
 const chunks=pngChunks(bytes),head=chunks.find(c=>c.type==='IHDR').data;
 const width=head.readUInt32BE(0),height=head.readUInt32BE(4),channels=head[9]===2?3:head[9]===6?4:0;
 if(head[8]!==8||!channels||head[12]!==0)throw Error('Expected noninterlaced 8-bit RGB/RGBA source');
 const rows=inflateSync(Buffer.concat(chunks.filter(c=>c.type==='IDAT').map(c=>c.data))),stride=width*channels,pixels=Buffer.alloc(stride*height);
 for(let y=0;y<height;y++){const filter=rows[y*(stride+1)];if(filter>4)throw Error('Invalid PNG filter');for(let x=0;x<stride;x++){
  const i=y*stride+x,a=x>=channels?pixels[i-channels]:0,b=y?pixels[i-stride]:0,c=y&&x>=channels?pixels[i-stride-channels]:0;
  pixels[i]=(rows[y*(stride+1)+x+1]+(filter===0?0:filter===1?a:filter===2?b:filter===3?Math.floor((a+b)/2):paeth(a,b,c)))&255;
 }}
 return {width,height,channels,pixels};
}
export const digitalPalette=Object.freeze([[0,0,0],[0,0,255],[255,0,0],[255,0,255],[0,255,0],[0,255,255],[255,255,0],[255,255,255]]);
export function encodeIndexed(width,height,indices,palette=digitalPalette){
 const head=Buffer.alloc(13);head.writeUInt32BE(width);head.writeUInt32BE(height,4);head[8]=8;head[9]=3;
 const rows=Buffer.alloc((width+1)*height);for(let y=0;y<height;y++)Buffer.from(indices.subarray(y*width,(y+1)*width)).copy(rows,y*(width+1)+1);
 return Buffer.concat([signature,chunk('IHDR',head),chunk('PLTE',Buffer.from(palette.flat())),chunk('IDAT',deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]);
}
