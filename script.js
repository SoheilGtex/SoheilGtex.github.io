/* AOS init (scroll animations) */
AOS.init({
  duration: 650,
  easing: 'ease-out-cubic',
  once: true,
  offset: 80
});

/* Theme toggle with localStorage */
const root = document.documentElement;
const themeBtn = document.getElementById('btn-theme');
const saved = localStorage.getItem('theme');
if(saved){ root.setAttribute('data-theme', saved); } 
else if(window.matchMedia('(prefers-color-scheme: light)').matches){
  root.setAttribute('data-theme','light');
}
themeBtn.addEventListener('click', () => {
  const t = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', t);
  localStorage.setItem('theme', t);
});

/* Footer year */
document.getElementById('year').textContent = new Date().getFullYear();

/* Parallax + Bubbles (سبک و روان) */
const canvas = document.getElementById('bg-bubbles');
const c = canvas.getContext('2d');
let W, H, bubbles = [];

function resize(){
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  bubbles = Array.from({length: 40}, () => ({
    x: Math.random()*W,
    y: Math.random()*H,
    r: Math.random()*6+2,
    s: Math.random()*0.6+0.2,
    a: Math.random()*360
  }));
}
resize();
window.addEventListener('resize', resize);

function draw(){
  c.clearRect(0,0,W,H);
  for(const b of bubbles){
    b.y -= b.s * 0.6;
    b.x += Math.sin((b.a+=0.01))*0.2;
    if(b.y < -10){ b.y = H + 10; b.x = Math.random()*W; }
    const grad = c.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r*2.5);
    grad.addColorStop(0, 'rgba(110,201,255,0.35)');
    grad.addColorStop(1, 'rgba(184,136,255,0.05)');
    c.beginPath();
    c.fillStyle = grad;
    c.arc(b.x, b.y, b.r*2, 0, Math.PI*2);
    c.fill();
  }
  requestAnimationFrame(draw);
}
draw();

/* جلوگیری از پرش Projects هنگام لود روی موبایل */
document.addEventListener('DOMContentLoaded', () => {
  const projects = document.querySelectorAll('#projects .project');
  projects.forEach(card => {
    // اگر محتوای سنگینی اضافه شد، ارتفاع مینیمم رو از بین نبر
    card.style.minHeight = card.offsetHeight + 'px';
  });
});
