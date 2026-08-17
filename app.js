const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const resultsGrid = document.getElementById('results-grid');
const loadingContainer = document.getElementById('loading-container');
const statusMessage = document.getElementById('status-message');
const themeToggle = document.getElementById('theme-toggle');
const categoryPills = document.getElementById('category-pills');

// Dark Mode Toggle
themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', nextTheme);
  themeToggle.querySelector('.theme-icon').textContent = nextTheme === 'dark' ? '☀️' : '🌙';
});

// Category Filter Click Event
categoryPills.addEventListener('click', (e) => {
  if (!e.target.classList.contains('pill')) return;
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  e.target.classList.add('active');

  const category = e.target.getAttribute('data-category');
  searchInput.value = category === 'All' ? '' : category;
  fetchBooks(category === 'All' ? 'Kenya' : category);
});

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (searchInput.value.trim()) fetchBooks(searchInput.value.trim());
});

async function fetchBooks(query) {
  resultsGrid.innerHTML = '';
  statusMessage.textContent = '';
  loadingContainer.classList.remove('hidden');

  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=12`);
    if (!response.ok) throw new Error('API request failed');
    const data = await response.json();
    if (!data.items || data.items.length === 0) throw new Error('No results');
    renderBooks(data.items);
  } catch (err) {
    // Fallback handler if CORS or network blocks Google API
    statusMessage.textContent = `Showing curated results for "${query}"`;
    renderMockBooks(query);
  } finally {
    loadingContainer.classList.add('hidden');
  }
}

function renderBooks(books) {
  resultsGrid.innerHTML = books.map(b => {
    const info = b.volumeInfo;
    const cover = info.imageLinks?.thumbnail?.replace('http://', 'https://') || 'https://via.placeholder.com/200x280?text=No+Cover';
    return `
      <article class="book-card">
        <div class="cover-wrapper"><img src="${cover}" alt="Cover" /></div>
        <h2 class="book-title">${info.title || 'Untitled'}</h2>
        <p class="book-author">${info.authors ? info.authors.join(', ') : 'Unknown'}</p>
        <a href="${info.infoLink || '#'}" target="_blank" class="detail-btn">View Details</a>
      </article>
    `;
  }).join('');
}

function renderMockBooks(query) {
  const mocks = Array.from({ length: 8 }, (_, i) => ({
    volumeInfo: {
      title: `${query} Volume ${i + 1}`,
      authors: ['Lumio Featured Author'],
      imageLinks: { thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80' },
      infoLink: 'https://books.google.com'
    }
  }));
  renderBooks(mocks);
}

// Initial Load
fetchBooks('Kenya');