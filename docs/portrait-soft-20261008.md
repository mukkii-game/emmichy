# Softer illustrated face — 2026-10-08

User likes the existing Nordic portrait but requests slightly simpler nose, eyes and facial outline. Built-in image_gen edits the previous drawing; selected source assets/emmichy-nordic-soft-source-20261008.png. Reduced nasal modelling, iris/lid detail and softened cheek/jaw, retaining braids, costume, smile, pose and old-PC texture. Prior source and final PNG remain available for recovery.

Final assets/emmichy-nordic-soft-bust-20261008.png uses the same reproducible build: upper82% bust crop, area averaging,4×4 ordered dither,248×336 native pixels, exactly8 opaque digital RGB colors. No renderer, crop or palette algorithm change. scripts/build-portrait.mjs defaults and the shipped-file test now point at the new asset. App/social URL and release ID updated together.

Targeted actual-PNG test passes (CRC, dimensions, palette, opacity and8 used indices). This visual edit does not claim new dialogue/playthrough validation. PC-9801 tile restrictions and full-CRT limitations remain those in portrait-20261008.md.

Final prompt:

Use case: precise-object-edit / style-transfer.
Edit the attached existing Emmichy Nordic portrait. Change ONLY the facial drawing toward a slightly looser, softer, simplified illustration. The player likes the overall result but finds the eyes, nose and facial outline too realistic.
Keep the same woman, blond hair, two braids, blue eyes, freckles, small warm smile, pose, green embroidered bodice, white blouse, red ribbons, white pin, black background, framing and dense old-PC limited-RGB-color dither texture unchanged.
Facial changes: simplify the nose to a small restrained contour and a few shadow pixels; remove the strongly modelled bridge, nostril detail and dark anatomical shading. Simplify the eyes to clean friendly blue shapes with less iris/lid rendering and fewer lines; modest natural size, not huge glossy anime eyes. Gently soften and round the cheek/jaw contour, removing realistic cheek planes and hard sculpted shading. Simplify the lips to a relaxed small smile with minimal modelling. Softer illustrated expression, a little less precise and more approachable, while keeping clear distinct features.
Aim for the middle between a realistic computer portrait and a simple hand-drawn illustration. Do not turn into modern generic manga, chibi, a doll, or a different person. Retain the period PC graphic vocabulary: few saturated digital RGB base colors, midtones suggested by fine checkerboard/stipple pixel mixtures, crisp low-resolution contours. No smooth gradients, no added objects, no lettering or border. Maintain the image's exact composition so the existing upper-bust crop still works.
