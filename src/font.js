// Original 5 x 7 glyphs in an 8 x 8 character cell. Not an extracted NEC ROM.
import {displayText} from './engine.js?v=20261010-chiihype2';
const rows={
' ': '0000000','?':'E1104040','!':'4444404','.':'0000004',',':'0000048',':':'0040040',';':'0040048','-':'000E000','_':'000000F','/':'1124488','+':'004E400','=':'00E0E00','>':'8421248','<':'1248421','(':'2444442',')':'8444448','[':'E88888E',']':'E22222E','*':'04E4A00',"'":'4400000','"':'AA00000',
'0':'EJJJLJE','1':'4C4444E','2':'EJ1248V','3':'U1211JU','4':'26AJV22','5':'V8U11JU','6':'E88UJJE','7':'V124888','8':'EJJEJJE','9':'EJJF11E',
'A':'EHHHVHH','B':'UHHUHHU','C':'FGGGGGF','D':'UHHHHHU','E':'VGGUGGV','F':'VGGUGGG','G':'FGGNHHF','H':'HHHVHHH','I':'E44444E','J':'72222HC','K':'HIKOKIH','L':'GGGGGGV','M':'HRLLHHH','N':'HPLJHHH','O':'EHHHHHE','P':'UHHUGGG','Q':'EHHHLIF','R':'UHHUKIH','S':'FGGE11U','T':'V444444','U':'HHHHHHE','V':'HHHHHA4','W':'HHHLLLA','X':'HHA4AHH','Y':'HHA4444','Z':'V1248GV',
'ア':'0V1154C','イ':'0124C44','ウ':'04VJ124','エ':'0V4444V','オ':'02V626A','カ':'04V5592','キ':'04V4V44','ク':'08FJ124','ケ':'08FV224','コ':'0V1111V','サ':'0AVAA24','シ':'081814O','ス':'0F124AJ','セ':'08V9987','ソ':'0J9124O','タ':'08FJA24','チ':'0164V48','ツ':'0LL112C','テ':'0E0V448','ト':'088C A88'.replaceAll(' ',''),'ナ':'04V448G','ニ':'000E00V','ヌ':'0V125A8','ネ':'04V24LA','ノ':'011248G','ハ':'044AAJJ','ヒ':'08IUS87','フ':'0V1124O','ヘ':'004AJG1','ホ':'04V4EL4','マ':'0V12542','ミ':'0C20603','ム':'04489V1','メ':'0124CA8','モ':'0F4V447','ヤ':'08V9988','ユ':'00E222V','ヨ':'0V11F1V','ラ':'0E0V12C','リ':'099912C','ル':'0AA AABL'.replaceAll(' ',''),'レ':'08889AO','ロ':'0VJJJJV','ワ':'0VJ112C','ヲ':'0V11V2C','ン':'081014O','ー':'000V000','。':'0000066','、':'0000084','・':'0004000','「':'7444000','」':'000444S','゛':'A500000','゜':'6600000',
};
// Base-32 notation lets every row encode five pixels.
const glyphs=new Map(Object.entries(rows).map(([c,s])=>[c,[...s].map(n=>parseInt(n,32))]));
const fullMap=new Map();
for(let i=0xff61;i<=0xff9f;i++){const h=String.fromCharCode(i);fullMap.set(h,h.normalize('NFKC'));}
const small={'ァ':'ア','ィ':'イ','ゥ':'ウ','ェ':'エ','ォ':'オ','ッ':'ツ','ャ':'ヤ','ュ':'ユ','ョ':'ヨ'};
export function text(ctx,value,x,y,color='#fff',scale=1) {
  ctx.fillStyle=color;
  let px=x,py=y;
  for(const c of value) {
    if(c==='\n'){px=x;py+=9*scale;continue;}
    let key=fullMap.get(c)??c;
    if(c==='ﾞ') key='゛'; if(c==='ﾟ')key='゜';
    const tiny=Boolean(small[key]); key=small[key]??key;
    const bits=glyphs.get(key)??glyphs.get('?');
    bits.forEach((row,iy)=>{for(let ix=0;ix<5;ix++)if(row&(1<<(4-ix))){
      if(tiny && (ix===1||iy===1))continue;
      ctx.fillRect(px+(ix+1)*scale,py+(iy+(tiny?1:0))*scale,scale,scale);
    }});
    px+=8*scale;
  }
}
export function kana(ctx,value,x,y,color,scale=1){text(ctx,displayText(value),x,y,color,scale);}
