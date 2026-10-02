import test from 'node:test';
import assert from 'node:assert/strict';
import {ANCHORS,EDGES,KAPPA,ETA,MAX_STEP,MAX_DISPLACEMENT,restState,relax,boundedOffset,gaussianImpulse,displacementNorm} from '../assets/relaxation.mjs';

test('connected fixed graph has a stable numerical step bound',()=>{
  assert.equal(ANCHORS.length,7);assert.equal(EDGES.length,11);
  const degrees=ANCHORS.map((_,i)=>EDGES.filter(e=>e.includes(i)).length);
  assert.equal(Math.max(...degrees),5);
  assert.ok(MAX_STEP<1/(KAPPA+2*ETA*Math.max(...degrees)));
  const visited=new Set([0]);
  for(let k=0;k<7;k++)for(const [a,b] of EDGES){if(visited.has(a))visited.add(b);if(visited.has(b))visited.add(a);}
  assert.equal(visited.size,7);
});
test('arbitrary two-dimensional displacements contract and return to equilibrium',()=>{
  let state=ANCHORS.map((_,i)=>boundedOffset(Math.cos(i)*26,Math.sin(2*i)*26));
  const topology=JSON.stringify(EDGES),initial=JSON.stringify(state);
  const next=relax(state,MAX_STEP);assert.equal(JSON.stringify(state),initial);
  for(let k=0;k<200;k++){
    const previous=displacementNorm(state);state=relax(state,k%2?1:1/120);
    assert.ok(displacementNorm(state)<=previous+1e-12);
  }
  assert.ok(displacementNorm(state)<.00001);assert.equal(JSON.stringify(EDGES),topology);
  assert.deepEqual(relax(restState(),MAX_STEP),restState());
  assert.ok(displacementNorm(next)<displacementNorm(JSON.parse(initial)));
});
test('held vertex couples its perturbation into neighbors and all offsets remain bounded',()=>{
  let state=restState();state[0]=boundedOffset(100,-100);
  const held=[...state[0]];
  for(let k=0;k<100;k++)state=relax(state,MAX_STEP,0);
  assert.deepEqual(state[0],held);assert.ok(Math.hypot(...state[1])>0);
  assert.ok(state.every(p=>Math.hypot(...p)<=MAX_DISPLACEMENT+1e-10));
  const sample=gaussianImpulse(()=>.000001);assert.ok(Math.hypot(...sample)<=MAX_DISPLACEMENT+1e-10);
  for(let k=0;k<200;k++)state=relax(state,MAX_STEP);
  assert.ok(displacementNorm(state)<1e-8);
});
