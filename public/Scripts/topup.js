import config from "./config.js"

const API_URL = config.API_URL

// Initializes balance display on page load
// Fetches and shows current balance if user is authenticated
document.addEventListener('DOMContentLoaded', async () => {
    const authToken = localStorage.getItem('authToken');
    const balanceDisplay = document.getElementById('balanceDisplay');

    if (authToken) {
        try {
            const response = await fetch(`${API_URL}/api/users/balance`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await response.json();
            balanceDisplay.textContent = `£${data.balance.toFixed(2)}`;
        } catch (error) {
            balanceDisplay.textContent = 'Error';
        }
    } else {
        balanceDisplay.textContent = 'Login Required';
    }
});

// Handles credit top-up form submission
// Validates input and processes payment
document.getElementById('topupForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const pupilEmail = document.getElementById('pupilEmail').value;
    const creditAmount = parseFloat(document.getElementById('creditAmount').value);
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        alert('You must be logged in.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/payments/topup`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pupilEmail, amount: creditAmount })
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.message);
            return;
        }

        alert('Credits added successfully!');
        location.reload();
    } catch (error) {
        alert('Payment failed: ' + error.message);
    }
});
