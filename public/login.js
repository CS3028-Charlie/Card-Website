// Check login status
document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('authToken');
    document.getElementById('accountText').textContent = isLoggedIn ? 'Account' : 'Login';
});

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
