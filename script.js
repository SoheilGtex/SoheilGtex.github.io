// theme toggle with persistence
const root = document.documentElement;
const toggle = document.getElementById('themeToggle');
function setTheme(mode){ root.setAttribute('data-theme', mode); localStorage.setItem('theme', mode); }
const stored = localStorage.getItem('theme'); if(stored){ setTheme(stored); }
toggle?.addEventListener('click', ()=> setTheme(root.getAttribute('data-theme')==='dark'?'light':'dark'));

// reveal on scroll with staggered delays
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      const delay = Number(e.target.dataset.delay||0);
      setTimeout(()=> e.target.classList.add('show'), delay);
      io.unobserve(e.target);
    }
  })
},{threshold:.15});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// year
document.getElementById('y').textContent = new Date().getFullYear();
