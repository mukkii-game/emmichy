// Eight entries on the PC-98 analog RGB 4-bit/channel grid.
// Slightly reduced saturation/brightness; black and white remain neutral.
export const portraitColors=Object.freeze(['#000000','#2222dd','#dd2222','#dd22dd','#22dd22','#22dddd','#dddd22','#ffffff']);
export const portraitPalette=Object.freeze(portraitColors.map(hex=>Object.freeze([1,3,5].map(at=>parseInt(hex.slice(at,at+2),16)))));
