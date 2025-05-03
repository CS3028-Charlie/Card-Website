// Persist basket data between page refreshes using localStorage
let basket = loadBasketFromLocalStorage();

// Load basket data from localStorage or initialize an empty array if not present
function loadBasketFromLocalStorage() {
    return JSON.parse(localStorage.getItem("basket")) || [];
}

// Save the current basket data to localStorage
function saveBasketToLocalStorage() {
    localStorage.setItem("basket", JSON.stringify(basket));
}

// Adds a new card to basket with its type, images, price and any customizations
// Customizations parameter is optional and defaults to empty object
function addToBasket(cardType, images, price, customizations = {}) {
    const card = { cardType, images, price, customizations };
    basket.push(card);
    saveBasketToLocalStorage();
    alert("Card added to basket!");
}

// Renders the basket contents in the UI
// Creates a visual list of cards with their images, details and remove buttons
function displayBasket() {
    const basketList = document.getElementById("basketList");
    const basketContainer = document.getElementById("basketContainer");
    basketList.innerHTML = ""; 
    basketContainer.innerHTML = ""; 

    if (basket.length === 0) {
        basketList.textContent = "Your basket is empty.";
        return;
    }

    // For each item in basket, create a list element with card details
    basket.forEach((item, index) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <img src="${item.images[0]}" alt="${item.cardType}" style="width: 50px; height: 50px;">
            <strong>Card Type:</strong> ${item.type} <br>
            <strong>Price:</strong> £${item.price} <br>
            <button class="btn btn-danger btn-sm" data-index="${index}">Remove</button>
        `;
        basketList.appendChild(listItem);
    });

    // Add click handlers to all remove buttons
    // Uses data-index attribute to identify which item to remove
    basketList.querySelectorAll(".btn-danger").forEach((button) =>
        button.addEventListener("click", (event) => {
            const index = event.target.dataset.index;
            removeFromBasket(index);
        })
    );
}

// Removes an item from the basket by its index
function removeFromBasket(index) {
    basket.splice(index, 1); 
    saveBasketToLocalStorage();
    displayBasket();
}

// Sets up the basket modal with event listeners for opening/closing
// Implements click-outside-to-close functionality
function initializeBasketModal() {
    const basketModal = document.getElementById("basketModal");
    const viewBasketBtn = document.getElementById("viewBasketBtn");
    const closeBtn = document.getElementById("closeBtn");

    if (viewBasketBtn && basketModal) {
        viewBasketBtn.addEventListener("click", () => {
            displayBasket(); 
            basketModal.classList.add("active"); 
        });
    }
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            basketModal.classList.remove("active"); 
        });
    }

    // Close modal when clicking outside of it
    window.addEventListener("click", (event) => {
        if (event.target === basketModal) {
            basketModal.classList.remove("active");
        }
    });
}

// Initialize event listeners when DOM is ready
// Handles add to basket button clicks and checkout process
document.addEventListener('DOMContentLoaded', () => {
    const addToBasketBtn = document.getElementById('addToBasketBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (addToBasketBtn) {
        addToBasketBtn.addEventListener('click', () => {
            const selectedCardType = sessionStorage.getItem('selectedCardType');
            const cardImages = getCurrentCardImages();  // Include the initilisation of this bit in shop.js
            const priceDisplay2 = sessionStorage.getItem('priceRequired');
            addToBasket(selectedCardType, cardImages, priceDisplay2 );

            // Update basket display
            // displayBasket();
        });
    }

});