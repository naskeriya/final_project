async function generateAIImage(prompt, imageContainer, saveButton, statusContainer) {
  imageContainer.innerHTML = '<p>AI is imagining...</p>';

  try {
    const response = await authFetch('/api/images/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) throw new Error(result.message || 'Generation failed');

    const dataUrl = result.dataUrl;

    // добавляем картинку
    imageContainer.innerHTML = '';
    const img = document.createElement('img');
    img.src = dataUrl;
    img.alt = prompt;
    img.style.maxWidth = '100%';
    img.style.borderRadius = '12px';
    imageContainer.appendChild(img);

    saveButton.disabled = false;
    statusContainer.textContent = 'Image generated successfully ✅';

    // возвращаем dataUrl (для сохранения)
    return dataUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    imageContainer.innerHTML = `<p style="color:red">Failed: ${error.message}</p>`;
    return null;
  }
}

const generateBtn = document.getElementById('generate');
const saveBtn = document.getElementById('save');
const promptInput = document.getElementById('prompt');
const status = document.querySelector('.image-generator__status');
const imageContainer = document.querySelector('.image-generator__image');

let lastImage = null;
let lastPrompt = '';

generateBtn.addEventListener('click', async (e) => {
  e.preventDefault();

  // [DEPENDENCY]: checkAuth is defined in /public/js/auth-utils.js
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    status.style.color = 'red';
    status.innerHTML = 'Please <a href="/auth">sign in</a> to generate images!';
    return
  }

  const prompt = promptInput.value.trim();
  if (!prompt) {
    status.textContent = 'Please enter a prompt first.';
    return;
  }

  generateBtn.disabled = true;
  saveBtn.disabled = true;
  status.textContent = 'Generating...';

  lastImage = await generateAIImage(prompt, imageContainer, saveBtn, status);
  lastPrompt = prompt;

  generateBtn.disabled = false;
});

// Modal elements
// Modal elements
const modal = document.getElementById('save-modal');
const modalClose = document.querySelector('.modal__close');
const saveForm = document.getElementById('save-form');
const nameInput = document.getElementById('image-name');
const descInput = document.getElementById('image-description');

// Tag selection component
const tagSelector = window.initTagSelector({
  inputEl: document.getElementById('tag-input'),
  suggestionsEl: document.getElementById('tag-suggestions'),
  selectedContainerEl: document.getElementById('selected-tags'),
  addBtnEl: document.getElementById('add-tag-btn')
});

saveBtn.addEventListener('click', () => {
  if (!lastImage || !lastPrompt) return;
  modal.classList.remove('hidden');
  nameInput.value = ''; // Reset
  descInput.value = ''; // Reset
  tagSelector.reset(); // Reset tags using selector
  nameInput.focus();
});

// Close modal logic
const closeModal = () => modal.classList.add('hidden');
modalClose.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

saveForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const description = descInput.value.trim();

  if (!name) return;

  try {
    const submitBtn = saveForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    status.textContent = 'Saving...';

    const response = await authFetch('/api/images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imageData: lastImage,
        name: name,
        used_prompt: lastPrompt,
        description: description,
        tags: tagSelector.getSelected() // Send selected tags from selector
      })
    });

    const data = await response.json();

    if (data.success) {
      status.textContent = 'Saved to your gallery 🖼️';
      closeModal();
      saveBtn.disabled = true; // Disable main save button after success
    } else {
      throw new Error(data.message || 'Failed to save');
    }
  } catch (error) {
    console.error('Error saving image:', error);
    status.style.color = 'red';
    status.textContent = 'Error saving: ' + error.message;
  } finally {
    const submitBtn = saveForm.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save';
  }
});
