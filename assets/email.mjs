// The address remains a selectable mailto link unless copying can be enhanced.
const address=document.getElementById('email-address');
const feedback=document.getElementById('email-feedback');
let clipboard;
try { clipboard=navigator.clipboard; } catch (_) {}
if(address && feedback && typeof clipboard?.writeText === 'function') {
  const email=(address.dataset.email || address.getAttribute('href')?.replace(/^mailto:/,'') || address.textContent).trim();
  let timer=0;
  function confirm(text) {
    clearTimeout(timer);feedback.textContent=text;
    timer=setTimeout(()=>{feedback.textContent='';},2200);
  }
  function fallback() {
    address.removeAttribute('role');address.removeAttribute('aria-label');
    address.removeAttribute('title');
    address.removeEventListener('click',copy);address.removeEventListener('keydown',keyboard);
    // Keep the whole address selectable and the separate mail client action intact.
    const selection=window.getSelection();
    if(selection){const range=document.createRange();range.selectNodeContents(address);selection.removeAllRanges();selection.addRange(range);}
    confirm('Select to copy');
  }
  async function copy(event) {
    event.preventDefault();
    try { await clipboard.writeText(email);confirm('Copied'); }
    catch (_) { fallback(); }
  }
  function keyboard(event) {
    if(event.key===' '){event.preventDefault();address.click();}
  }
  address.setAttribute('role','button');
  address.setAttribute('aria-label',`Copy email address ${email}`);
  address.title='Copy email address';
  address.addEventListener('click',copy);address.addEventListener('keydown',keyboard);
}
