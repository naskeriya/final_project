
// Helper to format date
window.formatDate = function (dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

// Component: Render a single image card
window.renderImageCard = function (image) {
    const card = document.createElement('div');
    card.className = 'gallery-item';
    card.setAttribute('data-id', image.id || image._id);

    card.innerHTML = `
        <div class="ibg">
            <img src="${image.path}" alt="${image.name}" loading="lazy">
        </div>
        <div class="gallery-item__overlay">
            <h3>${image.name}</h3>
            <p>${image.description || 'No description'}</p>
        </div>
    `;

    card.addEventListener('click', () => {
        window.openImageDetail(image.id || image._id);
    });

    return card;
};

// Component: Setup for the detailed modal
window.initImageModal = function () {
    if (document.getElementById('imageDetailModal')) return;

    const modalHtml = `
        <div id="imageDetailModal" class="modal hidden">
            <div class="modal__content">
                <span class="modal__close">&times;</span>
                <div class="modal__body">
                    <div class="modal__image-wrapper">
                        <img id="modalImg" src="" alt="">
                    </div>
                    <div class="modal__info">
                        <h2 id="modalTitle"></h2>
                        <p class="modal__meta">By <span id="modalAuthor"></span> on <span id="modalDate"></span></p>
                        
                        <div class="modal__section">
                            <h4>Prompt Used</h4>
                            <p id="modalPrompt"></p>
                        </div>
                        
                        <div class="modal__section">
                            <h4>Description</h4>
                            <p id="modalDesc"></p>
                        </div>
                        
                        <div class="modal__section">
                            <h4>Tags</h4>
                            <div id="modalTags" class="tags-container"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = document.getElementById('imageDetailModal');
    const closeBtn = modal.querySelector('.modal__close');

    closeBtn.onclick = () => modal.classList.add('hidden');
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.classList.add('hidden');
        }
    };
};

// Component: Open modal and populate with data
window.openImageDetail = async function (imageId) {
    window.initImageModal();
    const modal = document.getElementById('imageDetailModal');

    try {
        const response = await fetch(`/api/images/${imageId}`);
        const data = await response.json();

        if (data.success) {
            const img = data.image;

            document.getElementById('modalImg').src = img.path;
            document.getElementById('modalTitle').textContent = img.name;
            document.getElementById('modalAuthor').textContent = img.user ? img.user.name : 'Unknown';
            document.getElementById('modalDate').textContent = window.formatDate(img.createdAt);
            document.getElementById('modalPrompt').textContent = img.used_prompt || 'No prompt provided';
            document.getElementById('modalDesc').textContent = img.description || 'No description provided';

            const tagsContainer = document.getElementById('modalTags');
            tagsContainer.innerHTML = '';
            if (img.tags && img.tags.length > 0) {
                img.tags.forEach(tag => {
                    const span = document.createElement('span');
                    span.className = 'tag-badge';
                    span.textContent = tag;
                    tagsContainer.appendChild(span);
                });
            } else {
                tagsContainer.innerHTML = '<p class="muted">No tags</p>';
            }

            modal.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error fetching image details:', error);
    }
};

// Component: Render a dedicated profile image card
window.renderProfileCard = function (image) {
    const card = document.createElement('div');
    card.className = 'gallery-item';
    card.setAttribute('data-id', image.id || image._id);

    card.innerHTML = `
        <div class="ibg">
            <img src="${image.path}" alt="${image.name}" loading="lazy">
        </div>
        <div class="gallery-item__overlay">
            <h3>${image.name}</h3>
            <p>${image.description || 'No description'}</p>
        </div>
    `;

    card.addEventListener('click', () => {
        window.openProfileEditor(image.id || image._id, window.loadProfile);
    });

    return card;
};

// Component: Setup for the dedicated profile edit modal
window.initProfileEditModal = function () {
    if (document.getElementById('profileEditModal')) return;

    const modalHtml = `
        <div id="profileEditModal" class="modal hidden">
            <div class="modal__content">
                <span class="modal__close">&times;</span>
                <div class="modal__body">
                    <div class="modal__image-wrapper">
                        <img id="profileEditModalImg" src="" alt="">
                    </div>
                    <div class="modal__info">
                        <h2>Edit My Artwork</h2>
                        <p class="modal__meta">Created on <span id="profileEditModalDate"></span></p>
                        
                        <form id="profileEditForm">
                            <div class="modal__section">
                                <h4>Title</h4>
                                <input type="text" id="profile-edit-name" class="input" required>
                            </div>
                            
                            <div class="modal__section">
                                <h4>Description</h4>
                                <textarea id="profile-edit-description" class="input input--textarea" rows="4"></textarea>
                            </div>
                            
                            <div class="modal__section">
                                <h4>Tags</h4>
                                <div class="tag-input-container">
                                    <input type="text" id="profile-edit-tag-input" class="input" placeholder="Add a tag..." autocomplete="off">
                                    <div id="profile-edit-tag-suggestions" class="tag-suggestions hidden"></div>
                                </div>
                                <div id="profile-edit-selected-tags" class="selected-tags" style="margin-top: 10px;"></div>
                            </div>

                            <button type="submit" class="button button--full" style="width: 100%; margin-top: 1rem;">Save Changes</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = document.getElementById('profileEditModal');
    const closeBtn = modal.querySelector('.modal__close');

    closeBtn.onclick = () => modal.classList.add('hidden');
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.classList.add('hidden');
        }
    });

    // Apply "above" style to suggestions
    const suggestions = document.getElementById('profile-edit-tag-suggestions');
    if (suggestions) suggestions.classList.add('tag-suggestions--above');
};

// Component: Open profile editor and populate with data
window.openProfileEditor = async function (imageId, onUpdate) {
    window.initProfileEditModal();
    const modal = document.getElementById('profileEditModal');
    const editForm = document.getElementById('profileEditForm');
    const nameInput = document.getElementById('profile-edit-name');
    const descInput = document.getElementById('profile-edit-description');
    const dateSpan = document.getElementById('profileEditModalDate');
    const imgEl = document.getElementById('profileEditModalImg');

    try {
        const response = await fetch(`/api/images/${imageId}`);
        const data = await response.json();

        if (data.success) {
            const img = data.image;

            imgEl.src = img.path;
            nameInput.value = img.name;
            descInput.value = img.description || '';
            dateSpan.textContent = window.formatDate(img.createdAt);

            // Initialize TagSelector for the edit modal
            const tagSelector = window.initTagSelector({
                inputEl: document.getElementById('profile-edit-tag-input'),
                suggestionsEl: document.getElementById('profile-edit-tag-suggestions'),
                selectedContainerEl: document.getElementById('profile-edit-selected-tags')
            });

            // Pre-fill existing tags
            tagSelector.reset();
            if (img.tags) {
                img.tags.forEach(tag => tagSelector.addTag(tag));
            }

            editForm.onsubmit = async (e) => {
                e.preventDefault();
                const updatedData = {
                    name: nameInput.value.trim(),
                    description: descInput.value.trim(),
                    tags: tagSelector.getSelected()
                };

                try {
                    const updateRes = await authFetch(`/api/images/${imageId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedData)
                    });

                    const updateResult = await updateRes.json();
                    if (updateResult.success) {
                        modal.classList.add('hidden');
                        if (onUpdate) onUpdate();
                    } else {
                        alert(updateResult.message || 'Update failed');
                    }
                } catch (err) {
                    console.error('Update error:', err);
                }
            };

            modal.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error fetching image for edit:', error);
    }
};

// Component: Reusable Tag Selector
window.initTagSelector = function ({ inputEl, suggestionsEl, selectedContainerEl, onTagsChange, addBtnEl }) {
    let availableTags = [];
    let selectedTags = [];

    const fetchTags = async () => {
        try {
            const res = await fetch('/api/tags');
            const data = await res.json();
            if (data.success) {
                availableTags = data.tags;
                renderSuggestions(availableTags);
            }
        } catch (e) {
            console.error('Failed to load tags', e);
        }
    };

    const renderSuggestions = (tags) => {
        if (tags.length > 0) {
            suggestionsEl.innerHTML = tags.slice(0, 5).map(t => `
                <div class="tag-suggestion" data-tag="${t.name}">
                    <span>${t.name}</span>
                    <span class="tag-count">${t.count}</span>
                </div>
            `).join('');
        } else {
            suggestionsEl.innerHTML = '<div class="tag-suggestion" style="cursor: default;">No matching tags</div>';
        }

        suggestionsEl.querySelectorAll('.tag-suggestion').forEach(el => {
            el.onclick = (e) => {
                e.preventDefault();
                addTag(el.dataset.tag);
            };
        });
    };

    const renderSelected = () => {
        selectedContainerEl.innerHTML = selectedTags.map(tag => `
            <span class="tag-badge">
                ${tag}
                <span class="tag-remove" data-tag="${tag}">&times;</span>
            </span>
        `).join('');

        selectedContainerEl.querySelectorAll('.tag-remove').forEach(btn => {
            btn.onclick = (e) => {
                const tagToRemove = e.target.dataset.tag;
                selectedTags = selectedTags.filter(t => t !== tagToRemove);
                renderSelected();
                if (onTagsChange) onTagsChange(selectedTags);
            };
        });
    };

    const addTag = (tag) => {
        if (!tag) return;
        tag = tag.trim().toLowerCase();
        if (tag.length > 64 || !/^[a-z0-9 ]+$/.test(tag)) return;
        if (selectedTags.includes(tag)) return;

        selectedTags.push(tag);
        renderSelected();
        inputEl.value = '';
        renderSuggestions(availableTags);
        if (onTagsChange) onTagsChange(selectedTags);
    };

    // [DEPENDENCY]: debounce is defined in /public/js/common.js
    if (inputEl) {
        inputEl.addEventListener('input', debounce((e) => {
            const val = e.target.value.trim().toLowerCase();
            const matches = !val ? availableTags : availableTags.filter(t => t.name.toLowerCase().includes(val));
            renderSuggestions(matches);
        }, 200));

        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTag(inputEl.value);
            }
        });
    }

    if (addBtnEl) {
        addBtnEl.onclick = () => addTag(inputEl.value);
    }

    fetchTags();

    return {
        getSelected: () => selectedTags,
        reset: () => {
            selectedTags = [];
            renderSelected();
            renderSuggestions(availableTags);
        },
        addTag
    };
};

// Component: Setup for the dedicated profile user edit modal
window.initProfileUserModal = function () {
    if (document.getElementById('profileUserModal')) return;

    const modalHtml = `
        <div id="profileUserModal" class="modal hidden">
            <div class="modal__content modal__content--small">
                <span class="modal__close">&times;</span>
                <div class="modal__info">
                    <h2>Edit Profile</h2>
                    <p class="modal__meta" style="margin-bottom: 2rem;">Update your personal information</p>
                    
                    <form id="profileUserEditForm">
                        <div class="modal__section">
                            <h4>Full Name</h4>
                            <input type="text" id="user-edit-name" class="input" required placeholder="Your name">
                        </div>
                        
                        <div class="modal__section">
                            <h4>Email Address</h4>
                            <input type="email" id="user-edit-email" class="input" required placeholder="your.email@example.com">
                        </div>
                        
                        <div id="userEditError" class="error hidden" style="margin-bottom: 1rem; font-size: 0.9rem;"></div>

                        <button type="submit" class="button button--full" style="width: 100%; margin-top: 1rem;">Save Profile</button>
                    </form>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = document.getElementById('profileUserModal');
    const closeBtn = modal.querySelector('.modal__close');

    closeBtn.onclick = () => modal.classList.add('hidden');
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.classList.add('hidden');
        }
    });
};

// Component: Open profile user editor and populate with data
window.openProfileUserEditor = function (user, onUpdate) {
    window.initProfileUserModal();
    const modal = document.getElementById('profileUserModal');
    const editForm = document.getElementById('profileUserEditForm');
    const nameInput = document.getElementById('user-edit-name');
    const emailInput = document.getElementById('user-edit-email');
    const errorEl = document.getElementById('userEditError');

    nameInput.value = user.name || '';
    emailInput.value = user.email || '';
    errorEl.classList.add('hidden');
    errorEl.textContent = '';

    editForm.onsubmit = async (e) => {
        e.preventDefault();
        const updatedData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim()
        };

        try {
            const updateRes = await authFetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            const updateResult = await updateRes.json();
            if (updateResult.success) {
                modal.classList.add('hidden');
                if (onUpdate) onUpdate();
            } else {
                errorEl.textContent = updateResult.message || 'Update failed';
                errorEl.classList.remove('hidden');
            }
        } catch (err) {
            console.error('Profile update error:', err);
            errorEl.textContent = 'An error occurred. Please try again.';
            errorEl.classList.remove('hidden');
        }
    };

    modal.classList.remove('hidden');
};

