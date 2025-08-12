/* ========== Utilities ========== */
const $ = (s, root=document)=> root.querySelector(s);
const $$ = (s, root=document)=> Array.from(root.querySelectorAll(s));

/* ========== Year in footer ========== */
$('#year').textContent = new Date().getFullYear();

/* ========== Theme Toggle with persistence ========== */
const root = document.documentElement;
const themeBtn = $('#btn-theme');
const storedTheme = localStorage.getItem('theme');
if (storedTheme) root.setAttribute('data-theme', storedTheme);

function toggleTheme(){
  const isDark = root.getAttribute('data-theme') !== 'light';
  root.setAttribute('data-theme', isDark ? 'light' : 'dark');
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
  themeBtn.setAttribute('aria-pressed', String(!isDark));
}
themeBtn.addEventListener('click', toggleTheme);

/* ========== Typing effect for subtitle ========== */
const subtitle = $('#typed-subtitle');
const lines = [
  'Data Engineer | Python | Data Pipelines & Analytics'
];
let li = 0, ci = 0, typingForward = true;

function typeLoop(){
  const text = lines[li];
  if (typingForward){
    ci++;
    if (ci >= text.length){ typingForward = false; setTimeout(typeLoop, 1300); return; }
  } else {
    ci--;
    if (ci <= 0){ typingForward = true; li = (li+1)%lines.length; }
  }
  subtitle.textContent = text.slice(0, Math.max(0, ci));
  setTimeout(typeLoop, typingForward ? 38 : 24);
}
typeLoop();

/* ========== Reveal on scroll ========== */
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if (e.isIntersecting){
      e.target.classList.add('reveal-once','active');
      observer.unobserve(e.target);
    }
  })
},{ threshold:.12, rootMargin:'40px' });
$$('.reveal').forEach(el=> observer.observe(el));

/* ========== Skill glow for touch ========== */
$$('.skill').forEach(el=>{
  el.addEventListener('touchstart', ()=> el.classList.add('skill-glow'), {passive:true});
  el.addEventListener('touchend',   ()=> el.classList.remove('skill-glow'));
  el.addEventListener('mouseleave', ()=> el.classList.remove('skill-glow'));
});

/* ========== Background Bubbles Canvas ========== */
const canvas = $('#bg-bubbles');
const ctx = canvas.getContext('2d');
let W, H, bubbles=[];

function rand(min,max){ return Math.random()*(max-min)+min }
function resize(){
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize); resize();

function makeBubbles(count){
  bubbles = [];
  for(let i=0;i<count;i++){
    bubbles.push({
      x: rand(0,W),
      y: rand(0,H),
      r: rand(2,6),
      sp: rand(.3, 1.2),
      hue: rand(190, 270)
    })
  }
}
makeBubbles(80);

function draw(){
  ctx.clearRect(0,0,W,H);
  for(const b of bubbles){
    ctx.beginPath();
    const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r*3);
    grad.addColorStop(0, `hsla(${b.hue}, 90%, 70%, .75)`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.arc(b.x, b.y, b.r*3, 0, Math.PI*2);
    ctx.fill();

    // move
    b.y -= b.sp;
    if (b.y < -10){ b.y = H + 10; b.x = rand(0,W); }
  }
  requestAnimationFrame(draw);
}
draw();

/* ========== Prevent timeline dots overlaying text (safety) ========== */
/* already handled via CSS padding; here we ensure z-index of text > dots if needed */
$$('.t-item').forEach(it=>{
  const dot = $('.t-dot', it);
  const content = $('.t-content', it);
  content.style.position = 'relative';
  content.style.zIndex = 1;
});

/* ========== Smooth scroll for anchor links (if added later) ========== */
document.addEventListener('click', (e)=>{
  const a = e.target.closest('a[href^="#"]');
  if(!a) return;
  e.preventDefault();
  const id = a.getAttribute('href').slice(1);
  const el = document.getElementById(id);
  if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
});
