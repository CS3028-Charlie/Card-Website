document.addEventListener('DOMContentLoaded', updateUserUI());
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
        updateNavBarForLogin(); // Update the navbar to reflect the login state
        updateNavBarForAdmin(); // Update the navbar to include link to admin page
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
        const response = await fetch(`https://charlie-card-backend-fbbe5a6118ba.herokuapp.com/api/auth/login`, { // https://charlie-card-backend-fbbe5a6118ba.herokuapp.com/api/auth/login
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

    try {
        // Register the user
        const registerResponse = await fetch(`https://charlie-card-backend-fbbe5a6118ba.herokuapp.com/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, role }),
        });

        if (!registerResponse.ok) {
            const errorData = await registerResponse.json();
            alert(errorData.message);
            return;
        }

        // Clear any existing auth data
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        localStorage.removeItem('balance');
        localStorage.removeItem('authToken');

        // Automatically log in
        const loginResponse = await fetch(`https://charlie-card-backend-fbbe5a6118ba.herokuapp.com/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!loginResponse.ok) {
            alert('Registration successful. Please log in.');
            location.reload();
            return;
        }

        const loginData = await loginResponse.json();

        // Store user info
        localStorage.setItem('username', loginData.username);
        localStorage.setItem('role', loginData.role);
        localStorage.setItem('authToken', loginData.token);
        if (loginData.role === 'pupil') {
            localStorage.setItem('balance', loginData.balance);
        }

        // Update UI without page reload
        updateUserUI();
        $('#accountModal').modal('hide');
        alert('Account created and logged in successfully!');

    } catch (error) {
        console.error('Signup error:', error);
        alert('Error during signup: ' + error.message);
    }
}

// Update Nav Bar after Sign Out
function handleSignOut() {
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('balance');
    localStorage.removeItem('authToken');

    document.getElementById('accountText').textContent = 'Login';
    document.getElementById('userAccountSection').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'block';
    document.getElementById('signOutFooter').style.display = 'none'; // Hide sign out button
    location.reload(); // Refresh the page
}

document.getElementById('accountLink').addEventListener('click', async (event) => {
    event.preventDefault(); // Prevent default link behavior

    const authToken = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');

    if (authToken) {
        await updateUserUI();
        showUserAccountModal();
    } else {
        showLoginSignupModal();
    }
});

async function updateUserUI() {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const balance = localStorage.getItem('balance');

    if (!username || username == "Account") {
        return;
    }

    if (username) {
        document.getElementById('usernameDisplay').textContent = username;
        document.getElementById('accountText').textContent = username;
        document.getElementById('userAccountSection').style.display = 'block';
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('signupForm').style.display = 'none';
        document.getElementById('signOutFooter').style.display = 'block'; // Show sign out button

        // Balance display (for pupils)
        let balanceDisplay = document.getElementById('balanceDisplay');
        if (!balanceDisplay) {
            balanceDisplay = document.createElement('p');
            balanceDisplay.id = 'balanceDisplay';
            balanceDisplay.style.marginBottom = '10px';
            document.getElementById('userAccountSection').appendChild(balanceDisplay);
        }
        if (role === 'pupil') {
            await fetchAndUpdateBalance();
        } else {
            balanceDisplay.textContent = ''; // Hide balance for non-pupils
        }

        // Ensure top-up section is updated properly
        updateTopupSection(role);

        // Add delete account button next to sign out
        const signOutFooter = document.getElementById('signOutFooter');
        if (!document.getElementById('deleteAccountBtn')) {
            const deleteBtn = document.createElement('button');
            deleteBtn.id = 'deleteAccountBtn';
            deleteBtn.className = 'btn btn-danger ml-2';
            deleteBtn.textContent = 'Delete Account';
            deleteBtn.addEventListener('click', showDeleteConfirmation);
            signOutFooter.appendChild(deleteBtn);
        }
    }
}

function updateTopupSection(role) {  
    let topupSection = document.getElementById('topupSection');
    let classroomButton = document.getElementById('classroomButton');

    if (role === 'teacher') {
        if (topupSection) {
            topupSection.remove();
        }
        // Create the "Go to Classroom" button if it doesn't exist
        let classroomButton = document.getElementById('classroomButton');
        if (!classroomButton) {
            classroomButton = document.createElement('button');
            classroomButton.id = 'classroomButton';
            classroomButton.className = 'btn btn-primary';
            classroomButton.textContent = 'Go to Classroom';
            classroomButton.addEventListener('click', () => {
                window.location.href = '/classroom.html';
            });

            document.getElementById('userAccountSection').appendChild(classroomButton);
        }
    } else if (role === 'parent') {
        if (classroomButton) {
            classroomButton.remove();
        }
        // If top-up section doesn't exist, create it
        if (!topupSection) {
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
            topupSection.style.display = 'block'; // Ensure it's visible
        }
    } else {
        // Hide top-up section for other roles
        if (topupSection) {
            topupSection.style.display = 'none';
        }
        classroomButton.remove();
    }
}

async function fetchAndUpdateBalance() {
    const authToken = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');

    if (authToken && role === 'pupil') {
        try {
            const response = await fetch(`https://charlie-card-backend-fbbe5a6118ba.herokuapp.com/api/auth/balance`, { 
                method: 'GET',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (!response.ok) {
                console.error('Failed to fetch balance');
                return;
            }

            const data = await response.json();
            const newBalance = data.balance;

            localStorage.setItem('balance', newBalance);
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

    balanceElement.textContent = `Credits: ${parseFloat(balance).toFixed(0)}`;
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
        const response = await fetch(`https://charlie-card-backend-fbbe5a6118ba.herokuapp.com/api/auth/topup`, {
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

// Update Nav Bar for Admin
async function updateNavBarForAdmin() {
    try {
        const response = await fetch(`https://charlie-card-backend-fbbe5a6118ba.herokuapp.com/api/auth/user`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : `Bearer ${localStorage.getItem("authToken")}`
            },
        });

        if (!response.ok) {
            return;
        }

        user = await response.json()

        if (user.role != "admin") {
            return
        }

        const navList = document.getElementById("navbarNav").children[0]
        const link = '<li class="nav-item"><a class="nav-link" href="admin.html"><i class="fas fa-home"></i> Admin</a></li>'
        navList.insertAdjacentHTML("beforeend", link)

    } catch (error) {
        console.log(error)
        return
    }

}

function showDeleteConfirmation() {
    const confirmationHtml = `
        <div class="modal fade" id="deleteConfirmModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Delete Account</h5>
                        <button type="button" class="close" data-dismiss="modal">
                            <span>&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p class="text-danger">Warning: All credits and account data will be permanently deleted.</p>
                        <div class="form-group">
                            <label>Enter your password to confirm:</label>
                            <input type="password" id="deleteConfirmPassword" class="form-control">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger" onclick="handleDeleteAccount()">Delete Account</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    if (!document.getElementById('deleteConfirmModal')) {
        document.body.insertAdjacentHTML('beforeend', confirmationHtml);
    }
    $('#deleteConfirmModal').modal('show');
}

async function handleDeleteAccount() {
    const password = document.getElementById('deleteConfirmPassword').value;
    const authToken = localStorage.getItem('authToken');

    try {
        const response = await fetch(`https://charlie-card-backend-fbbe5a6118ba.herokuapp.com/api/auth/delete-account`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ password })
        });

        if (!response.ok) {
            const data = await response.json();
            alert(data.message);
            return;
        }

        $('#deleteConfirmModal').modal('hide');
        handleSignOut();
        alert('Account deleted successfully');
    } catch (error) {
        console.error('Delete account error:', error);
        alert('Error deleting account');
    }
}
