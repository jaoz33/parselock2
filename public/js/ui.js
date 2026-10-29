export function toast(message, type = 'info') {
  const container = document.getElementById('toast-container') || createToastContainer();
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => { el.classList.add('toast-exit'); setTimeout(() => el.remove(), 300); }, 3000);
}

export function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.setAttribute('aria-live', 'polite');
  document.body.appendChild(container);
  return container;
}

export function showLoader(id) {
  const el = document.getElementById(id);
  if (el) el.hidden = false;
}

export function hideLoader(id) {
  const el = document.getElementById(id);
  if (el) el.hidden = true;
}

export function showModal(id) {
  const el = document.getElementById(id);
  if (el) { el.hidden = false; el.classList.add('modal-open'); }
}

export function hideModal(id) {
  const el = document.getElementById(id);
  if (el) { el.hidden = true; el.classList.remove('modal-open'); }
}

export function confirm(message) {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirm-modal');
    const msg = document.getElementById('confirm-message');
    const btnOk = document.getElementById('confirm-ok');
    const btnCancel = document.getElementById('confirm-cancel');
    msg.textContent = message;
    showModal('confirm-modal');
    const cleanup = () => { btnOk.removeEventListener('click', onOk); btnCancel.removeEventListener('click', onCancel); hideModal('confirm-modal'); };
    const onOk = () => { cleanup(); resolve(true); };
    const onCancel = () => { cleanup(); resolve(false); };
    btnOk.addEventListener('click', onOk);
    btnCancel.addEventListener('click', onCancel);
  });
}

export function showProgress(stage, current, total) {
  let bar = document.getElementById('progress-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'progress-bar';
    bar.style.cssText = 'position:fixed;bottom:1rem;right:1rem;width:320px;max-width:90vw;background:var(--surface);border:1px solid var(--border);border-radius:0.875rem;padding:1rem;box-shadow:0 12px 32px rgba(18,48,94,0.16);z-index:200;';
    document.body.appendChild(bar);
  }
  const pct = total ? Math.round((current / total) * 100) : 0;
  bar.innerHTML = '<div style="font-weight:600;font-size:0.875rem;margin-bottom:0.5rem;">' + escapeHtml(stage) + '</div>' +
    '<div style="height:8px;background:var(--bg);border-radius:9999px;overflow:hidden;">' +
    '<div id="progress-fill" style="height:100%;background:var(--teal);width:' + pct + '%;transition:width 0.2s;"></div></div>' +
    '<div style="font-size:0.75rem;color:var(--muted);margin-top:0.375rem;">' + current + ' / ' + total + '</div>';
}

export function hideProgress() {
  const bar = document.getElementById('progress-bar');
  if (bar) bar.remove();
}

function escapeHtml(text) {
  return (text || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
