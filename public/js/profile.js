const profileName = document.querySelector('#profileName');
const profileEmail = document.querySelector('#profileEmail');
const userImagesGrid = document.querySelector('#userImagesGrid');
const logoutBtn = document.querySelector('#logoutBtn');

async function loadProfile() {
    try {
        const response = await authFetch('/api/auth/profile', {
            method: 'GET'
        });

        if (response.ok) {
            const data = await response.json();
            const user = data.user;
            const images = data.images;

            // Update Profile Info
            if (user) {
                if (profileName) profileName.textContent = user.name;
                if (profileEmail) profileEmail.textContent = user.email;

                // Bind edit profile button
                const editProfileBtn = document.getElementById('editProfileBtn');
                if (editProfileBtn) {
                    editProfileBtn.onclick = () => {
                        window.openProfileUserEditor(user, loadProfile);
                    };
                }
            }

            // Render User's Images
            if (userImagesGrid) {
                userImagesGrid.innerHTML = '';
                if (images && images.length > 0) {
                    images.forEach(img => {
                        const card = window.renderProfileCard(img);
                        userImagesGrid.appendChild(card);
                    });
                } else {
                    userImagesGrid.innerHTML = '<p class="muted">You haven\'t created any images yet. <a href="/">Go create something!</a></p>';
                }
            }
        } else {
            window.location.href = '/auth';
        }
    } catch (error) {
        console.error('Profile fetch error:', error);
        if (userImagesGrid) {
            userImagesGrid.innerHTML = '<p class="error">Error loading your gallery.</p>';
        }
    }
}

if (profileName) {
    loadProfile();
}



logoutBtn && (logoutBtn.onclick = async () => {
    try {
        const response = await authFetch('/api/auth/logout', {
            method: 'POST'
        });

        if (response.ok) {
            localStorage.removeItem('token'); // Clear token
            location.href = '/';
        } else {
            console.error('Logout failed');
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
});
