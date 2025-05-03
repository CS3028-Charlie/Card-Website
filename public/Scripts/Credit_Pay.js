// Function to load saved card details
function loadCardDetails() {

    const selectedCardType = sessionStorage.getItem('selectedCardType');
    const creditsRequired = sessionStorage.getItem('creditsRequired');

    // Update the display elements
    const cardTypeElement = document.getElementById('selectedCardType');
    const creditsElement = document.getElementById('creditsRequired');
    const amountElement = document.getElementById('amountToPay');

    if (cardTypeElement && creditsElement && amountElement) {
        cardTypeElement.textContent = selectedCardType || 'Not selected';
        creditsElement.textContent = creditsRequired || '0';

        // Update initial amount based on credits required
        const amount = parseInt(creditsRequired) || 0;
        amountElement.textContent = `$${amount.toFixed(2)}`;

        // Pre-select the credit amount if possible
        const creditAmountSelect = document.getElementById('creditAmount');
        if (creditAmountSelect) {
            const options = Array.from(creditAmountSelect.options);
            for (let i = 1; i < options.length; i++) {
                const credits = parseInt(options[i].value);
                if (credits >= amount) {
                    creditAmountSelect.value = credits.toString();
                    break;
                }
            }
        }
    } else {
        console.error("Could not find one or more display elements:", {
            cardTypeElement: !!cardTypeElement,
            creditsElement: !!creditsElement,
            amountElement: !!amountElement
        });
    }
}

// Event listener for credit amount selection
document.getElementById('creditAmount')?.addEventListener('change', (e) => {
    const credits = parseInt(e.target.value);
    updateAmountToPay(credits);
});

// Function to update the amount to pay
function updateAmountToPay(credits) {
    const amountPerCredit = 1; // Assuming 1 dollar per credit
    const amount = credits * amountPerCredit;
    const amountElement = document.getElementById('amountToPay');
    if (amountElement) {
        amountElement.textContent = `$${amount.toFixed(2)}`;
    }
}

// Event listener for proceed to payment button
document.getElementById('proceedPayment')?.addEventListener('click', () => {
    const selectedCredits = document.getElementById('creditAmount')?.value;
    const requiredCredits = sessionStorage.getItem('creditsRequired');

    if (!selectedCredits) {
        alert('Please select a credit amount');
        return;
    }

    if (parseInt(selectedCredits) < parseInt(requiredCredits)) {
        alert('Please select enough credits to cover the required amount');
        return;
    }

    // Here you would typically integrate with a payment gateway
    alert('Proceeding to payment gateway...');
    // You can add the payment gateway integration code here
});

// Make sure DOM is loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    loadCardDetails();
});