document.addEventListener('DOMContentLoaded', () => {
    const accountText = document.getElementById('accountText');
    const accountIcon = document.getElementById('accountIcon');
    const authToken = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');

    // If logged in, show username and update icon
    if (authToken) {
        accountText.textContent = username || 'Account';
        accountIcon.title = 'Sign Out'; // Change title to reflect action
        updateNavBarForLogin(); // Update the navbar to reflect the login state
    } else {
        accountText.textContent = 'Login';
        accountIcon.title = 'Login';

        accountText.addEventListener('click', showLoginSignupModal);
    }
});

// Show Login/Signup Modal
function showLoginSignupModal() {
    $('#accountModal').modal('show');
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'block';
    document.getElementById('userAccountSection').style.display = 'none';
}

// Show User Account Modal
function showUserAccountModal() {
    $('#accountModal').modal('show');
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('userAccountSection').style.display = 'block';
    document.getElementById('usernameDisplay').textContent = localStorage.getItem('username');
}

// Handle Login
async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('https://charlie-card-backend-fbbe5a6118ba.herokuapp.com/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.message); // Show error from backend
            return;
        }

        const data = await response.json();
        localStorage.setItem('authToken', data.token); // Store token in localStorage
        localStorage.setItem('username', data.username); // Store username in localStorage

        $('#accountModal').modal('hide');
        document.getElementById('accountText').textContent = data.username;
        updateNavBarForLogin();
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
}

// Handle Signup
async function handleSignup() {
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.message); // Show error message from the server
            return;
        }

        const data = await response.json();
        localStorage.setItem('authToken', data.token); // Store token
        localStorage.setItem('username', username); // Store username

        alert('Signup successful! You are now logged in.');
        location.reload(); // Refresh page or navigate to the dashboard
    } catch (error) {
        alert('Signup failed: ' + error.message);
    }
}

// Handle Sign Out
function handleSignOut() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    document.getElementById('accountText').textContent = 'Login';
    showLoginSignupModal();
    updateNavBarForSignOut();
}

// Update Nav Bar after Sign Out
function updateNavBarForSignOut() {
    const accountText = document.getElementById('accountText');
    const accountIcon = document.getElementById('accountIcon');

    accountText.textContent = 'Login';
    accountIcon.title = 'Login';
}

// Update Nav Bar for Login
function updateNavBarForLogin() {
    const accountText = document.getElementById('accountText');
    const accountIcon = document.getElementById('accountIcon');

    const username = localStorage.getItem('username');
    accountText.textContent = username || 'Account';
    accountIcon.title = 'Sign Out'; // Change title to reflect action

    accountText.addEventListener('click', () => {
        showUserAccountModal();
    });
}
