// Check login status
document.addEventListener('DOMContentLoaded', () => {
    const authToken = localStorage.getItem('authToken');
    const accountText = document.getElementById('accountText');
    const accountModalBody = document.getElementById('accountModalBody');
    const username = localStorage.getItem('username');

    if (authToken) {
        // User is logged in, display username
        accountText.textContent = username || 'Account'; // Use stored username
        accountText.addEventListener('click', () => showAccountInfo(username));
    } else {
        // User is not logged in
        accountText.textContent = 'Login';
    }
});

// Show account info (display username and options)
function showAccountInfo(username) {
    const accountModalBody = document.getElementById('accountModalBody');
    accountModalBody.innerHTML = `
        <h4>Hi ${username}</h4>
        <p>There's not much to do here right now...</p>
        <button onclick="handleSignOut()">Sign Out</button>
    `;
    $('#accountModal').modal('show');
}

// Function to handle login
async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch('https://charlie-card-backend-fbbe5a6118ba.herokuapp.com/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('authToken', data.token); // Store token in localStorage
            document.getElementById('accountText').textContent = 'Account'; // Update UI
            $('#accountModal').modal('hide'); // Close the modal
            alert('Login successful!');
        } else {
            alert(data.message || 'Login failed!');
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred during login.');
    }
}

// Function to handle signup
async function handleSignup() {
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    try {
        const response = await fetch('https://charlie-card-backend-fbbe5a6118ba.herokuapp.com/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('authToken', data.token); // Store token in localStorage
            document.getElementById('accountText').textContent = 'Account'; // Update UI
            $('#accountModal').modal('hide'); // Close the modal
            alert('Signup successful!');
        } else {
            alert(data.message || 'Signup failed!');
        }
    } catch (error) {
        console.error('Error during signup:', error);
        alert('An error occurred during signup.');
    }
}

// Sign out the user
function handleSignOut() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    document.getElementById('accountText').textContent = 'Login';
    $('#accountModal').modal('hide');
    alert('You have been logged out.');
}
