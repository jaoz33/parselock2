import { currentUser, watchAuth, doSignIn, doSignUp, doSignOut, doGoogleSignIn, currentSession } from './auth.js';
import { listTasks, readTask, addTask, saveTask, removeTask } from './tasks.js';
import { initDrawer } from './editor/drawer.js';
import { Ads } from './ads.js';
import { detectPlaceholders } from './editor/placeholders.js';
import { applyPageSetup, PAGE_SIZES } from './editor/pageSetup.js';
import { parseSheet, previewRows, autoMap, renderMappingUI } from './sheet.js';
import { mergeRow } from './generate.js';
import { exportDocx, exportPdf, downloadBlob, downloadZip } from './export.js';
import { toast, confirm, showProgress, hideProgress } from './ui.js';
import { execCmd, formatBlock, insertPlaceholder, insertTable, insertPageBreak } from './editor/toolbar.js';
import { applyFont, applyFontSize, applyColor, clearFormat, toggleBold, toggleItalic, toggleUnderline, toggleStrike, toggleSub, toggleSuper, justifyLeft, justifyCenter, justifyRight, justifyFull, insertBullet, insertNumber, indent, outdent } from './editor/formatting.js';

window.ADS_ENABLED = false;

let state = { user: null, tasks: [], current: null, sheet: null, mapping: {}, placeholders: [], dirty: false, inheritFormats: {} };
const routes = { '#templates': renderTemplates, '#editor': renderEditor, '#privacy': renderPrivacy, '#terms': renderTerms };

function navigate() {
  const hash = location.hash || '#templates';
  const key = hash.split('/')[0];
  const fn = routes[key] || renderTemplates;
  const publicPages = ['#privacy', '#terms'];
  if (!publicPages.includes(key)) {
    clearAutosave();
  }
  fn();
}

function renderTemplates() {
  clearAutosave();
  document.getElementById('app').innerHTML = '<div class="container"><div class="toolbar"><button id="new-template" class="btn">New Template</button></div><div id="template-list"><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></div></div>';
  document.getElementById('new-template').onclick = createNewTemplate;
  loadTemplates();
}

async function createNewTemplate() {
  const task = state.user
    ? await addTask({ title: 'Untitled template', template_html: '<p><br></p>', placeholders: [], status: 'draft' })
    : await localAddTask({ title: 'Untitled template', template_html: '<p><br></p>', placeholders: [], status: 'draft' });
  state.tasks.unshift(task);
  openTask(task.id);
}

async function loadTemplates() {
  const list = document.getElementById('template-list');
  if (!list) return;
  list.innerHTML = '<div class="loader"></div>';
  try {
    state.tasks = state.user ? await listTasks() : await localListTasks();
    if (!state.tasks.length) {
      list.innerHTML = '<p class="empty">No templates yet. Click <b>New Template</b> to start.</p>';
      return;
    }
    list.innerHTML = state.tasks.map(t => cardHtml(t)).join('');
    bindTaskActions();
  } catch (e) {
    list.innerHTML = '<p class="error">Failed to load templates: ' + escape(e.message) + '</p>';
  }
}

function cardHtml(t) {
  const isLocal = t.is_local || t.id.startsWith('local-');
  const deleteBtn = state.user || isLocal
    ? '<button data-delete="' + t.id + '" class="btn btn-danger btn-small">Delete</button>'
    : '<span class="hint">Sign in to save</span>';
  return '<div class="card"><h3>' + escape(t.title) + '</h3><p>Status: ' + escape(t.status) + ' | Placeholders: ' + (t.placeholders?.length || 0) + ' | Updated: ' + new Date(t.updated_at).toLocaleDateString() + '</p><div class="card-actions"><button data-open="' + t.id + '" class="btn btn-small">Open</button>' + deleteBtn + '</div></div>';
}

function bindTaskActions() {
  document.querySelectorAll('[data-open]').forEach(b => b.onclick = () => openTask(b.dataset.open));
  document.querySelectorAll('[data-delete]').forEach(b => b.onclick = async () => {
    if (!await confirm('Delete this template?')) return;
    const id = b.dataset.delete;
    if (state.user) {
      await removeTask(id);
    } else {
      await localRemoveTask(id);
    }
    loadTemplates();
  });
}

async function openTask(id) {
  const task = state.user ? await readTask(id) : await localReadTask(id);
  if (!task) { location.hash = '#templates'; return; }
  state.current = task;
  state.placeholders = detectPlaceholders(task.template_html || '');
  location.hash = '#editor/' + id;
}

function renderEditor() {
  const id = location.hash.split('/')[1];
  const task = state.tasks.find(t => t.id === id) || state.current;
  if (!task) { location.hash = '#templates'; return; }
  state.current = task;
  const saveBtn = state.user ? 'Save' : 'Sign in to save';
  document.getElementById('app').innerHTML = '<div class="editor-shell"><div class="editor-topbar"><button id="editor-close" class="btn btn-secondary">Close</button><input id="editor-title" class="input" value="' + escape(task.title) + '" /><button id="editor-save" class="btn" title="Ctrl+S">' + saveBtn + '</button><button id="editor-generate" class="btn" title="Ctrl+Enter">Generate</button><button id="import-docx" class="btn btn-secondary">Import DOCX</button><button id="page-setup" class="btn btn-secondary">Page Setup</button><input type="file" id="docx-input" accept=".docx" hidden /></div><div id="tool-drawer" class="tool-drawer"><div id="drawer-handle" class="drawer-handle" aria-expanded="false">Tools</div><div class="tool-panels"><div class="tool-group"><button onclick="window.Toolbar.toggleBold()" title="Bold (Ctrl+B)"><b>B</b></button><button onclick="window.Toolbar.toggleItalic()" title="Italic (Ctrl+I)"><i>I</i></button><button onclick="window.Toolbar.toggleUnderline()" title="Underline (Ctrl+U)"><u>U</u></button><button onclick="window.Toolbar.toggleStrike()" title="Strikethrough"><s>S</s></button><button onclick="window.Toolbar.toggleSub()" title="Subscript">Sub</button><button onclick="window.Toolbar.toggleSuper()" title="Superscript">Sup</button></div><div class="tool-group"><button onclick="window.Toolbar.justifyLeft()" title="Align left">Left</button><button onclick="window.Toolbar.justifyCenter()" title="Center">Center</button><button onclick="window.Toolbar.justifyRight()" title="Right">Right</button><button onclick="window.Toolbar.justifyFull()" title="Justify">Justify</button></div><div class="tool-group"><button onclick="window.Toolbar.insertBullet()" title="Bullet list">List</button><button onclick="window.Toolbar.insertNumber()" title="Numbered list">1. List</button><button onclick="window.Toolbar.indent()" title="Indent">Indent</button><button onclick="window.Toolbar.outdent()" title="Outdent">Outdent</button></div><div class="tool-group"><button onclick="window.Toolbar.formatBlock(&quot;H1&quot;)" title="Heading 1">H1</button><button onclick="window.Toolbar.formatBlock(&quot;H2&quot;)" title="Heading 2">H2</button><button onclick="window.Toolbar.formatBlock(&quot;P&quot;)" title="Paragraph">P</button></div><div class="tool-group"><button onclick="window.Toolbar.insertTable()" title="Insert table">Table</button><button onclick="window.Toolbar.insertPageBreak()" title="Page break">Break</button><button onclick="window.Toolbar.insertPlaceholder()" title="Insert placeholder">&lt;&gt;</button></div><div class="tool-group"><button onclick="window.Toolbar.applyFont(&quot;system-ui&quot;)" title="System font">Sans</button><button onclick="window.Toolbar.applyFont(&quot;ui-monospace&quot;)" title="Mono font">Mono</button><button onclick="window.Toolbar.applyFontSize(3)" title="Normal size">Norm</button><button onclick="window.Toolbar.applyFontSize(1)" title="Small">Small</button></div><div class="tool-group"><button onclick="window.Toolbar.applyColor(&quot;foreColor&quot;, &quot;#12305e&quot;)" title="Navy">Navy</button><button onclick="window.Toolbar.applyColor(&quot;foreColor&quot;, &quot;#0fa68a&quot;)" title="Teal">Teal</button><button onclick="window.Toolbar.applyColor(&quot;foreColor&quot;, &quot;#f0a23b&quot;)" title="Amber">Amber</button><button onclick="window.Toolbar.clearFormat()" title="Clear formatting">Clear</button></div></div></div><div id="editor" class="page-canvas" contenteditable="true"></div><div id="sheet-panel" class="sheet-panel" hidden><div class="sheet-toolbar"><input type="file" id="sheet-input" accept=".csv,.xlsx,.xls" /><button id="preview-sheet" class="btn">Preview</button><button id="preview-merge" class="btn btn-secondary">Preview First</button><button id="clear-sheet" class="btn btn-secondary">Clear</button><select id="filename-column"><option value="">Filename column...</option></select><button id="download-docx" class="btn">DOCX</button><button id="download-pdf" class="btn">PDF</button></div><div id="sheet-preview" class="sheet-preview"></div><div id="mapping-container" class="mapping-container"></div></div></div>';
  initDrawer();
  const editor = document.getElementById('editor');
  if (editor) editor.contentEditable = 'true';
  if (task.page_setup) applyPageSetup(task.page_setup);
  bindEditorActions();
}

function bindEditorActions() {
  const editor = document.getElementById('editor');
  if (!editor) return;
  editor.addEventListener('input', () => { state.dirty = true; state.placeholders = detectPlaceholders(editor.innerHTML); });
  document.getElementById('editor-save').onclick = async () => {
    if (!state.user) {
      showAuthModal('signin');
      return;
    }
    const title = document.getElementById('editor-title').value.trim() || 'Untitled';
    const saveFn = state.user ? saveTask : localSaveTask;
    await saveFn(state.current.id, { title, template_html: editor.innerHTML, placeholders: state.placeholders });
    state.dirty = false;
    toast('Saved');
  };
  document.getElementById('editor-close').onclick = async () => {
    if (state.dirty && !await confirm('Discard unsaved changes?')) return;
    clearAutosave();
    location.hash = '#templates';
  };
  document.getElementById('editor-generate').onclick = () => { 
    const panel = document.getElementById('sheet-panel'); 
    panel.hidden = !panel.hidden; 
    if (!panel.hidden && !state.sheet) {
      document.getElementById('sheet-preview').innerHTML = '<p class="hint">Upload a spreadsheet to map columns and generate documents.</p>';
    }
  };
  document.getElementById('import-docx').onclick = () => document.getElementById('docx-input').click();
  document.getElementById('docx-input').onchange = (e) => { if (validateDocx(e.target.files[0])) importDocx(); };
  document.getElementById('page-setup').onclick = showPageSetup;
  document.getElementById('preview-sheet').onclick = previewSheet;
  document.getElementById('preview-merge').onclick = previewFirstMerge;
  document.getElementById('clear-sheet').onclick = clearSheet;
  document.getElementById('download-docx').onclick = () => downloadDocx();
  document.getElementById('download-pdf').onclick = () => downloadPdf();
  window.Toolbar = { execCmd, formatBlock, insertPlaceholder, insertTable, insertPageBreak, toggleBold, toggleItalic, toggleUnderline, toggleStrike, toggleSub, toggleSuper, justifyLeft, justifyCenter, justifyRight, justifyFull, insertBullet, insertNumber, indent, outdent, clearFormat, applyFont, applyFontSize, applyColor };
}

function validateDocx(file) {
  if (!file) { toast('Choose a DOCX file first'); return false; }
  const ext = file.name.toLowerCase().split('.').pop();
  if (ext !== 'docx') { toast('Only .docx files are supported'); return false; }
  if (file.size > 10 * 1024 * 1024) { toast('DOCX file must be under 10 MB'); return false; }
  return true;
}

function validateSheet(file) {
  if (!file) { toast('Choose a spreadsheet first'); return false; }
  const ext = file.name.toLowerCase().split('.').pop();
  if (!['csv', 'xlsx', 'xls'].includes(ext)) { toast('Only .csv, .xlsx, and .xls files are supported'); return false; }
  if (file.size > 5 * 1024 * 1024) { toast('Spreadsheet must be under 5 MB'); return false; }
  return true;
}

async function previewSheet() {
  const input = document.getElementById('sheet-input');
  const file = input.files[0];
  if (!file) { toast('Choose a file first'); return; }
  if (!validateSheet(file)) return;
  try {
    const rows = await parseSheet(file);
    if (rows.length > 2000) {
      toast('Spreadsheet exceeds 2000 rows. Please use a smaller file.');
      return;
    }
    state.sheet = rows;
    const preview = previewRows(rows, 5);
    const headers = rows.length ? Object.keys(rows[0]) : [];
    state.mapping = autoMap(state.placeholders, headers);
    state.inheritFormats = detectInheritedFormats();
    const out = document.getElementById('sheet-preview');
    out.innerHTML = '<pre>' + escape(JSON.stringify(preview, null, 2)) + '</pre><p>Headers: ' + headers.join(', ') + '</p>';
    const select = document.getElementById('filename-column');
    select.innerHTML = '<option value="">Filename column...</option>' + headers.map(h => '<option value="' + escape(h) + '">' + escape(h) + '</option>').join('');
    const mappingContainer = document.getElementById('mapping-container');
    mappingContainer.innerHTML = '';
    const mappingUi = renderMappingUI(state.placeholders, headers, state.mapping, (ph, col) => { state.mapping[ph] = col; });
    mappingContainer.appendChild(mappingUi);
  } catch (e) {
    toast('Failed to parse sheet: ' + e.message);
  }
}

function previewFirstMerge() {
  if (!state.sheet?.length) { toast('Upload a sheet first'); return; }
  const col = document.getElementById('filename-column').value;
  const editor = document.getElementById('editor');
  const row = state.sheet[0];
  const html = mergeRow(editor.innerHTML, row, state.mapping, state.placeholders, state.inheritFormats);
  const name = (col ? row[col] : 'row_1') + '.html';
  const win = window.open('', '_blank');
  win.document.write('<html><head><title>Preview: ' + escape(name) + '</title><style>body{font-family:sans-serif;padding:40px;background:#f3f5f9} .preview-box{background:#fff;padding:40px;border:1px solid #dde3ee;border-radius:8px;max-width:800px;margin:0 auto;}</style></head><body><div class="preview-box">' + html + '</div></body></html>');
  win.document.close();
}

async function downloadDocx() {
  if (!state.sheet?.length) { toast('Upload a sheet first'); return; }
  const col = document.getElementById('filename-column').value;
  const editor = document.getElementById('editor');
  const files = {};
  let errors = 0;
  for (let i = 0; i < state.sheet.length; i++) {
    const row = state.sheet[i];
    const name = (col ? row[col] : ('row_' + (i + 1))) + '.docx';
    showProgress('Generating: ' + name, i + 1, state.sheet.length);
    try {
      const html = mergeRow(editor.innerHTML, row, state.mapping, state.placeholders, state.inheritFormats);
      const { default: docx } = await import('https://cdn.jsdelivr.net/npm/docx@9.1.1/build/index.umd.min.js');
      const doc = new docx.Document({
        sections: [{ children: [new docx.Paragraph({ children: [new docx.TextRun({ text: html, break: 1 })] })] }]
      });
      const blob = await docx.Packer.toBlob(doc);
      files[name] = blob;
    } catch (e) {
      errors++;
      toast('Failed: ' + name + ' - ' + e.message, 4000);
    }
  }
  hideProgress();
  if (errors) {
    toast('Generated ' + (state.sheet.length - errors) + ' of ' + state.sheet.length + ' documents. ' + errors + ' failed.', 5000);
  } else {
    toast('Export complete: ' + state.sheet.length + ' documents');
  }
  if (Object.keys(files).length) await downloadZip(files, 'parselock-export');
}

async function downloadPdf() {
  if (!state.sheet?.length) { toast('Upload a sheet first'); return; }
  const col = document.getElementById('filename-column').value;
  const editor = document.getElementById('editor');
  let errors = 0;
  for (let i = 0; i < state.sheet.length; i++) {
    const row = state.sheet[i];
    const name = (col ? row[col] : ('row_' + (i + 1))) + '.pdf';
    showProgress('Generating: ' + name, i + 1, state.sheet.length);
    try {
      const html = mergeRow(editor.innerHTML, row, state.mapping, state.placeholders, state.inheritFormats);
      const win = window.open('', '_blank');
      win.document.write('<html><head><title>' + name + '</title><style>body{font-family:sans-serif;padding:40px}</style></head><body>' + html + '</body></html>');
      win.document.close();
      await new Promise(r => setTimeout(r, 500));
      win.print();
    } catch (e) {
      errors++;
      toast('Failed: ' + name + ' - ' + e.message, 4000);
    }
  }
  hideProgress();
  if (errors) {
    toast('Generated ' + (state.sheet.length - errors) + ' of ' + state.sheet.length + ' PDFs. ' + errors + ' failed.', 5000);
  } else {
    toast('Export complete: ' + state.sheet.length + ' PDFs');
  }
}

function startAutosave() {
  clearAutosave();
  if (!state.user) return;
  state.autosaveTimer = setInterval(async () => {
    if (!state.dirty || !state.current) return;
    const editor = document.getElementById('editor');
    if (!editor) return;
    const title = document.getElementById('editor-title').value.trim() || 'Untitled';
    await saveTask(state.current.id, { title, template_html: editor.innerHTML, placeholders: state.placeholders });
    state.dirty = false;
    toast('Autosaved');
  }, 30000);
}

function clearAutosave() {
  if (state.autosaveTimer) { clearInterval(state.autosaveTimer); state.autosaveTimer = null; }
}

async function importDocx() {
  const input = document.getElementById('docx-input');
  const file = input.files[0];
  if (!file) return;
  try {
    const mammoth = (await import('https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js')).default;
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const editor = document.getElementById('editor');
    if (editor) { editor.innerHTML = result.value; state.dirty = true; toast('DOCX imported'); }
  } catch (e) {
    toast('Failed to import DOCX: ' + e.message);
  }
  input.value = '';
}

function detectInheritedFormats() {
  const editor = document.getElementById('editor');
  if (!editor) return {};
  const inherit = {};
  const textNodes = [];
  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null);
  let node;
  while (node = walker.nextNode()) textNodes.push(node);
  for (const ph of state.placeholders) {
    const regex = new RegExp('\\{\\\\{\\s*' + ph.replace(/[.*+?^${}()|[\]\\\\]/g, '\\\\$&') + '\\s*\\}\\}', 'gi');
    for (const textNode of textNodes) {
      if (!regex.test(textNode.textContent)) continue;
      const parent = textNode.parentElement;
      if (!parent) continue;
      const style = window.getComputedStyle(parent);
      inherit[ph] = {
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strike: document.queryCommandState('strikeThrough'),
        font: style.fontFamily,
        color: style.color
      };
    }
  }
  return inherit;
}

function clearSheet() {
  state.sheet = null;
  state.mapping = {};
  state.inheritFormats = {};
  document.getElementById('sheet-preview').innerHTML = '';
  document.getElementById('mapping-container').innerHTML = '';
  document.getElementById('sheet-input').value = '';
}

function renderPrivacy() {
  document.getElementById('app').innerHTML = '<div class="container"><h1>Privacy Notice</h1><p>ParseLock processes spreadsheets and generated documents entirely in your browser. Nothing leaves your device except templates and metadata you choose to save.</p></div>';
}

function renderTerms() {
  document.getElementById('app').innerHTML = '<div class="container"><h1>Terms of Service</h1><p>ParseLock is provided as-is. You are responsible for the content you generate. We do not guarantee availability or fitness for a particular purpose.</p></div>';
}

function escape(str) {
  return (str || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function init() {
  watchAuth((user) => { state.user = user; renderAuth(); });
  currentSession().then(s => { 
    if (s?.user) { state.user = s.user; renderAuth(); } 
    return currentUser(); 
  }).then(u => { 
    state.user = u; 
    renderAuth(); 
    loadTemplates(); 
  }).catch((e) => {
    console.error('Auth init failed:', e);
    toast('Authentication unavailable. Working offline.');
  });
  Ads.init();
  window.addEventListener('hashchange', navigate);
  initPrivacyBanner();
  initThemeToggle();
  initKeyboardShortcuts();
  initOfflineDetection();
  navigate();
}

function initOfflineDetection() {
  const update = () => {
    const offline = !navigator.onLine;
    document.body.classList.toggle('offline', offline);
    if (offline) toast('You are offline. Changes will sync when reconnected.', 5000);
  };
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
}

function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const saved = localStorage.getItem('parselock-theme');
  if (saved === 'dark') document.documentElement.classList.add('dark');
  btn.textContent = document.documentElement.classList.contains('dark') ? 'Light' : 'Dark';
  btn.onclick = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('parselock-theme', isDark ? 'dark' : 'light');
    btn.textContent = isDark ? 'Light' : 'Dark';
  };
}

function showPageSetup() {
  const editor = document.getElementById('editor');
  if (!editor) return;
  const current = state.current?.page_setup || { size: 'letter', orientation: 'portrait', margins: { top: 1, right: 1, bottom: 1, left: 1 } };
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = '<div class="modal-backdrop"></div><div class="modal-dialog"><h3 style="margin:0 0 1rem;font-size:1rem;">Page Setup</h3><div class="page-setup-form"><div class="page-setup-row"><label>Size</label><select id="ps-size"><option value="letter">Letter</option><option value="a4">A4</option><option value="legal">Legal</option></select></div><div class="page-setup-row"><label>Orientation</label><select id="ps-orientation"><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></div><div class="page-setup-row"><label>Margins (in)</label><input id="ps-margin-top" type="number" step="0.25" value="' + current.margins?.top + '" style="width:60px;" /><input id="ps-margin-right" type="number" step="0.25" value="' + current.margins?.right + '" style="width:60px;" /><input id="ps-margin-bottom" type="number" step="0.25" value="' + current.margins?.bottom + '" style="width:60px;" /><input id="ps-margin-left" type="number" step="0.25" value="' + current.margins?.left + '" style="width:60px;" /></div></div><div class="modal-actions"><button id="ps-cancel" class="btn btn-secondary">Cancel</button><button id="ps-apply" class="btn">Apply</button></div></div>';
  document.body.appendChild(modal);
  modal.querySelector('#ps-size').value = current.size;
  modal.querySelector('#ps-orientation').value = current.orientation;
  const apply = () => {
    const setup = {
      size: modal.querySelector('#ps-size').value,
      orientation: modal.querySelector('#ps-orientation').value,
      margins: {
        top: parseFloat(modal.querySelector('#ps-margin-top').value) || 1,
        right: parseFloat(modal.querySelector('#ps-margin-right').value) || 1,
        bottom: parseFloat(modal.querySelector('#ps-margin-bottom').value) || 1,
        left: parseFloat(modal.querySelector('#ps-margin-left').value) || 1
      }
    };
    applyPageSetup(setup);
    if (state.current) {
      state.current.page_setup = setup;
      state.dirty = true;
    }
    modal.remove();
    toast('Page setup applied');
  };
  modal.querySelector('#ps-apply').onclick = apply;
  modal.querySelector('#ps-cancel').onclick = () => modal.remove();
  modal.querySelector('.modal-backdrop').onclick = () => modal.remove();
}

function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      document.getElementById('editor-generate')?.click();
      return;
    }
    if (!e.ctrlKey && !e.metaKey) return;
    const key = e.key.toLowerCase();
    if (key === 's') { e.preventDefault(); document.getElementById('editor-save')?.click(); }
    if (key === 'b') { e.preventDefault(); window.Toolbar?.toggleBold(); }
    if (key === 'i') { e.preventDefault(); window.Toolbar?.toggleItalic(); }
    if (key === 'u') { e.preventDefault(); window.Toolbar?.toggleUnderline(); }
  });
}

function initPrivacyBanner() {
  const banner = document.getElementById('privacy-banner');
  if (!banner) return;
  if (localStorage.getItem('parselock-privacy-accepted') === '1') {
    banner.hidden = true;
    return;
  }
  banner.hidden = false;
  document.getElementById('privacy-accept').onclick = () => {
    localStorage.setItem('parselock-privacy-accepted', '1');
    banner.hidden = true;
  };
}

function renderAuth() {
  const el = document.getElementById('auth-area');
  if (!el) return;
  if (state.user) {
    el.innerHTML = '<span>' + escape(state.user.email) + '</span><span class="badge badge-success">RA 10173 compliant</span><button id="sign-out" class="btn btn-secondary btn-small">Sign out</button>';
    document.getElementById('sign-out').onclick = () => doSignOut().then(() => location.reload());
  } else {
    el.innerHTML = '<button id="sign-in" class="btn btn-secondary btn-small">Sign in</button><button id="sign-up" class="btn btn-small">Sign up</button>';
    document.getElementById('sign-in').onclick = () => showAuthModal('signin');
    document.getElementById('sign-up').onclick = () => showAuthModal('signup');
  }
}

function localTemplatesKey() {
  return 'parselock-local-templates';
}

function loadLocalTemplates() {
  try {
    return JSON.parse(localStorage.getItem(localTemplatesKey()) || '[]');
  } catch {
    return [];
  }
}

function saveLocalTemplates(templates) {
  localStorage.setItem(localTemplatesKey(), JSON.stringify(templates));
}

async function localListTasks() {
  return loadLocalTemplates();
}

async function localReadTask(id) {
  return loadLocalTemplates().find(t => t.id === id) || null;
}

async function localAddTask(task) {
  const templates = loadLocalTemplates();
  const newTask = { ...task, id: 'local-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8), updated_at: new Date().toISOString(), is_local: true };
  templates.unshift(newTask);
  saveLocalTemplates(templates);
  return newTask;
}

async function localSaveTask(id, updates) {
  const templates = loadLocalTemplates();
  const idx = templates.findIndex(t => t.id === id);
  if (idx === -1) throw new Error('Template not found');
  templates[idx] = { ...templates[idx], ...updates, updated_at: new Date().toISOString() };
  saveLocalTemplates(templates);
  return templates[idx];
}

async function localRemoveTask(id) {
  saveLocalTemplates(loadLocalTemplates().filter(t => t.id !== id));
}

function showAuthModal(mode) {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;
  const title = document.getElementById('auth-modal-title');
  const submit = document.getElementById('auth-submit');
  const email = document.getElementById('auth-email');
  const password = document.getElementById('auth-password');
  const error = document.getElementById('auth-error');
  if (!title || !submit || !email || !password || !error) return;
  title.textContent = mode === 'signup' ? 'Sign up' : 'Sign in';
  submit.textContent = mode === 'signup' ? 'Sign up' : 'Sign in';
  email.value = '';
  password.value = '';
  error.textContent = '';
  modal.hidden = false;
  email.focus();
  const close = () => { modal.hidden = true; };
  document.getElementById('auth-cancel').onclick = close;
  modal.querySelector('.modal-backdrop').onclick = close;
  const googleBtn = document.getElementById('auth-google');
  if (googleBtn) {
    googleBtn.onclick = async () => {
      close();
      try { await doGoogleSignIn(); } catch (e) { toast(e.message || 'Google sign-in failed'); }
    };
  }
  const onSubmit = async (e) => {
    e.preventDefault();
    error.textContent = '';
    const emailVal = email.value.trim();
    const passwordVal = password.value;
    if (!emailVal || !passwordVal) {
      error.textContent = 'Email and password are required.';
      return;
    }
    if (passwordVal.length < 6) {
      error.textContent = 'Password must be at least 6 characters.';
      return;
    }
    submit.disabled = true;
    try {
      if (mode === 'signup') {
        await doSignUp(emailVal, passwordVal);
        toast('Account created. You can now sign in.');
        close();
        showAuthModal('signin');
      } else {
        await doSignIn(emailVal, passwordVal);
        close();
        toast('Signed in');
      }
    } catch (err) {
      error.textContent = err.message || 'Authentication failed.';
    } finally {
      submit.disabled = false;
    }
  };
  document.getElementById('auth-form').onsubmit = onSubmit;
}

export { init, state };
