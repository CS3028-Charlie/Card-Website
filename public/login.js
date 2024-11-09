 // Check login status
 document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('authToken');
    document.getElementById('accountText').textContent = isLoggedIn ? 'Account' : 'Login';
});

// Login and Signup Functions
async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    // Fetch to your login API here...
    // On success, store token and close modal
    $('#accountModal').modal('hide');
}

async function handleSignup() {
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    // Fetch to your signup API here...
    // On success, store token and close modal
    $('#accountModal').modal('hide');
}