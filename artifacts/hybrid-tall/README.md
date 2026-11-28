# Taller hybrid grass and rock clearance

[Before/after and rock views](comparison.png) · [Exact parameters, captures and review](record.json) · [Independent overlap verification](rock-verification.json)

Brush geometry is1.75x its previous nominal height: coarse0.42→0.735m, near0.72→1.26m before instance scale. Ground burial and root texture/pigment transition are unchanged. Reeds double96→192 instanced clumps. The sparse C tree, camera, sky, lighting, ecological tree placement, ground assets and rock transforms are preserved.

## Rock clipping

The new variant builds world-space bounds from actual visible rock geometry and every rock instance transform. It checks the **full transformed vegetation geometry bounds**, including card width and blade lean, against rock XZ footprints with8cm padding. Only overlapping plants are deterministically relocated; failed relocation would omit that instance. This prevents the root-only rejection problem where a wide card can still cut into a rock.

For seed29:15 rocks,3342 brush/reed clumps checked;202 relocated,0 removed. A separate browser readback of final rendered matrices and geometry bounds also finds**0 overlaps**. Two close rock views were actually visually inspected. Apparent screen-space overlap of foreground leaves over a rock is normal occlusion, not mesh intersection. Bounds are conservative and may leave extra room around irregular rocks; no claim of triangle-level packing or all-seed visual approval.

## Render review and cost

Actual640x360 hero, close, elevated inspection and rock-view images were inspected. The brush is visibly taller and the reeds more frequent while keeping the opening readable. Some low alpha edges and close geometric reed-strip appearance remain from the prior representation. Previous hybrid recapture is pixel-identical to its saved reference; original variant remains available.

|Seed29 hero|Calls|Triangles|Brush clumps|Reed clumps|
|---|---:|---:|---:|---:|
|Previous hybrid|12|109,594|3,150|96|
|Taller cleared hybrid|12|122,266|3,150|192|

All grass remains GPU instanced; no per-reed calls or hard blade shadow casting. Target layout reproduction/non-target guards pass, page/shader errors none, targeted `npx tsc --noEmit` passed. No device FPS/hardware overdraw benchmark; only seed29 was reviewed. Puget/rainforest paths were not edited or recaptured.

Changed files: `src/lib/forest/savanna-recipe.ts` adds the opt-in taller hybrid and actual-rock clearance; `visual-lab/feedback/taller-hybrid-rock-clearance.json` records the explicit request. This folder preserves source snapshots, camera/render parameters, evidence and measurements. No commit, push, deployment or default-renderer promotion.

## Preview

`http://localhost:3001/explore?lat=-2.3&lon=35.2&habitat=grassland&conditional=1&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&encounter=1&camera=human&composition=C&groundLighting=B&illumination=on&pretty=on&treeStudy=C&labCandidate=r-fidelity-tuft-hybrid-tall`

Use `labCandidate=r-fidelity-tuft-hybrid` for previous hybrid. Stop here for visual review.
