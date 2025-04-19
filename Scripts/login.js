// Expose functions to the global scope
window.handleLogin = async function() {
    // Logic for handling login
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Simulate login process
    if (email && password) {
        alert('Login successful!');
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('signupForm').style.display = 'none';
        document.getElementById('userAccountSection').style.display = 'block';
        document.getElementById('usernameDisplay').textContent = email.split('@')[0];
        document.getElementById('signOutFooter').style.display = 'block';
    } else {
        alert('Please enter valid credentials.');
    }
};

window.handleSignup = async function() {
    // Logic for handling signup
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const role = document.getElementById('signupRole').value;

    // Simulate signup process
    if (username && email && password && role) {
        alert('Signup successful!');
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('signupForm').style.display = 'none';
        document.getElementById('userAccountSection').style.display = 'block';
        document.getElementById('usernameDisplay').textContent = username;
        document.getElementById('signOutFooter').style.display = 'block';
    } else {
        alert('Please fill in all fields.');
    }
};

window.handleSignOut = function() {
    // Logic for handling sign out
    alert('You have been signed out.');
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'block';
    document.getElementById('userAccountSection').style.display = 'none';
    document.getElementById('signOutFooter').style.display = 'none';
};