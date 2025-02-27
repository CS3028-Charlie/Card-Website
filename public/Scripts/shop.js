// Constants and globals
const numCards = 4;
let sharedBackdrop = null;
let cardPreview = null;

// Initialize on window load
window.onload = generateCards;

// Helper functions for modal handling
function closeAllPreviews() {
    closeCardPreview();
    closeBackdrop();
}

function closeBackdrop() {
    if (sharedBackdrop) {
        sharedBackdrop.style.display = 'none';
    }
}

function showBackdrop() {
    if (sharedBackdrop) {
        sharedBackdrop.style.display = 'block';
    } else {
        createBackdrop();
    }
}

function closeCardPreview() {
    if (cardPreview) {
        cardPreview.style.display = 'none';
    }
    document.body.style.overflow = '';
}

function createBackdrop() {
    if (!sharedBackdrop) {
        sharedBackdrop = document.createElement('div');
        sharedBackdrop.style.position = 'fixed';
        sharedBackdrop.style.top = 0;
        sharedBackdrop.style.left = 0;
        sharedBackdrop.style.width = '100%';
        sharedBackdrop.style.height = '100%';
        sharedBackdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        sharedBackdrop.style.zIndex = 1000;
        sharedBackdrop.addEventListener('click', closeAllPreviews);
        document.body.appendChild(sharedBackdrop);
    }
}

// Function to pull template images
function pullTemplateImages(numCards) {
    const API_URL = "https://charlie-card-backend-fbbe5a6118ba.herokuapp.com";
    const positions = ["Front", "Inner-Left", "Inner-Right", "Back"];
    const targetBackImage = "Images/background.png";
    let cards = [];

    for (let i = 0; i < numCards; i++) {
        let images = [];
        const folderIndex = `card-${i + 1}`;
        positions.forEach(position => {
            if (position === "Back") {
                images.push(targetBackImage);
            } else {
                images.push(`${API_URL}/assets/templates/${folderIndex}/${position}.png`);
            }
        });
        cards.push(images);
    }

    return cards;
}

// Function to generate cards in the shop
function generateCards() {
    const row = document.querySelector('.row');
    const allCardsImages = pullTemplateImages(numCards);

    allCardsImages.forEach((cardImages, index) => {
        const col = document.createElement('div');
        col.className = 'col-md-3 col-sm-6';

        col.innerHTML = `
            <div class="card mb-4">
                <img src="${cardImages[0]}" class="card-img-top" alt="Card ${index + 1} Image">
                <div class="card-body text-center">
                    <h5 class="card-title">Card ${index + 1}</h5>
                </div>
            </div>
        `;

        const viewButton = document.createElement('button');
        viewButton.className = 'btn btn-success';
        viewButton.textContent = 'View';
        viewButton.onclick = () => openCardModal(index, cardImages);

        col.querySelector('.card-body').appendChild(viewButton);
        row.appendChild(col);
    });
}

// Function to load carousel images
function loadCarouselImages(images) {
    const carouselImages = document.getElementById('carouselImages');
    const carouselIndicators = document.getElementById('carouselIndicators');

    carouselImages.innerHTML = '';
    carouselIndicators.innerHTML = '';

    images.forEach((image, index) => {
        const carouselItem = document.createElement('div');
        carouselItem.classList.add('carousel-item');
        if (index === 0) carouselItem.classList.add('active');

        const imgElement = document.createElement('img');
        imgElement.src = image;
        imgElement.alt = `Carousel Image ${index + 1}`;
        imgElement.classList.add('d-block', 'w-50', 'mx-auto');

        carouselItem.appendChild(imgElement);
        carouselImages.appendChild(carouselItem);

        const indicator = document.createElement('li');
        indicator.setAttribute('data-target', '#cardCarousel');
        indicator.setAttribute('data-slide-to', index);
        if (index === 0) indicator.classList.add('active');
        carouselIndicators.appendChild(indicator);
    });
}

// Function to handle card type selection
function selectCardType(cardType, images) {
    const isECard = cardType === 'eCard';
    
    const eCardBtn = document.querySelector(".CardButton button:nth-child(1)");
    const printableBtn = document.querySelector(".CardButton button:nth-child(2)");
    
    eCardBtn.classList.remove("bg-success", "text-white", "btn-outline-primary");
    printableBtn.classList.remove("bg-success", "text-white", "btn-outline-primary");
    
    if (isECard) {
        eCardBtn.classList.add("bg-success", "text-white");
    } else {
        printableBtn.classList.add("bg-success", "text-white");
    }
    
    document.getElementById('priceDisplay').innerText = isECard ? '100 Credits' : '200 Credits';
    document.getElementById('priceDisplay2').innerText = isECard ? '£0.99' : '£1.99';
    
    const imagesToShow = isECard ? [images[0], images[2]] : images;
    loadCarouselImages(imagesToShow);
    
    sessionStorage.setItem('selectedCardType', isECard ? 'eCard' : 'Printable');
    sessionStorage.setItem('priceRequired', isECard ? '0.99' : '1.99');
}

// Function to open card modal
function openCardModal(cardIndex, images) {
    loadCarouselImages(images);

    // Set up the card type selection buttons
    const cardTypeButtons = document.querySelectorAll('.CardButton button');
    cardTypeButtons.forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        newButton.addEventListener('click', () => {
            cardTypeButtons.forEach(btn => btn.classList.remove('bg-success', 'text-white'));
            newButton.classList.add('bg-success', 'text-white');
            selectCardType(newButton.textContent.toLowerCase().includes('ecard') ? 'eCard' : 'printable', images);
        });
    });

    // Select eCard by default
    if (cardTypeButtons.length > 0) {
        cardTypeButtons[0].classList.add('bg-success', 'text-white');
        selectCardType('eCard', images);
    }

    // Set up the personalise button
    const personaliseBtn = document.querySelector('.CardFooter .btn-primary');
    if (personaliseBtn) {
        personaliseBtn.onclick = () => {
            sessionStorage.setItem('selectedCardIndex', cardIndex);
            sessionStorage.setItem('selectedCardImages', JSON.stringify(images));
            window.location.href = 'editor.html';
        };
    }

    // Show modal
    cardPreview = document.querySelector('.CardPreview');
    cardPreview.style.display = 'block';
    document.body.style.overflow = 'hidden';
    showBackdrop();

    // Close button functionality
    const closeButton = cardPreview.querySelector('.close');
    closeButton.addEventListener('click', () => {
        closeCardPreview();
        closeBackdrop();
    });
}