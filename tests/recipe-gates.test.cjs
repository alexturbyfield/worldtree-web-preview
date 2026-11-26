const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs');
const {validateRecipe,allowed}=require('../scripts/studies/recipe-gates.cjs');
const recipe=JSON.parse(fs.readFileSync('visual-lab/savanna-recipe.json'));
test('portable recipe preserves evidence states; automated support cannot become human approval',()=>{
 assert.equal(validateRecipe(recipe),true);
 const wrong=structuredClone(recipe);wrong.rules[0].status='human-approved';assert.throws(()=>validateRecipe(wrong),/Human approval/);
 const unsupported=structuredClone(recipe);unsupported.rules[0].evidence=[];unsupported.rules[0].status='experimentally-supported';assert.throws(()=>validateRecipe(unsupported),/evidence/);
});
test('staged controller blocks exhausting the grass gate and bypassing failed composition',()=>{
 assert.throws(()=>allowed('B'),/three corrections exhausted/);
 assert.throws(()=>allowed('D'),/Previous gate/);
 assert.throws(()=>allowed('C'),/checkpoint/);
});
