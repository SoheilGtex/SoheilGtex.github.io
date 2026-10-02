import {ANCHORS,EDGES,restState,relax,boundedOffset,gaussianImpulse,displacementNorm} from './relaxation.mjs';
const svg=document.getElementById('home-graph');
const figure=svg.closest('figure'),button=document.getElementById('perturb-button');
const vertices=[...svg.querySelectorAll('[data-vertex]')];
const paths=[...svg.querySelectorAll('[data-edge]')];
const foundations=[...svg.querySelectorAll('[data-foundation]')];
const hint=figure.querySelector('.instrument-hint');
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
let state=restState(),frame=0,last=0,held=-1,pointer=null,inView=true;
function paint() {
  const points=ANCHORS.map(([x,y],i)=>[x+state[i][0],y+state[i][1]]);
  vertices.forEach((v,i)=>v.setAttribute('transform',`translate(${points[i].join(' ')})`));
  paths.forEach((p,i)=>{const [a,b]=EDGES[i];p.setAttribute('d',`M${points[a].join(' ')}L${points[b].join(' ')}`);});
  foundations.forEach(p=>{const i=Number(p.dataset.foundation);p.setAttribute('d',`M${points[i].join(' ')}L${ANCHORS[i][0]} 266`);});
  svg.dataset.state=displacementNorm(state)<.07?'rest':'responding';
}
function cancel() { if(frame)cancelAnimationFrame(frame);frame=0;last=0; }
function tick(time) {
  frame=0;
  if(reduced.matches||document.hidden||!inView)return;
  const dt=last?(time-last)/1000:1/60;last=time;
  state=relax(state,dt,held);paint();
  if(displacementNorm(state)>.07||held>=0)frame=requestAnimationFrame(tick);
  else {state=restState();last=0;paint();}
}
function start() {if(!frame&&!reduced.matches&&!document.hidden&&inView)frame=requestAnimationFrame(tick);}
function reset() {cancel();held=-1;pointer=null;state=restState();paint();}
function behavior() {
  reset();figure.classList.toggle('is-static',reduced.matches);button.hidden=reduced.matches;
  vertices.forEach((vertex,i)=>{
    if(reduced.matches){vertex.removeAttribute('tabindex');vertex.removeAttribute('role');vertex.removeAttribute('aria-label');}
    else {vertex.setAttribute('tabindex','0');vertex.setAttribute('role','button');vertex.setAttribute('aria-label',`Vertex ${i+1}. Arrow keys apply a perturbation; Escape restores equilibrium.`);}
  });
  hint.textContent=reduced.matches?'Fixed topology. A stable runtime.':'Drag a vertex. Watch the perturbation settle.';
}
const random=() => {
  if(!globalThis.crypto?.getRandomValues)return Math.random();
  const data=new Uint32Array(1);crypto.getRandomValues(data);return (data[0]+.5)/4294967296;
};
button.addEventListener('click',()=>{
  if(reduced.matches)return;
  const i=Math.min(6,Math.floor(random()*7));const [x,y]=gaussianImpulse(random);
  state[i]=boundedOffset(state[i][0]+x,state[i][1]+y);paint();start();
});
vertices.forEach((vertex,i)=>{
  vertex.addEventListener('pointerdown',event=>{
    if(reduced.matches||pointer!==null||event.button!==0)return;
    event.preventDefault();held=i;pointer=event.pointerId;vertex.setPointerCapture(pointer);vertex.focus();start();
  });
  vertex.addEventListener('pointermove',event=>{
    if(pointer!==event.pointerId||held!==i)return;
    const matrix=svg.getScreenCTM();if(!matrix)return;
    const point=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());
    state[i]=boundedOffset(point.x-ANCHORS[i][0],point.y-ANCHORS[i][1]);paint();start();
  });
  const release=()=>{if(held===i){held=-1;pointer=null;start();}};
  vertex.addEventListener('pointerup',release);vertex.addEventListener('pointercancel',release);vertex.addEventListener('lostpointercapture',release);
  vertex.addEventListener('keydown',event=>{
    if(reduced.matches)return;
    if(event.key==='Escape'){event.preventDefault();reset();return;}
    const directions={ArrowLeft:[-9,0],ArrowRight:[9,0],ArrowUp:[0,-9],ArrowDown:[0,9]};
    if(event.key==='Enter'||event.key===' '){event.preventDefault();state[i]=gaussianImpulse(random);}
    else if(directions[event.key]){event.preventDefault();const [x,y]=directions[event.key];state[i]=boundedOffset(state[i][0]+x,state[i][1]+y);}
    else return;
    paint();start();
  });
});
document.addEventListener('visibilitychange',()=>{if(document.hidden){held=-1;pointer=null;cancel();}else start();});
if('IntersectionObserver' in window)new IntersectionObserver(entries=>{
  inView=entries[0].isIntersecting;if(!inView){held=-1;pointer=null;cancel();}else if(displacementNorm(state)>.07)start();
}).observe(figure);
reduced.addEventListener('change',behavior);behavior();
