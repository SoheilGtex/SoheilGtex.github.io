// Theme toggle with persistence
const root = document.documentElement;
const toggle = document.getElementById('themeToggle');

function setTheme(mode){
  root.setAttribute('data-theme', mode);
  localStorage.setItem('theme', mode);
}

const stored = localStorage.getItem('theme');
if(stored){ setTheme(stored); }
toggle?.addEventListener('click', () => {
  const now = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  setTheme(now);
});

// Reveal on scroll
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('show'); observer.unobserve(e.target); }
  })
},{ threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

// Year
document.getElementById('y').textContent = new Date().getFullYear();
