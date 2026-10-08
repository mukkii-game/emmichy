// Build the illustration into a native-size tile that fits PC-9801's
// 640x400 / digital 8-color mode; this is not a complete PC emulator.
import fs from 'node:fs/promises';
import {decodeRgb,encodeIndexed,digitalPalette} from './portrait-png.mjs';
const source=process.argv[2]||'assets/emmichy-nordic-source-20261008.png';
const target=process.argv[3]||'assets/emmichy-nordic-bust-20261008.png';
const image=decodeRgb(await fs.readFile(source)),width=248,height=336;
const cropHeight=Math.floor(image.height*.82),cropWidth=Math.min(image.width,cropHeight*width/height),left=(image.width-cropWidth)/2;
const indices=new Uint8Array(width*height),bayer=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
for(let y=0;y<height;y++)for(let x=0;x<width;x++){
 const x0=left+x*cropWidth/width,x1=left+(x+1)*cropWidth/width,y0=y*cropHeight/height,y1=(y+1)*cropHeight/height;
 const rgb=[0,0,0];let area=0;
 // Area filtering averages the generated pseudo-dither before we construct
 // the final, deliberate one-logical-pixel checkerboard. No double dithering.
 for(let sy=Math.floor(y0);sy<Math.ceil(y1);sy++)for(let sx=Math.floor(x0);sx<Math.ceil(x1);sx++){
  const weight=(Math.min(x1,sx+1)-Math.max(x0,sx))*(Math.min(y1,sy+1)-Math.max(y0,sy));
  const at=(sy*image.width+sx)*image.channels,alpha=image.channels===4?image.pixels[at+3]/255:1;
  for(let c=0;c<3;c++)rgb[c]+=image.pixels[at+c]*alpha*weight;area+=weight;
 }
 const threshold=(bayer[(y%4)*4+x%4]+.5)*255/16;
 indices[y*width+x]=(rgb[2]/area>threshold?1:0)+(rgb[0]/area>threshold?2:0)+(rgb[1]/area>threshold?4:0);
}
await fs.writeFile(target,encodeIndexed(width,height,indices));
console.log(JSON.stringify({source,target,nativePixels:[width,height],mode:'PC-9801 digital 8-color tile; not full-screen/CRT emulation',palette:digitalPalette,usedColors:new Set(indices).size}));
