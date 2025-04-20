let basket = loadBasketFromLocalStorage();

function loadBasketFromLocalStorage() {
    return JSON.parse(localStorage.getItem("basket")) || [];
}

function saveBasketToLocalStorage() {
    localStorage.setItem("basket", JSON.stringify(basket));
}

function addToBasket(cardType, images, price, customizations = {}) {
    const card = { cardType, images, price, customizations };
    basket.push(card);
    saveBasketToLocalStorage();
    alert("Card added to basket!");
}
function displayBasket() {
    const basketList = document.getElementById("basketList");
    const basketContainer = document.getElementById("basketContainer");
    basketList.innerHTML = ""; 
    basketContainer.innerHTML = ""; 

    if (basket.length === 0) {
        basketList.textContent = "Your basket is empty.";
        return;
    }

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

    basketList.querySelectorAll(".btn-danger").forEach((button) =>
        button.addEventListener("click", (event) => {
            const index = event.target.dataset.index;
            removeFromBasket(index);
        })
    );
}
function removeFromBasket(index) {
    basket.splice(index, 1); 
    saveBasketToLocalStorage();
    displayBasket();
}

function initializeBasketModal() {
    console.log("Basket modal getting loaded");
    const basketModal = document.getElementById("basketModal");
    const viewBasketBtn = document.getElementById("viewBasketBtn");
    const closeBtn = document.getElementById("closeBtn");

    if (viewBasketBtn && basketModal) {
        viewBasketBtn.addEventListener("click", () => {
            console.log("Basket button clicked");
            displayBasket(); 
            basketModal.classList.add("active"); 
        });
    }
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            basketModal.classList.remove("active"); 
        });
    }
    window.addEventListener("click", (event) => {
        if (event.target === basketModal) {
            basketModal.classList.remove("active");
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const addToBasketBtn = document.getElementById('addToBasketBtn');
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