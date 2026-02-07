const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const messageDiv = document.getElementById('message');
const registerSection = document.getElementById('registerSection');
const loginSection = document.getElementById('loginSection');
const profileSection = document.getElementById('profileSection');
const profileData = document.getElementById('profileData');

// Utility function to show messages
function showMessage(message, isSuccess = true) {
    messageDiv.textContent = message;
    messageDiv.className = `message ${isSuccess ? 'success' : 'error'}`;
    setTimeout(() => {
        messageDiv.className = 'message';
    }, 5000);
}

// Check if user is logged in on page load
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/profile', {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            showProfile(data.user);
        }
    } catch (error) {
        console.log('User not logged in');
    }
}

// Handle Registration
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(data.message, true);
            registerForm.reset();
        } else {
            showMessage(data.message, false);
        }
    } catch (error) {
        showMessage('Error during registration', false);
        console.error('Error:', error);
    }
});

// Handle Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(data.message, true);
            loginForm.reset();
            
            // Fetch and display profile
            fetchProfile();
        } else {
            showMessage(data.message, false);
        }
    } catch (error) {
        showMessage('Error during login', false);
        console.error('Error:', error);
    }
});

// Fetch Profile
async function fetchProfile() {
    try {
        const response = await fetch('/api/auth/profile', {
            method: 'GET',
            credentials: 'include',
        });

        const data = await response.json();

        if (response.ok) {
            showProfile(data.user);
        } else {
            showMessage(data.message, false);
        }
    } catch (error) {
        showMessage('Error fetching profile', false);
        console.error('Error:', error);
    }
}

// Show Profile
function showProfile(user) {
    registerSection.classList.add('hidden');
    loginSection.classList.add('hidden');
    profileSection.classList.remove('hidden');

    profileData.innerHTML = `
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>User ID:</strong> ${user.id}</p>
        <p><strong>Account Created:</strong> ${new Date(user.createdAt).toLocaleString()}</p>
        ${user.updatedAt ? `<p><strong>Last Updated:</strong> ${new Date(user.updatedAt).toLocaleString()}</p>` : ''}
    `;
}

// Handle Logout
logoutBtn.addEventListener('click', async () => {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(data.message, true);
            
            // Show login/register forms again
            registerSection.classList.remove('hidden');
            loginSection.classList.remove('hidden');
            profileSection.classList.add('hidden');
            
            registerForm.reset();
            loginForm.reset();
        } else {
            showMessage(data.message, false);
        }
    } catch (error) {
        showMessage('Error during logout', false);
        console.error('Error:', error);
    }
});

// Check authentication on page load
checkAuth();