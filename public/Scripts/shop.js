// PULL IMAGES AND GEN CARDS
const numCards = 4; // Number of cards you want to generate
let sharedBackdrop = null;
let cardPreview = null;
let personalisePreview = null;
window.onload = generateCards;

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
    const targetBackImage = "Images/background.png";

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

        cards.push(images); // Each card contains an array of images for each position
    }

    return cards;
}

// Function to generate cards
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

// Function to open the card modal
function openCardModal(cardIndex, images) {
    loadCarouselImages(images);

    // Set up the card type selection buttons
    // 修改选择器以匹配正确的按钮结构
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

            // 延迟跳转，以确保数据存储完成
            setTimeout(() => {
                window.location.href = 'Credit_Pay.html';
            }, 100);  // 延迟100ms以确保sessionStorage存储完成
        };
    }

    // Show the modal
    //$('#cardModal').modal('show');   
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
function loadCarouselImages(images) {
    const carouselImages = document.getElementById('carouselImages');
    const carouselIndicators = document.getElementById('carouselIndicators');

    // Clear previous items
    carouselImages.innerHTML = '';
    carouselIndicators.innerHTML = '';

    // Add images to carousel
    images.forEach((image, index) => {
        const carouselItem = document.createElement('div');
        carouselItem.classList.add('carousel-item');
        if (index === 0) carouselItem.classList.add('active'); // First item active

        const imgElement = document.createElement('img');
        imgElement.src = image;
        imgElement.alt = `Carousel Image ${index + 1}`;
        imgElement.classList.add('d-block', 'w-50', 'mx-auto'); // Use w-100 for full width

        carouselItem.appendChild(imgElement);
        carouselImages.appendChild(carouselItem);

        // Create carousel indicator
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




// CANVAS EDITOR

const canvas = document.getElementById('image-canvas');
const ctx = canvas.getContext('2d');
const textBox = document.getElementById('text-box');
const cursor = document.getElementById('cursor');
let texts = [];
let selectedText = null;
let dragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let cursorPosition = 0;
let cursorBlinkInterval;

// Calculate dimensions
const originalWidth = 567; // Normal card dimensions
const originalHeight = 794;
const newWidth = originalWidth * 0.63; // Scale factor
const newHeight = originalHeight * 0.63;

// Set canvas dimensions
canvas.width = newWidth;
canvas.height = newHeight;

// Load the image
const img = new Image();
img.crossOrigin = 'anonymous';
img.src = 'https://picsum.photos/567/794'; // Replace with your image source
img.onload = () => {
    redrawCanvas();
};

// Default text properties
let currentFontColor = 'black';
let currentFontSize = '30px';
let currentFontStyle = 'Arial';
let currentFontBold = false;
let currentFontItalic = false;
let currentFontUnderline = false;

// Function to add text
function addText(text, x, y) {
    texts.push({ text,
        x,
        y,
        fontColor: currentFontColor,
        fontSize: currentFontSize,
        fontStyle: currentFontStyle,
        isBold: currentFontBold,
        isItalic: currentFontItalic,
        isUnderline: currentFontUnderline
    });
    redrawCanvas();
}

// Function to delete the selected text
function deleteText() {
    if (selectedText) {
        texts = texts.filter(t => t !== selectedText);

        redrawCanvas(); // Redraw the canvas to reflect changes
        updateTextBoxPosition(); // Update textbox position
        selectedText = null; // Clear the selection
        textBox.style.display = 'none'; // Hide the text box
        cursor.style.display = 'none'; // Hide the cursor
        clearInterval(cursorBlinkInterval); // Stop cursor blinking
    }
}

// Redraw the canvas
function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    texts.forEach(t => {
        ctx.font = `${t.isBold ? 'bold' : 'normal'} ${t.isItalic ? 'italic' : 'normal'} ${t.fontSize} ${t.fontStyle}`;
        ctx.fillStyle = t.fontColor;
        ctx.fillText(t.text, t.x, t.y);

                // Draw underline if enabled
                if (t.isUnderline) {
                    const textWidth = ctx.measureText(t.text).width;
                    const textHeight = parseInt(t.fontSize, 10);
                    ctx.beginPath();
                    ctx.moveTo(t.x, t.y + 2); // Adjust underline position slightly below text
                    ctx.lineTo(t.x + textWidth, t.y + 2);
                    ctx.lineWidth = 2; // Underline thickness
                    ctx.strokeStyle = t.fontColor; // Match underline color to font color
                    ctx.stroke();
                }
    });
}

// Add text to canvas when button clicked
document.getElementById('addTextBtn').addEventListener('click', () => {
    addText('text', 50, 50); // Add text box with default text 'text'
});

// Delete text from canvas when button clicked
document.getElementById('deleteTextBtn').addEventListener('click', () => {
    deleteText();
});

// Function to get text under mouse
function getTextAtPosition(x, y) {
    for (let i = texts.length - 1; i >= 0; i--) {
        let t = texts[i];
        ctx.font = `${t.isBold ? 'bold' : 'normal'} ${t.isItalic ? 'italic' : 'normal'} ${t.fontSize} ${t.fontStyle}`;
        let width = ctx.measureText(t.text).width;
        let height = parseInt(t.fontSize, 10); // Height based on font size
        if (x >= t.x && x <= t.x + width && y >= t.y - height && y <= t.y) {
            return t;
        }
    }
    return null;
}

// Create a hidden input field
const hiddenInput = document.createElement('input');
hiddenInput.type = 'text';
hiddenInput.style.position = 'absolute';
hiddenInput.style.opacity = '0';
hiddenInput.style.height = '0';
hiddenInput.style.width = '0';
hiddenInput.style.border = 'none';
document.body.appendChild(hiddenInput);

// Canvas mouse down event
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const clickedText = getTextAtPosition(mouseX, mouseY);

    if (clickedText) {
        dragging = true;
        selectedText = clickedText;
        dragOffsetX = mouseX - selectedText.x;
        dragOffsetY = mouseY - selectedText.y;
        cursorPosition = selectedText.text.length;
        updateTextBoxPosition();
        startCursorBlink();

        // Set hotbar values to the selected text properties
        setHotbarValues(selectedText);
        // Position the input and focus to show the keyboard on mobile
        hiddenInput.style.left = `${e.clientX}px`; // Adjust for exact text position if needed
        hiddenInput.style.top = `${e.clientY}px`;
        hiddenInput.value = selectedText.text;
        hiddenInput.focus();

        // Sync input value with selected text on input change
        hiddenInput.oninput = () => {
            selectedText.text = hiddenInput.value;
            drawTextOnCanvas(); // Redraw canvas with updated text
        };

    } else {
        selectedText = null;
        textBox.style.display = 'none';
        cursor.style.display = 'none';
        clearInterval(cursorBlinkInterval);

        // Hide keyboard when tapping outside text
        hiddenInput.blur();
    }
});

// Function to set hotbar values based on selected text
function setHotbarValues(text) {
    // Set color
    document.getElementById('colorSelect').value = text.fontColor;

    // // Set font size
    // const sizeMapping = {
    //     '20px': 'small',
    //     '30px': 'medium',
    //     '40px': 'large'
    // };
    // // Reverse mapping to find the corresponding size option
    // const selectedSize = Object.entries(sizeMapping).find(([key, value]) => key === text.fontSize);
    // document.getElementById('fontSizeSelect').value = selectedSize ? selectedSize[1] : 'medium'; // Default to 'medium'

    // Set font style
    const styleMapping = {
        'Arial': 'regular',
        'Courier New': 'simple',
        'Times New Roman': 'fancy'
    };
    // Reverse mapping to find the corresponding style option
    const selectedStyle = Object.entries(styleMapping).find(([key, value]) => key === text.fontStyle);
    document.getElementById('fontStyleSelect').value = selectedStyle ? selectedStyle[1] : 'regular'; // Default to 'regular'

    // Set bold and italic buttons
    currentFontBold = text.isBold;
    document.getElementById('boldBtn').classList.toggle('active', currentFontBold);

    currentFontItalic = text.isItalic;
    document.getElementById('italicBtn').classList.toggle('active', currentFontItalic);
}

// Canvas mouse move event
canvas.addEventListener('mousemove', (e) => {
    if (dragging && selectedText) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        selectedText.x = mouseX - dragOffsetX;
        selectedText.y = mouseY - dragOffsetY;

        redrawCanvas();
        updateTextBoxPosition();
    }
});

// Canvas mouse up event
canvas.addEventListener('mouseup', () => {
    dragging = false;
});

// Update text when input changes
canvas.addEventListener('keydown', (e) => {
    if (selectedText) {
        if (e.key === 'Backspace') {
            selectedText.text = selectedText.text.slice(0, cursorPosition - 1) + selectedText.text.slice(cursorPosition);
            cursorPosition = Math.max(0, cursorPosition - 1);
        } else if (e.key === 'Enter') {
            selectedText = null;
            textBox.style.display = 'none';
            cursor.style.display = 'none';
            clearInterval(cursorBlinkInterval);
            return;
        } else if (e.key.length === 1) {
            selectedText.text = selectedText.text.slice(0, cursorPosition) + e.key + selectedText.text.slice(cursorPosition);
            cursorPosition++;
        } else if (e.key === 'ArrowLeft') {
            cursorPosition = Math.max(0, cursorPosition - 1);
        } else if (e.key === 'ArrowRight') {
            cursorPosition = Math.min(selectedText.text.length, cursorPosition + 1);
        }

        redrawCanvas();
        updateTextBoxPosition();
        updateCursorPosition();
    }
});

// Function to update the position and size of the text box
function updateTextBoxPosition() {
    if (selectedText) {
        ctx.font = `${selectedText.isBold ? 'bold' : 'normal'} ${selectedText.isItalic ? 'italic' : 'normal'} ${selectedText.fontSize} ${selectedText.fontStyle}`;
        let width = ctx.measureText(selectedText.text).width;
        let height = parseInt(selectedText.fontSize, 10);

        textBox.style.left = (selectedText.x +3 + canvas.offsetLeft) + 'px';
        textBox.style.top = (selectedText.y +5 - height + canvas.offsetTop) + 'px';
        textBox.style.width = width + 'px';
        textBox.style.height = height + 'px';
        textBox.style.display = 'block';

        updateCursorPosition();
    }
}

// Update cursor position based on the current text
function updateCursorPosition() {
    if (selectedText) {
        ctx.font = `${selectedText.isBold ? 'bold' : 'normal'} ${selectedText.isItalic ? 'italic' : 'normal'} ${selectedText.fontSize} ${selectedText.fontStyle}`;
        const textBeforeCursor = selectedText.text.slice(0, cursorPosition);
        const cursorX = selectedText.x + ctx.measureText(textBeforeCursor).width;

        // Calculate text height
        const textHeight = parseInt(selectedText.fontSize, 10);
        const cursorY = selectedText.y - textHeight + (textHeight * 0.2); // Adjust for baseline

        // Set cursor length to 0.8 times the font height
        const cursorLength = textHeight * 0.8;

        // Update cursor styles
        cursor.style.width = `${2}px`; // Set cursor width (thickness)
        cursor.style.height = `${cursorLength}px`; // Set cursor length
        cursor.style.left = (cursorX + canvas.offsetLeft) + 'px';
        cursor.style.top = (cursorY + canvas.offsetTop) + 'px';
        cursor.style.display = 'block';
    }
}

// Start cursor blinking
function startCursorBlink() {
    clearInterval(cursorBlinkInterval);
    cursor.style.display = 'block'; // Show cursor
}

function getCurrentCardImages() {
    const carouselImages = document.querySelectorAll('#carouselImages .carousel-item img');
    let images = [];
    carouselImages.forEach(img => {
        images.push(img.src);
    });
    return images;
}

// Handle color selection
const handleColorSelection = (color) => {
    currentFontColor = color; // Update the current font color
    if (selectedText) {
        selectedText.fontColor = currentFontColor; // Update selected text color
        redrawCanvas(); // Redraw canvas to reflect changes
        updateTextBoxPosition(); // Update textbox position
    }
};
document.getElementById('whiteBtn').addEventListener('click', () => handleColorSelection('white'));
document.getElementById('blackBtn').addEventListener('click', () => handleColorSelection('black'));
document.getElementById('redBtn').addEventListener('click', () => handleColorSelection('red'));
document.getElementById('blueBtn').addEventListener('click', () => handleColorSelection('blue'));
document.getElementById('greenBtn').addEventListener('click', () => handleColorSelection('green'));

// // Handle font size selection
// document.getElementById('fontSizeSelect').addEventListener('change', (e) => {
//     const sizeMapping = {
//         small: '20px',
//         medium: '30px',
//         large: '40px'
//     };
//     currentFontSize = sizeMapping[e.target.value] || '30px'; // Update current font size
//     if (selectedText) {
//         selectedText.fontSize = currentFontSize; // Update selected text color
//         redrawCanvas(); // Redraw canvas to reflect changes
//         updateTextBoxPosition(); // Update textbox position
//         updateCursorPosition(); // Update cursor position
//     }
// });

// Increase font size
document.getElementById('increaseSizeBtn').addEventListener('click', () => {
    if (selectedText) {
        const currentSize = parseInt(selectedText.fontSize, 10);
        selectedText.fontSize = `${currentSize + 5}px`; // Increase font size by 5px
        redrawCanvas();
        updateTextBoxPosition();
        updateCursorPosition();
    }
});

// Decrease font size
document.getElementById('decreaseSizeBtn').addEventListener('click', () => {
    if (selectedText) {
        const currentSize = parseInt(selectedText.fontSize, 10);
        if (currentSize > 5) { // Ensure font size stays above a minimum value
            selectedText.fontSize = `${currentSize - 5}px`; // Decrease font size by 5px
            redrawCanvas();
            updateTextBoxPosition();
            updateCursorPosition();
        }
    }
});


// Handle font style selection
document.getElementById('fontStyleSelect').addEventListener('change', (e) => {
    const styleMapping = {
        regular: 'Arial',
        simple: 'Courier New',
        fancy: 'Times New Roman'
    };

    currentFontStyle = styleMapping[e.target.value] || 'Arial';
    if (selectedText) {
        selectedText.fontStyle = currentFontStyle
        redrawCanvas(); // Redraw canvas
        updateTextBoxPosition(); // Update textbox position
        updateCursorPosition(); // Update cursor position
    }
});

// Handle bold button
document.getElementById('boldBtn').addEventListener('click', () => {
    currentFontBold = !currentFontBold; // Toggle bold
    document.getElementById('boldBtn').classList.toggle('active', currentFontBold);
    if (selectedText) {
        selectedText.isBold = currentFontBold; // Update selected text color
        redrawCanvas(); // Redraw canvas to reflect changes
        updateTextBoxPosition(); // Update textbox position
    }
});

// Handle italic button
document.getElementById('italicBtn').addEventListener('click', () => {
    currentFontItalic = !currentFontItalic; // Toggle italic
    document.getElementById('italicBtn').classList.toggle('active', currentFontItalic);
    if (selectedText) {
        selectedText.isItalic = currentFontItalic; // Update selected text color
        redrawCanvas(); // Redraw canvas to reflect changes
        updateTextBoxPosition(); // Update textbox position
    }
});

// Handle underline button
document.getElementById('underlineBtn').addEventListener('click', () => {
    currentFontUnderline = !currentFontUnderline; // Toggle underline
    document.getElementById('underlineBtn').classList.toggle('active', currentFontUnderline);
    if (selectedText) {
        selectedText.isUnderline = currentFontUnderline; // Update selected text underline
        redrawCanvas(); // Redraw canvas to reflect changes
        updateTextBoxPosition(); // Update textbox position
    }
});

// Save as PNG button
document.getElementById("downloadCanvasBtn").addEventListener("click", () => {
    const canvas = document.getElementById("image-canvas");
    
    if (!canvas) {
        alert("Canvas not found.");
        return;
    }
    
    canvas.toBlob((blob) => {
        if (!blob) {
            alert("Failed to generate the image.");
            return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "Sustainables Card.png";
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Revoke the object URL after the download
        URL.revokeObjectURL(url);
    });
});

// Enable typing in the canvas when text is selected
canvas.addEventListener('click', (e) => {
    if (selectedText) {
        canvas.focus();
    }
});

// Prevent default behavior for keydown event
canvas.setAttribute('tabindex', '0');
canvas.focus();