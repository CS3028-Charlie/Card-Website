document.addEventListener('DOMContentLoaded', () => {
    const accountText = document.getElementById('accountText');
    const accountIcon = document.getElementById('accountIcon');
    const authToken = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');
    
    // If logged in, show username and update icon
    if (authToken) {
        accountText.textContent = username || 'Account';
        accountIcon.classList.remove('fa-user-circle'); // Default icon
        accountIcon.classList.add('fa-sign-out-alt');  // Log out icon
        accountIcon.title = 'Sign Out'; // Change title to reflect action
        
        accountText.addEventListener('click', () => {
            showUserAccountModal();
        });
    } else {
        accountText.textContent = 'Login';
        accountIcon.classList.remove('fa-sign-out-alt');
        accountIcon.classList.add('fa-user-circle');
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

    // Simulate a successful login
    const response = { token: 'fake-jwt-token', username: 'JohnDoe' };

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
    accountIcon.classList.remove('fa-sign-out-alt');
    accountIcon.classList.add('fa-user-circle');
    accountIcon.title = 'Login';
}
