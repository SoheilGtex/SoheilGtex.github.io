(() => {
  const root = document.documentElement;
  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;
  function apply(theme) {
    const light = theme === 'light';
    root.dataset.theme = light ? 'light' : 'dark';
    toggle.setAttribute('aria-pressed', String(light));
    toggle.setAttribute('aria-label', `Switch to ${light ? 'dark' : 'light'} theme`);
    toggle.querySelector('.theme-label').textContent = light ? 'Dark' : 'Light';
  }
  apply(root.dataset.theme);
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    apply(root.dataset.theme === 'light' ? 'dark' : 'light');
    try { localStorage.setItem('soheil-theme', root.dataset.theme); } catch (_) {}
  });
  window.addEventListener('storage', event => {
    if (event.key === 'soheil-theme') apply(event.newValue);
  });
})();
