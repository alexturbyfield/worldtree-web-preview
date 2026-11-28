# Holm-oak halfway material

[Before/after](comparison.png): left brighter A, right50% original texture-driven shading/color +50% brighter A. Hierarchical normals remain crown0.45/cluster0.40/leaf0.15. Actual images inspected: deeper olive body and more natural tonal/texture variation while broad highlights remain. Repeated rounded crown lobes remain; geometry was not changed.

Updated Lab: http://127.0.0.1:3121/holm-normals . The diagnostic renderer now defaults to the halfway material; existing weight controls remain unchanged. Only the diagnostic material is cloned/adjusted, preserving the original lighting hooks. Main scene/other species remain unchanged.

Files: `src/lib/forest/holm-oak-study.ts`, `scripts/studies/holm-normal-study.cjs`; feedback/evidence in `visual-lab/mediterranean/holm-oak/halfway-material-review.json`. TypeScript passed and matched rendered geometry signatures/counts remained identical:2 draw calls /29,520 triangles. No extra normal/geometry changes, aesthetic loops, commit, push or deployment.
