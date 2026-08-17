const searchInput = document.getElementById('search-input');
const searchForm = document.getElementById('search-form');
const resultsGrid = document.getElementById('results-grid');
const loadingGrid = document.getElementById('loading-grid');
const statusText = document.getElementById('status-text');
const themeBtn = document.getElementById('theme-btn');
const modalOverlay = document.getElementById('modal-overlay');
const closeDrawer = document.getElementById('close-drawer');
const drawerContent = document.getElementById('drawer-content');
const categoryPills = document.getElementById('category-pills');

let currentBooks = [];

// Keyboard Shortcut Listener (⌘K or /)
window.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    searchInput.focus();
  }
  if (e.key === 'Escape') closeModal();
});

// Theme Switcher
themeBtn.addEventListener('click', () => {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', dark ? 'light' : 'dark');
});

// Category Click Handler
categoryPills.addEventListener('click', (e) => {
  if (!e.target.classList.contains('pill')) return;
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  e.target.classList.add('active');
  
  const category = e.target.getAttribute('data-category');
  searchInput.value = '';
  fetchBooks(category === 'Curated' ? 'Minimalism Architecture' : category);
});

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (searchInput.value.trim()) fetchBooks(searchInput.value.trim());
});

async function fetchBooks(query) {
  resultsGrid.innerHTML = '';
  statusText.textContent = '';
  loadingGrid.classList.remove('hidden');

  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=12`);
    if (!res.ok) throw new Error('API request standard error');
    const data = await res.json();
    if (!data.items) throw new Error('No items');
    currentBooks = data.items;
    renderGrid(currentBooks);
  } catch {
    statusText.textContent = `Showing selected collection for "${query}"`;
    currentBooks = generateMockCollection(query);
    renderGrid(currentBooks);
  } finally {
    loadingGrid.classList.add('hidden');
  }
}

function renderGrid(books) {
  resultsGrid.innerHTML = books.map((book, idx) => {
    const info = book.volumeInfo;
    const cover = info.imageLinks?.thumbnail?.replace('http://', 'https://') || 'https://via.placeholder.com/300x400/e8e8ed/86868b?text=Lumio';
    return `
      <article class="book-card" onclick="openDrawer(${idx})">
        <div class="cover-aspect"><img src="${cover}" alt="Book Cover" loading="lazy"/></div>
        <h2 class="card-title">${info.title || 'Untitled'}</h2>
        <p class="card-author">${info.authors ? info.authors[0] : 'Unknown Author'}</p>
      </article>
    `;
  }).join('');
}

function openDrawer(index) {
  const book = currentBooks[index]?.volumeInfo;
  if (!book) return;

  const cover = book.imageLinks?.thumbnail?.replace('http://', 'https://') || 'https://via.placeholder.com/300x400';
  
  drawerContent.innerHTML = `
    <div style="text-align: center; margin-bottom: 1.5rem;">
      <img src="${cover}" style="width: 140px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.12);"/>
    </div>
    <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.4rem;">${book.title}</h2>
    <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">${book.authors ? book.authors.join(', ') : 'Unknown'}</p>
    <p style="font-size: 0.85rem; line-height: 1.6; color: var(--text-main); margin-bottom: 1.5rem;">${book.description ? book.description.substring(0, 320) + '...' : 'No description available.'}</p>
    <a href="${book.infoLink || '#'}" target="_blank" style="display: block; text-align: center; background: var(--accent); color: white; text-decoration: none; padding: 0.65rem; border-radius: 999px; font-weight: 500; font-size: 0.9rem;">View Full Volume</a>
  `;
  modalOverlay.classList.remove('hidden');
}

function closeModal() { modalOverlay.classList.add('hidden'); }
closeDrawer.addEventListener('click', closeModal);

function generateMockCollection(q) {
  return Array.from({ length: 8 }, (_, i) => ({
    volumeInfo: {
      title: `${q} — Volume ${i + 1}`,
      authors: ['Lumio Curators'],
      description: 'A deeply curated volume exploring design, form, structure, and essential minimalism.',
      imageLinks: { thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80' },
      infoLink: 'https://books.google.com'
    }
  }));
}

// Initial Kickoff
fetchBooks('Minimalism Architecture');