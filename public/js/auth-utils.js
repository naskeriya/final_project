// Reusable function to check if user is authenticated
async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
        const response = await fetch('/api/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            localStorage.removeItem('token');
            return false;
        }

        return response.ok;
    } catch (error) {
        console.log('Auth check failed:', error);
        return false;
    }
}

// Update navigation based on auth status
async function updateNavigation() {
    const signInLink = document.getElementById('header-sign-in');
    const profileLink = document.getElementById('header-profile');

    if (!signInLink || !profileLink) {
        return;
    }

    const isAuthenticated = await checkAuth();

    if (isAuthenticated) {
        signInLink.style.display = 'none';
        profileLink.style.display = 'inline';
    } else {
        signInLink.style.display = 'inline';
        profileLink.style.display = 'none';
    }
}

// Helper for authenticated fetches
async function authFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    if (!options.headers) options.headers = {};

    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, options);

    if (response.status === 401) {
        localStorage.removeItem('token');
        // Handle redirect or notification if needed
    }

    return response;
}
