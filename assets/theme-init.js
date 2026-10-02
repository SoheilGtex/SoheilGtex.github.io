// Run before CSS. Dark is the explicit default, including light OS settings.
(() => {
  let theme = 'dark';
  try { if (localStorage.getItem('soheil-theme') === 'light') theme = 'light'; } catch (_) {}
  document.documentElement.dataset.theme = theme;
})();
