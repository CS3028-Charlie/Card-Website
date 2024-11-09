document.addEventListener('DOMContentLoaded', () => {
    const accountText = document.getElementById('accountText');
    const authToken = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');
    
    // Display login or user account info based on authToken
    if (authToken) {
        accountText.textContent = username || 'Account';
        accountText.addEventListener('click', () => {
            showUserAccountModal(username);
        });
    } else {
        accountText.textContent = 'Login';
        accountText.addEventListener('click', showLoginSignupModal);
    }
});

// Show Login/Signup Modal
function showLoginSignupModal() {
    $('#accountModal').modal('show');
    
    // Show login/signup forms or user account section
    if (localStorage.getItem('authToken')) {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('signupForm').style.display = 'none';
        document.getElementById('userAccountSection').style.display = 'block';
        document.getElementById('usernameDisplay').textContent = localStorage.getItem('username');
    } else {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('signupForm').style.display = 'block';
        document.getElementById('userAccountSection').style.display = 'none';
    }
}

// Handle Login
async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Simulate a successful login response
    const response = { token: 'fake-jwt-token', username: 'JohnDoe' };

    if (response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('username', response.username);
        $('#accountModal').modal('hide');
        document.getElementById('accountText').textContent = response.username;
        showLoginSignupModal();
    }
}

// Handle Signup
async function handleSignup() {
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    // Simulate a successful signup response
    const response = { token: 'fake-jwt-token', username: username };

    if (response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('username', response.username);
        $('#accountModal').modal('hide');
        document.getElementById('accountText').textContent = response.username;
        showLoginSignupModal();
    }
}

// Handle Sign Out
function handleSignOut() {
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');

    // Update the UI
    document.getElementById('accountText').textContent = 'Login';
    showLoginSignupModal();
}
