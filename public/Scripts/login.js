document.addEventListener('DOMContentLoaded', updateUserUI);
document.addEventListener('DOMContentLoaded', () => {
    const accountText = document.getElementById('accountText');
    const accountIcon = document.getElementById('accountIcon');
    const authToken = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');

    // If logged in, show username and update icon
    if (authToken) {
        accountText.textContent = username || 'Account';
        accountIcon.title = 'Sign Out'; // Change title to reflect action
        updateUserUI(); // Update the navbar to reflect the login state
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
async function showUserAccountModal() {
    console.log("showUserAccountModal() called"); // Debugging log

    $('#accountModal').modal('show');

    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('userAccountSection').style.display = 'block';

    console.log("Fetching balance..."); // Debugging log
    await fetchAndUpdateBalance();
}

// Handle Login
async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('https://charlie-card-backend-fbbe5a6118ba.herokuapp.com/api/auth/login', { // https://charlie-card-backend-fbbe5a6118ba.herokuapp.com/api/auth/login
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
        // Store user info
        localStorage.setItem('username', data.username);
        localStorage.setItem('role', data.role);
        localStorage.setItem('authToken', data.token);
        if (data.role === 'pupil') {
            localStorage.setItem('balance', data.balance);
        }

        updateUserUI();
    } catch (error) {
        alert(error.message);
    }
}

async function handleSignup() {
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const role = document.getElementById('signupRole').value;

    if (!username || !email || !password) {
        alert('All fields are required.');
        return;
    }

    console.log({ username, email, password, role }); // Log the request payload

    try {
        const response = await fetch('https://charlie-card-backend-fbbe5a6118ba.herokuapp.com/api/auth/register', { //https://charlie-card-backend-fbbe5a6118ba.herokuapp.com/api/auth/register
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, role }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.message);
            return;
        }

        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('username', username);
        alert('Signup successful!');
        location.reload();
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
}

// Update Nav Bar after Sign Out
function handleSignOut() {
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('balance');
    localStorage.removeItem('token');

    document.getElementById('accountText').textContent = 'Login';
    document.getElementById('userAccountSection').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'block';
}

async function updateUserUI() {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const balance = localStorage.getItem('balance');

    if (username) {
        document.getElementById('usernameDisplay').textContent = username;
        document.getElementById('accountText').textContent = username;
        document.getElementById('userAccountSection').style.display = 'block';
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('signupForm').style.display = 'none';

        // Balance display (for pupils)
        let balanceDisplay = document.getElementById('balanceDisplay');
        if (!balanceDisplay) {
            balanceDisplay = document.createElement('p');
            balanceDisplay.id = 'balanceDisplay';
            balanceDisplay.style.marginBottom = '10px';
            document.getElementById('userAccountSection').appendChild(balanceDisplay);
        }
        if (role === 'pupil') {
            try {
                const authToken = localStorage.getItem('authToken');
                const response = await fetch('https://charlie-card-backend-fbbe5a6118ba.herokuapp.com/api/auth/balance', { 
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });

                if (!response.ok) {
                    console.error('Failed to fetch balance');
                    balanceDisplay.textContent = 'Credits: Error';
                    return;
                }

                const data = await response.json();
                const newBalance = data.balance;

                // ✅ Update localStorage
                localStorage.setItem('balance', newBalance);

                // ✅ Update UI with the new balance
                balanceDisplay.textContent = `Credits: ${parseFloat(newBalance).toFixed(0)}`;
            } catch (error) {
                console.error('Error fetching balance:', error);
                balanceDisplay.textContent = 'Credits: Error';
            }
        } else {
            balanceDisplay.textContent = ''; // Hide balance for non-pupil accounts
        }

        // Top-up section (for teachers and parents)
        let topupSection = document.getElementById('topupSection');
        if (!topupSection && (role === 'teacher' || role === 'parent')) {
            topupSection = document.createElement('div');
            topupSection.id = 'topupSection';
            topupSection.innerHTML = `
                <h5>Top-up Pupil Credits</h5>
                <input type="email" id="topupEmail" placeholder="Enter pupil email" class="form-control mb-2">
                <button id="topupButton" class="btn btn-success">+100 Credits</button>
                <p id="topupStatus" class="mt-2"></p>
            `;
            document.getElementById('userAccountSection').appendChild(topupSection);

            // Attach event listener to top-up button
            document.getElementById('topupButton').addEventListener('click', handleTopup);
        } else {
            // Hide everything if no user is logged in
            topupSection.style.display = 'none';
        }
    }
}

// Function to top-up a pupil's balance
async function handleTopup() {
    const pupilEmail = document.getElementById('topupEmail').value.trim();
    const authToken = localStorage.getItem('authToken');

    if (!pupilEmail) {
        document.getElementById('topupStatus').textContent = 'Please enter a valid pupil email.';
        return;
    }

    try {
        const response = await fetch('https://charlie-card-backend-fbbe5a6118ba.herokuapp.com/api/auth/topup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ email: pupilEmail, amount: 100 })
        });

        const data = await response.json();

        if (!response.ok) {
            document.getElementById('topupStatus').textContent = data.message || 'Top-up failed.';
            return;
        }

        document.getElementById('topupStatus').textContent = `Successfully added 100 credits to ${pupilEmail}`;
    } catch (error) {
        console.error('Top-up error:', error);
        document.getElementById('topupStatus').textContent = 'Error processing top-up.';
    }
}

async function fetchAndUpdateBalance() {
    const authToken = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');

    if (authToken && role === 'pupil') {
        try {
            const response = await fetch('https://charlie-card-backend-fbbe5a6118ba.herokuapp.com/api/auth/balance', { 
                method: 'GET',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (!response.ok) {
                console.error('Failed to fetch balance');
                return;
            }

            const data = await response.json();
            const newBalance = data.balance;

            console.log("Fetched balance:", newBalance); // Debugging log

            // Update localStorage
            localStorage.setItem('balance', newBalance);

            // Update the displayed balance
            updateBalanceDisplay(newBalance);
        } catch (error) {
            console.error('Error fetching balance:', error);
        }
    }
}

function updateBalanceDisplay(balance) {
    let balanceElement = document.getElementById('balanceDisplay');

    if (!balanceElement) {
        balanceElement = document.createElement('p');
        balanceElement.id = 'balanceDisplay';
        document.getElementById('userAccountSection').appendChild(balanceElement);
    }

    console.log("Updating balance display:", balance); // Debugging log
    balanceElement.textContent = `Credits: ${parseFloat(balance).toFixed(0)}`;
}

document.getElementById('accountLink').addEventListener('click', async (event) => {
    event.preventDefault(); // Prevent default link behavior

    const authToken = localStorage.getItem('authToken');
    if (authToken) {
        // User is logged in, update balance and show account modal
        await updateUserUI();
        showUserAccountModal();
    } else {
        // User is not logged in, show login/signup modal
        showLoginSignupModal();
    }
});
