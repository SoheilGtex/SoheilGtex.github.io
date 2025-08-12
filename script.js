/* AOS (scroll animations) */
AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, offset: 80 });

/* Theme toggle with localStorage */
const root = document.documentElement;
const themeBtn = document.getElementById('btn-theme');
const savedTheme = localStorage.getItem('theme');
if(savedTheme){ root.setAttribute('data-theme', savedTheme); }
else if(window.matchMedia('(prefers-color-scheme: light)').matches){
  root.setAttribute('data-theme','light');
}
themeBtn?.addEventListener('click', () => {
  const t = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', t);
  localStorage.setItem('theme', t);
});

/* Year */
document.getElementById('year').textContent = new Date().getFullYear();

/* Typing effect */
const typingEl = document.getElementById('typing');
const words = [
  "Data Engineer | Python | Data Pipelines & Analytics",
  "Data Engineer · Python Developer",
  "ETL · BI · EDA · Financial Data"
];
let wi = 0, ci = 0, deleting = false;
function typeLoop(){
  if(!typingEl) return;
  const word = words[wi];
  typingEl.textContent = word.slice(0, ci);
  if(!deleting && ci < word.length){ ci++; }
  else if(deleting && ci > 0){ ci--; }
  else{
    if(!deleting){ setTimeout(()=> deleting = true, 900); }
    else{ deleting = false; wi = (wi+1) % words.length; }
  }
  setTimeout(typeLoop, deleting ? 35 : 55);
}
typeLoop();

/* Skill glow on hover (mobile-friendly) */
document.querySelectorAll('.chips li').forEach(li=>{
  li.addEventListener('mouseenter', ()=> li.classList.add('skill-glow'));
  li.addEventListener('mouseleave', ()=> li.classList.remove('skill-glow'));
  li.addEventListener('touchstart', ()=> li.classList.toggle('skill-glow'), {passive:true});
});

/* Parallax Bubbles (محوتر تا رو متن توی کارت‌ها تو ذوق نزنه) */
const canvas = document.getElementById('bg-bubbles');
const ctx = canvas.getContext('2d');
let W, H, bubbles = [];
function resize(){
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  const COUNT = Math.min(50, Math.floor(W/30));
  bubbles = Array.from({length: COUNT}, () => ({
    x: Math.random()*W,
    y: Math.random()*H,
    r: Math.random()*5 + 2,
    s: Math.random()*0.5 + 0.15,
    a: Math.random()*360
  }));
}
resize();
window.addEventListener('resize', resize);

function draw(){
  ctx.clearRect(0,0,W,H);
  for(const b of bubbles){
    b.y -= b.s * 0.55;
    b.x += Math.sin((b.a+=0.008))*0.2;
    if(b.y < -10){ b.y = H + 10; b.x = Math.random()*W; }
    const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r*2.2);
    grad.addColorStop(0, 'rgba(110,201,255,0.16)');
    grad.addColorStop(1, 'rgba(184,136,255,0.03)');
    ctx.beginPath();
    ctx.fillStyle = grad;
    ctx.arc(b.x, b.y, b.r*2, 0, Math.PI*2);
    ctx.fill();
  }
  requestAnimationFrame(draw);
}
draw();

/* Fix Projects initial height to avoid jump on mobile */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('#projects .project').forEach(card => {
    card.style.minHeight = Math.max(150, card.offsetHeight) + 'px';
  });
});
