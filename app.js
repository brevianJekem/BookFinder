const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const resultsGrid = document.getElementById('results-grid');
const loadingContainer = document.getElementById('loading-container');
const statusMessage = document.getElementById('status-message');

const FALLBACK_COVER = 'https://via.placeholder.com/300x400/e8e8ed/86868b?text=No+Cover';

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (query) {
    fetchBooks(query);
  }
});

async function fetchBooks(query) {
  resultsGrid.innerHTML = '';
  statusMessage.textContent = '';
  loadingContainer.classList.remove('hidden');

  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=16`
    );

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      statusMessage.textContent = `No results found for "${query}".`;
      return;
    }

    renderBooks(data.items);
  } catch (err) {
    statusMessage.textContent = 'Unable to load books right now. Please try again.';
    console.error(err);
  } finally {
    loadingContainer.classList.add('hidden');
  }
}

function renderBooks(books) {
  resultsGrid.innerHTML = books.map((book) => {
    const info = book.volumeInfo;
    const title = info.title || 'Untitled';
    const authors = info.authors ? info.authors.join(', ') : 'Unknown Author';
    const year = info.publishedDate ? info.publishedDate.substring(0, 4) : 'N/A';
    const coverUrl = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || FALLBACK_COVER;
    const secureCoverUrl = coverUrl.replace('http://', 'https://');
    const link = info.infoLink || info.previewLink || '#';

    return `
      <article class="book-card">
        <div class="cover-container">
          <img src="${escapeHtml(secureCoverUrl)}" alt="${escapeHtml(title)} cover" loading="lazy" />
        </div>
        <div class="book-info">
          <h2 class="book-title" title="${escapeHtml(title)}">${escapeHtml(title)}</h2>
          <p class="book-author">${escapeHtml(authors)}</p>
          <span class="book-badge">${escapeHtml(year)}</span>
          <a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer" class="apple-link-btn">
            View Details
          </a>
        </div>
      </article>
    `;
  }).join('');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}