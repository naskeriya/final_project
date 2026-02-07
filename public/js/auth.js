const signup = document.querySelector('#signupForm');
const login = document.querySelector('#loginForm');

function validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function validPassword(p) { return /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(p); }

if (signup) {
    signup.onsubmit = async (e) => {
        e.preventDefault();
        const n = signup.name.value.trim();
        const em = signup.email.value.trim();
        const pw = signup.password.value;
        const err = document.querySelector('#signupError');

        if (!n || !em || !pw) return err.textContent = 'Fill all required fields.';
        if (!validEmail(em)) return err.textContent = 'Invalid email.';
        if (!validPassword(pw)) return err.textContent = 'Weak password.';

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: n, email: em, password: pw })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token); // Store token
                err.style.color = 'green';
                err.textContent = 'Signed up ✅ Redirecting...';
                setTimeout(() => location.href = '/profile', 700);
            } else {
                err.textContent = data.message || 'Signup failed.';
            }
        } catch (error) {
            err.textContent = 'Network error. Please try again.';
            console.error('Signup error:', error);
        }
    };
}

if (login) {
    login.onsubmit = async (e) => {
        e.preventDefault();
        const em = login.email.value.trim();
        const pw = login.password.value;
        const err = document.querySelector('#loginError');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: em, password: pw })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token); // Store token
                err.style.color = 'green';
                err.textContent = 'Login successful ✅';
                setTimeout(() => location.href = '/profile', 600);
            } else {
                err.textContent = data.message || 'Wrong credentials.';
            }
        } catch (error) {
            err.textContent = 'Network error. Please try again.';
            console.error('Login error:', error);
        }
    };
}
