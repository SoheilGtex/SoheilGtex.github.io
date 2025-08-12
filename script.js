/* AOS (scroll animations) */
AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, offset: 80 });

/* Theme toggle with localStorage */
const root = document.documentElement;
const themeBtn = document.getElementById('btn-theme');
const savedTheme = localStorage.getItem('theme');
if(savedTheme){
  root.setAttribute('data-theme', savedTheme);
}else if(window.matchMedia('(prefers-color-scheme: light)').matches){
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

/* Interactive glow helper */
function addInteractiveGlow(selector){
  document.querySelectorAll(selector).forEach(el=>{
    const add = ()=> el.classList.add('glow');
    const rm  = ()=> el.classList.remove('glow');
    el.addEventListener('mouseenter', add);
    el.addEventListener('mouseleave', rm);
    el.addEventListener('focus', add);
    el.addEventListener('blur', rm);
    el.addEventListener('touchstart', ()=> el.classList.toggle('glow'), {passive:true});
  });
}

/* Glow on: skills, language pills, contact pills, topbar buttons & PDF */
addInteractiveGlow('.chips li');
addInteractiveGlow('.lang-pills .pill');
addInteractiveGlow('.contact-pills .pill');
addInteractiveGlow('.actions .btn');     // LinkedIn / GitHub / Download PDF / Theme

/* Fix Projects initial height to avoid jump on mobile */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('#projects .project').forEach(card => {
    card.style.minHeight = Math.max(150, card.offsetHeight) + 'px';
  });
});

/* توجه: بابل‌های پس‌زمینه و کدهای canvas حذف شدند */
