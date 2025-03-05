// PULL IMAGES AND GEN CARDS
let sharedBackdrop = null;
let cardPreview = null;
let personalisePreview = null;

// Replace the hardcoded numCards with dynamic fetching
async function getNumberOfCards() {
    try {
        const API_URL = "https://charlie-card-backend-fbbe5a6118ba.herokuapp.com";
        const response = await fetch(`${API_URL}/assets/templates/count`);
        if (!response.ok) {
            throw new Error('Failed to fetch card count');
        }
        const data = await response.json();
        return data.count;
    } catch (error) {
        console.error('Error fetching card count:', error);
        return 0;
    }
}

// Modify window.onload to be async
window.onload = async function() {
    try {
        const numCards = await getNumberOfCards();
        if (numCards > 0) {
            generateCards(numCards);
        } else {
            const row = document.querySelector('.row');
            row.innerHTML = '<div class="col-12 text-center"><p>No cards available at the moment.</p></div>';
        }
    } catch (error) {
        console.error('Error initializing cards:', error);
    }
};

// HELPER FUNCTIONS
function closeAllPreviews() {
    closeCardPreview();
    closePersonalisePreview();
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
function closePersonalisePreview() {
    if (personalisePreview) {
        personalisePreview.style.display = 'none';
    }

    document.body.style.overflow = ''; // Enable scrolling (restores to default)
}
function closeCardPreview() {
    if (cardPreview) {
        cardPreview.style.display = 'none';
    }

    document.body.style.overflow = ''; // Enable scrolling (restores to default)
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

// Function to pull all images for each card
function pullTemplateImages(numCards) {
    // http://localhost:3000 for local
    // https://charlie-card-backend-fbbe5a6118ba.herokuapp.com for heroku
    const API_URL = "https://charlie-card-backend-fbbe5a6118ba.herokuapp.com";
    const positions = ["Front", "Inner-Left", "Inner-Right", "Back"];
    let cards = [];

    for (let i = 0; i < numCards; i++) {
        let images = [];
        const folderIndex = `card-${i + 1}`;
        positions.forEach(position => {
            images.push(`${API_URL}/assets/templates/${folderIndex}/${position}.png`);
        });

        cards.push(images); // Each card contains an array of images for each position
    }

    return cards;
}

// Function to standardize image size
function standardizeImage(imageUrl) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = 567;
        canvas.height = 794;
        const ctx = canvas.getContext('2d');

        const img = new Image();
        img.crossOrigin = "anonymous"; // Add this line for CORS
        img.onload = () => {
            try {
                // Fill white background
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Calculate scale to fill entire canvas
                const scale = Math.max(
                    canvas.width / img.width,
                    canvas.height / img.height
                );
                
                // Calculate position to center the scaled image
                const scaledWidth = img.width * scale;
                const scaledHeight = img.height * scale;
                const x = (canvas.width - scaledWidth) / 2;
                const y = (canvas.height - scaledHeight) / 2;
                
                // Draw image to exactly fill canvas
                ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
                
                // Try to get data URL with error handling
                try {
                    const dataUrl = canvas.toDataURL('image/png');
                    resolve(dataUrl);
                } catch (error) {
                    console.error('Error converting to data URL:', error);
                    // Fall back to original image if conversion fails
                    resolve(imageUrl);
                }
            } catch (error) {
                console.error('Error drawing image:', error);
                resolve(imageUrl);
            }
        };
        img.onerror = () => {
            console.error('Error loading image:', imageUrl);
            resolve(imageUrl); // Fall back to original image
        };
        img.src = imageUrl;
    });
}

// Function to generate cards
async function generateCards(numCards) {
    const row = document.querySelector('.row');
    row.innerHTML = ''; // Clear existing content
    const allCardsImages = pullTemplateImages(numCards);

    for (let index = 0; index < allCardsImages.length; index++) {
        const cardImages = allCardsImages[index];
        const col = document.createElement('div');
        col.className = 'col-md-3 col-sm-6 mb-4';

        // Load the first image directly without standardization
        col.innerHTML = `
            <div class="card mb-4">
                <div class="card-img-container" style="height: 300px; overflow: hidden;">
                    <img src="${cardImages[0]}" 
                         class="card-img-top" 
                         alt="Card ${index + 1} Image"
                         style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div class="card-body text-center">
                    <button class="btn btn-success view-btn">View</button>
                </div>
            </div>
        `;

        const viewButton = col.querySelector('.view-btn');
        viewButton.onclick = () => openCardModal(index, cardImages);
        row.appendChild(col);
    }
}

// Function to open the card modal
function openCardModal(cardIndex, images) {
    loadCarouselImages(images);

    // Set up the card type selection buttons
    const cardTypeButtons = document.querySelectorAll('.CardButton button:not(.btn-success)');

    cardTypeButtons.forEach((button, index) => {
        // Remove existing click handlers to prevent duplicates
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        // Add new click handler
        newButton.addEventListener('click', () => {
            cardTypeButtons.forEach(btn => btn.classList.remove('bg-success', 'text-white'));
            newButton.classList.add('bg-success', 'text-white');
            selectCardType(index === 0 ? 'eCard' : 'printable', images);
        });
    });

    // Select eCard by default
    if (cardTypeButtons.length > 0) {
        cardTypeButtons[0].classList.add('bg-success', 'text-white');
        selectCardType('eCard', images);
    }

    // Set up the Get Your Card button
    const getYourCardBtn = document.getElementById('getCardBtn');
    if (getYourCardBtn) {
        getYourCardBtn.onclick = () => {
            const selectedButton = document.querySelector('.CardButton button.bg-success');

            if (!selectedButton) {
                alert('Please select a card type');
                return;
            }

            // Check the text content for "ecard" in a case-insensitive way
            const isECard = selectedButton.textContent.toLowerCase().includes('ecard');
            const creditsRequired = isECard ? 100 : 200;
            const priceRequired = isECard ? 0.99 : 1.99;

            // Store the selection in sessionStorage with clear naming
            sessionStorage.setItem('selectedCardType', isECard ? 'eCard' : 'Printable');
            sessionStorage.setItem('creditsRequired', creditsRequired.toString());
            sessionStorage.setItem('priceRequired', priceRequired.toString());

            console.log('Stored in session storage:', {
                selectedCardType: sessionStorage.getItem('selectedCardType'),
                creditsRequired: sessionStorage.getItem('creditsRequired'),
                priceRequired: sessionStorage.getItem('priceRequired'),
            });

            // Delay navigation to ensure data storage is complete
            setTimeout(() => {
                window.location.href = 'Credit_Pay.html';
            }, 100);  // Delay 100ms to ensure sessionStorage storage is complete
        };
    }

    // Set up the Personalise button
    const personaliseBtn = document.querySelector('.CardFooter .btn-primary');
    if (personaliseBtn) {
        personaliseBtn.onclick = () => {
            // Store the card index and images in sessionStorage
            sessionStorage.setItem('selectedCardIndex', cardIndex);
            sessionStorage.setItem('selectedCardImages', JSON.stringify(images));

            // Navigate to the editor page
            window.location.href = 'editor.html';
        };
    }

    // Show the modal
    cardPreview = document.querySelector('.CardPreview');
    cardPreview.style.position = 'fixed';
    cardPreview.style.zIndex = 1001;
    cardPreview.style.transform = 'translate(-50%, -50%)';
    cardPreview.style.left = '50%';
    cardPreview.style.top = '50%';
    cardPreview.style.display = 'block'; // Ensure it's visible

    document.body.style.overflow = 'hidden'; //Disable Scrolling
    showBackdrop();

    // Close button functionality
    const closeButton = cardPreview.querySelector('.close');
    closeButton.removeEventListener('click', handleCloseCardPreview); // Avoid duplicate listeners
    closeButton.addEventListener('click', handleCloseCardPreview);

    function handleCloseCardPreview() {
        closeCardPreview();
        closeBackdrop();
    }
}

// Function to handle card type selection
function selectCardType(cardType, images) {
    const isECard = cardType === 'eCard';

    // Get the eCard and Printable buttons
    const eCardBtn = document.querySelector(".CardButton button:nth-child(1)");
    const printableBtn = document.querySelector(".CardButton button:nth-child(2)");

    // Remove selection styles from both buttons
    eCardBtn.classList.remove("bg-success", "text-white");
    printableBtn.classList.remove("bg-success", "text-white");
    eCardBtn.classList.add("btn-outline-primary");
    printableBtn.classList.add("btn-outline-primary");

    // Add selection styles to the clicked button
    if (isECard) {
        eCardBtn.classList.add("bg-success", "text-white");
        eCardBtn.classList.remove("btn-outline-primary");
    } else {
        printableBtn.classList.add("bg-success", "text-white");
        printableBtn.classList.remove("btn-outline-primary");
    }

    // Update UI price and credits display
    document.getElementById('priceDisplay').innerText = `Credits: ${isECard ? 100 : 200}`;
    document.getElementById('priceDisplay2').innerText = `Price: ${isECard ? 0.99 : 1.99}`;

    // Update the carousel images based on selection
    const imagesToShow = isECard ? [images[0], images[2]] : images;
    loadCarouselImages(imagesToShow);

    // Store the selected option in sessionStorage
    sessionStorage.setItem('selectedCardType', isECard ? 'eCard' : 'Printable');
    sessionStorage.setItem('priceRequired', isECard ? 0.99 : 1.99);

    console.log('Stored in session storage:', {
        selectedCardType: sessionStorage.getItem('selectedCardType'),
        priceRequired: sessionStorage.getItem('priceRequired')
    });
}



/* Function to handle card type selection
function selectCardType(cardType, images) {
    let imagesToShow;

    if (cardType === 'eCard') {
        imagesToShow = [images[0], images[2]]; // Show only the first and third images
        document.getElementById('priceDisplay').innerText = 'Credits Needed: 100';

        // Set the third image as the one used in the canvas
        img.src = images[2]; // Set the canvas image to the third image
    } else if (cardType === 'printable') {
        imagesToShow = images; // Show all images
        document.getElementById('priceDisplay').innerText = 'Credits Needed: 200';
    }

    loadCarouselImages(imagesToShow);
    img.onload = () => {
        redrawCanvas(); // Ensure the canvas is redrawn with the new image
    };
}
*/

// Function to dynamically load carousel images
async function loadCarouselImages(images) {
    const carouselImages = document.getElementById('carouselImages');
    const carouselIndicators = document.getElementById('carouselIndicators');

    // Clear previous items
    carouselImages.innerHTML = '';
    carouselIndicators.innerHTML = '';

    images.forEach((imageUrl, index) => {
        const carouselItem = document.createElement('div');
        carouselItem.classList.add('carousel-item');
        if (index === 0) carouselItem.classList.add('active');

        const imgElement = document.createElement('img');
        imgElement.src = imageUrl;
        imgElement.alt = `Carousel Image ${index + 1}`;
        imgElement.classList.add('d-block', 'mx-auto');
        imgElement.style.maxHeight = '500px';
        imgElement.style.width = 'auto';
        imgElement.style.objectFit = 'contain';

        carouselItem.appendChild(imgElement);
        carouselImages.appendChild(carouselItem);

        const indicator = document.createElement('li');
        indicator.setAttribute('data-target', '#cardCarousel');
        indicator.setAttribute('data-slide-to', index);
        if (index === 0) indicator.classList.add('active');
        carouselIndicators.appendChild(indicator);
    });
}

// Open the customise modal for personalization
function OpenPersonalisePreview() {
    if (cardPreview) cardPreview.style.display = 'none'; // Ensure CardPreview is hidden

    personalisePreview = document.querySelector('.PersonalisePreview');
    personalisePreview.style.display = 'block';
    personalisePreview.style.position = 'fixed';
    personalisePreview.style.zIndex = 1001;
    personalisePreview.style.transform = 'translate(-50%, -50%)';
    personalisePreview.style.left = '50%';
    personalisePreview.style.top = '50%';

    showBackdrop();

    // Close button functionality
    const closeButton = personalisePreview.querySelector('.close');
    closeButton.removeEventListener('click', handleClosePersonalisePreview); // Avoid duplicate listeners
    closeButton.addEventListener('click', handleClosePersonalisePreview);

    function handleClosePersonalisePreview() {
        closePersonalisePreview();
        closeBackdrop();
    }
}