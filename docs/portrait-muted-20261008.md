# Portrait palette adjustment — 2026-10-08

User requests slightly lower saturation. This is an edit to the existing project palette/build configuration, with no new drawing or image-generation call. Source and illustration prompt remain those in [portrait-soft-20261008.md](portrait-soft-20261008.md).

Selected eight colors: `#000000 #2222dd #dd2222 #dd22dd #22dd22 #22dddd #dddd22 #ffffff`. All RGB components are multiples of17 on a16-level grid. Six chromatic colors change from100% to84.6% HSV saturation and from255 to221 maximum component; neutral black and white remain unchanged. This is the later PC-98 analog eight-of4096 palette model, not the previous initial fixed digital eight colors. NEC documents640×400 with eight colors selected from4096 when using analog RGB: [FC-9801V catalog](https://jpn.nec.com/fc/pdf/catalog/end/fc9801v.pdf). Whole HTML screen, CRT signal and pixel aspect are not emulated.

`src/portrait-palette.js` supplies the PNG builder and mood overlays so overlays use the same colors. Final file: `assets/emmichy-nordic-muted-bust-20261008.png`. Source: existing `assets/emmichy-nordic-soft-source-20261008.png`. Previous final asset is retained.

Validation: two targeted tests pass, including248×336 indexed PNG with exactly eight used colors, opacity/CRC and exact equality of the decoded pixel-index rows against the previous portrait. Thus every dot position, shape and dither pattern is unchanged. Local actual-browser crop: `portrait-muted-20261008-local.png`, module `portrait3`. No dialogue/AI quality check claimed.

Publication: PR #12 merged as13e67a7. Pages37790615652 failed before build, then remains queued after accepted rerun. Public browser still shows portrait2; publication verification pending. Local image is the completed result.
