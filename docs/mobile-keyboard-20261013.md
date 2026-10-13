# Phone keyboard and fixed game screen — 2026-10-13

The human reports that the large portrait shrinks or leaves the screen during phone text entry. The old phone CSS ties portrait width to visual viewport height, so a390×844 screen changing to390×430 halves the portrait from324px to165px. Its portrait-orientation query can also stop matching when the keyboard makes the available area wider than tall. The JavaScript only handles viewport height, without its pan offset.

Implemented20261013-phone1: mobile main is fixed to visual viewport width/height/top/left and remains in phone mode by width. The canvas scale depends on available width (maximum320px), while its viewport crops the lower body and centres the face during keyboard entry. The portrait remains present above the chat; the chat log is the scrollable area. No font reduction: dialogue22px. Mobile logo/header/footer/help/status are hidden normally; settings open with the edge gear. Opening or resuming on mobile does not programmatically focus the entry or raise a keyboard. Existing desktop focus and layout remain.

Actual local Chromium browser observations (no external LLM calls):

-390×844→390×430: canvas320px wide in both states; keyboard chat153px high versus119px before. Input remains within430px; pageScroll0, settings hidden. Normal chat335px versus318px before. Screenshots in docs/mobile-keyboard-{normal,typing}-20261013.png.
-360×640→340,428×926→360 and320×568→300: unchanged portrait width for each pair, keyboard face viewport and chat/input remain visible, pageScroll0,22px font. The428×360 case keeps phone mode even though the available viewport is landscape-shaped.
-1280×900 desktop: two columns, header/settings remain visible, main retains static positioning.
-Viewport tests cover keyboard vs browser chrome, resize/focus/pan anchoring, orientation reset, pinch-zoom preservation and listener cleanup.204 local tests pass.

Evidence: docs/mobile-keyboard-browser-20261013.json. These are browser viewport simulations, not tests on a physical iPhone/Android keyboard. Safari/OS keyboard pan and safe-area behaviour should be checked by the human. Backend/model behaviour is unchanged.
