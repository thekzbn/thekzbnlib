/*
Drive Library client (flat, nested explorer)
Replace YOUR_API_KEY_HERE with your Google API key (Drive API enabled).
ROOT_FOLDER_ID is set to your public folder id.
*/
const API_KEY = 'AIzaSyAW-YCKn5Rx7TgweJZpIFgrYrx4GzlypX0'; // <-- REPLACE with your API key
const ROOT_FOLDER_ID = '1XyX4sAV74Duxtz1KijjXL0IuBFemOMFe'; // your folder
// UI refs
const grid = document.getElementById('grid');
const breadcrumb = document.getElementById('breadcrumb');
const btnUp = document.getElementById('btnUp');
const homeBtn = document.getElementById('homeBtn');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const empty = document.getElementById('empty');
const backdrop = document.getElementById('backdrop');
const previewFrame = document.getElementById('previewFrame');
const modalTitle = document.getElementById('modalTitle');
const openInDrive = document.getElementById('openInDrive');
const closeModalBtn = document.getElementById('closeModal');
const themeToggle = document.getElementById('themeToggle');
let pathStack = [{
  id: ROOT_FOLDER_ID,
  name: 'Library'
}];
let allFilesCache = []; // currently loaded items for this folder
/* Utility: fetch folder contents (handles pagination) */
async function fetchFolderContents(folderId) {
  if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('Missing API key. Replace API_KEY constant.');
    return [];
  }
  const q = `'${folderId}' in parents and trashed = false`;
  const fields = 'nextPageToken, files(id,name,mimeType,thumbnailLink,webViewLink,iconLink,modifiedTime,size)';
  let items = [],
    pageToken = null;
  try {
    do {
      const url = `https://www.googleapis.com/drive/v3/files?key=${API_KEY}&q=${encodeURIComponent(q)}&fields=${encodeURIComponent(fields)}${pageToken ? '&pageToken=' + pageToken : ''}&pageSize=200`;
      const res = await fetch(url);
      if (!res.ok) {
        const txt = await res.text();
        throw new Error('Drive API error: ' + res.status + ' ' + txt);
      }
      const js = await res.json();
      if (js.files && js.files.length) items = items.concat(js.files);
      pageToken = js.nextPageToken || null;
    } while (pageToken);
    return items;
  } catch (err) {
    console.error('Error fetching Drive folder:', err);
    return [];
  }
}
/* Render breadcrumb */
function renderBreadcrumb() {
  breadcrumb.innerHTML = '';
  pathStack.forEach((p, i) => {
    const span = document.createElement('span');
    span.className = 'crumb';
    span.textContent = p.name;
    span.dataset.index = i;
    span.addEventListener('click', () => {
      jumpTo(i);
    });
    breadcrumb.appendChild(span);
    if (i < pathStack.length - 1) {
      const sep = document.createElement('span');
      sep.className = 'sep';
      sep.textContent = ' / ';
      breadcrumb.appendChild(sep);
    }
  });
  btnUp.disabled = pathStack.length <= 1;
}
/* Render items into grid */
function renderItems(items) {
  grid.innerHTML = '';
  allFilesCache = items.slice(); // store for search & sort
  if (!items || !items.length) {
    empty.style.display = 'block';
    return;
  } else {
    empty.style.display = 'none';
  }
  // folders first
  const folders = items.filter(i => i.mimeType === 'application/vnd.google-apps.folder');
  const files = items.filter(i => i.mimeType !== 'application/vnd.google-apps.folder');
  folders.forEach(f => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
  <div class="card-top">
    <div class="card-icon"><i class='bx bx-folder'></i></div>
    <div>
      <div class="card-title">${escapeHtml(f.name)}</div>
      <div class="card-meta">Folder</div>
    </div>
  </div>
`;
    card.addEventListener('click', () => {
      pathStack.push({
        id: f.id,
        name: f.name
      });
      goToCurrent();
    });
    grid.appendChild(card);
  });
  files.forEach(f => {
    const typeLabel = f.mimeType ? f.mimeType.split('/').pop() : '';
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
  <div class="card-top">
    <div class="card-icon"><i class='bx bx-book'></i></div>
    <div>
      <div class="card-title">${escapeHtml(f.name)}</div>
      <div class="card-meta">${escapeHtml(typeLabel)}</div>
    </div>
  </div>
`;
    card.addEventListener('click', () => openPreview(f));
    grid.appendChild(card);
  });
}
/* Navigation helpers */
async function goToCurrent() {
  const current = pathStack[pathStack.length - 1];
  renderBreadcrumb();
  const items = await fetchFolderContents(current.id);
  renderItems(items);
}

function jumpTo(index) {
  if (index < 0 || index >= pathStack.length) return;
  pathStack = pathStack.slice(0, index + 1);
  goToCurrent();
}
btnUp.addEventListener('click', () => {
  if (pathStack.length > 1) {
    pathStack.pop();
    goToCurrent();
  }
});
homeBtn.addEventListener('click', () => {
  pathStack = [{
    id: ROOT_FOLDER_ID,
    name: 'Library'
  }];
  goToCurrent();
});
/* Theme toggle */
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function updateThemeIcon(theme) {
  const icon = themeToggle.querySelector('.material-symbols-outlined');
  icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
}

themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
});

/* search & sort */
searchInput.addEventListener('input', debounce(() => applyFilters(), 220));
sortSelect.addEventListener('change', () => applyFilters());

function applyFilters() {
  const q = (searchInput.value || '').toLowerCase().trim();
  let items = allFilesCache.slice();
  if (q) {
    items = items.filter(f => (f.name || '').toLowerCase().includes(q) || (f.mimeType || '').toLowerCase().includes(q));
  }
  const sortBy = sortSelect.value;
  if (sortBy === 'name') items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  if (sortBy === 'modifiedTime') items.sort((a, b) => (b.modifiedTime || '').localeCompare(a.modifiedTime || ''));
  renderItems(items);
}
/* Preview modal (uses Drive preview) */
function openPreview(file) {
  previewFrame.src = `https://drive.google.com/file/d/${file.id}/preview`;
  modalTitle.textContent = file.name;
  openInDrive.href = file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`;
  backdrop.style.display = 'flex';
  backdrop.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  backdrop.style.display = 'none';
  backdrop.setAttribute('aria-hidden', 'true');
  previewFrame.src = '';
}
closeModalBtn.addEventListener('click', closeModal);
backdrop.addEventListener('click', (e) => {
  if (e.target === backdrop) closeModal();
});
/* small util: escape HTML for titles */
function escapeHtml(s) {
  return (s || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  } [c]));
}
/* debounce */
function debounce(fn, wait = 150) {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, a), wait);
  }
}
/* init */
initTheme();
goToCurrent();