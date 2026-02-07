const galleryGrid = document.querySelector('#galleryGrid');
const emptyContainer = document.querySelector('.gallery__empty');
const search = document.getElementById('search');

// Initialize TagSelector component
const tagSelector = window.initTagSelector({
  inputEl: document.getElementById('tag-input'),
  suggestionsEl: document.getElementById('tag-suggestions'),
  selectedContainerEl: document.getElementById('selected-tags'),
  onTagsChange: () => renderGallery() // Re-render when tags change
});

// Load images from API
async function loadGallery(searchTerm = '', tags = []) {
  try {
    let url = `/api/images?search=${encodeURIComponent(searchTerm)}`;
    if (tags.length > 0) {
      url += `&tags=${encodeURIComponent(tags.join(','))}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.success) {
      return data.images;
    }
    return [];
  } catch (error) {
    console.error('Error loading gallery:', error);
    return [];
  }
}

async function renderGallery() {
  emptyContainer.innerHTML = "";

  const q = search.value.trim();
  const tags = tagSelector.getSelected();

  const items = await loadGallery(q, tags);

  galleryGrid.innerHTML = "";

  if (items.length) {
    items.forEach(item => {
      const card = window.renderImageCard(item);
      galleryGrid.appendChild(card);
    });
  } else {
    emptyContainer.innerHTML = '<p class="muted">No artworks found matching your criteria.</p>';
  }
}

// Search handler using debounce from common.js
const handleSearch = debounce(() => {
  renderGallery();
}, 300);

search.addEventListener('input', handleSearch);

// Initial render
renderGallery();
