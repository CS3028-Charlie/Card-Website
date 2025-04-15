// Global variables
let currentCardData = {
    cardIndex: 0,
    cardType: 'eCard',  // 'eCard' or 'printable'
    images: [],
    canvases: {},
    contexts: {},
    activeCanvas: 'front',
    activeTexts: {
        'front': [],
        'inner-left': [],
        'inner-right': [],
        'back': []
    },
    activeTextIndex: -1,
    fontSize: 20,
    fontFamily: 'Arial',
    fontColor: 'black',
    fontStyle: 'normal',
    fontWeight: 'normal',
    textDecoration: 'none',
    stickers: {
        'front': [],
        'inner-left': [],
        'inner-right': [],
        'back': []
    }
};

// DOM Elements
const canvasIds = ['front-canvas', 'inner-left-canvas', 'inner-right-canvas', 'back-canvas'];
const textBoxIds = ['front-text-box', 'inner-left-text-box', 'inner-right-text-box', 'back-text-box'];
const cursorIds = ['front-cursor', 'inner-left-cursor', 'inner-right-cursor', 'back-cursor'];

// Initialize the editor on window load
window.onload = function() {
    console.log("Editor initializing...");

    // Check if there is a draft parameter in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const draftId = urlParams.get('draft');
    const cardIndex = urlParams.get('card');
    const cardType = urlParams.get('type');

    if (draftId) {
        console.log("Draft ID found in URL:", draftId);
        sessionStorage.setItem('draftId', draftId);
    }

    if (cardIndex) {
        sessionStorage.setItem('selectedCardIndex', cardIndex);
    }

    if (cardType) {
        sessionStorage.setItem('selectedCardType', cardType);
    }

    // Set up canvases and event listeners
    setupCanvases();
    setupEventListeners();

    // First load basic card data
    loadCardData();
    updateCardTypeView();
    initializeStickerDragAndDrop();

    // If there is a draft ID, load the draft content
    if (draftId) {
        loadDraftContent(draftId);
    }
};

// New function: Load draft content
async function loadDraftContent(draftId) {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        alert('You must be logged in to load drafts.');
        return;
    }

    try {
        const API_URL = "https://charlie-card-backend-fbbe5a6118ba.herokuapp.com";
        const response = await fetch(`${API_URL}/api/drafts/${draftId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load draft content');
        }

        const draft = await response.json();
        // Update the card's basic information (cardIndex and cardType) and sync to sessionStorage
        if (draft.cardIndex !== undefined && draft.cardType) {
            currentCardData.cardIndex = draft.cardIndex;
            currentCardData.cardType = draft.cardType;
            sessionStorage.setItem('selectedCardIndex', draft.cardIndex);
            sessionStorage.setItem('selectedCardType', draft.cardType);
            updateCardTypeView();  // Update UI display, such as price, button status, etc.
        }
        console.log("Loading draft content:", draft);

        // Wait for the basic canvas to finish loading
        setTimeout(() => {
            // Apply text content
            if (draft.activeTexts) {
                currentCardData.activeTexts = draft.activeTexts;

                // Redraw all canvases
                canvasIds.forEach(canvasId => {
                    const canvasType = canvasId.replace('-canvas', '');
                    if (currentCardData.activeTexts[canvasType] &&
                        currentCardData.activeTexts[canvasType].length > 0) {
                        console.log(`Loading ${currentCardData.activeTexts[canvasType].length} texts for ${canvasType}`);
                        redrawText(canvasId);
                    }
                });
            }

            // Apply sticker content
            if (draft.stickers) {
                currentCardData.stickers = draft.stickers;

                // Add stickers for each canvas
                for (const canvasType in draft.stickers) {
                    const stickers = draft.stickers[canvasType];
                    const canvasId = `${canvasType}-canvas`;
                    const container = document.getElementById(canvasId)?.parentElement;

                    if (container && stickers && stickers.length > 0) {
                        console.log(`Loading ${stickers.length} stickers for ${canvasType}`);

                        // Clear existing stickers
                        container.querySelectorAll('.placed-sticker').forEach(el => el.remove());

                        // Add new stickers
                        stickers.forEach(stickerData => {
                            const sticker = document.createElement('img');
                            sticker.src = stickerData.src;
                            sticker.classList.add('placed-sticker');
                            sticker.style.position = 'absolute';
                            sticker.style.left = `${stickerData.x}px`;
                            sticker.style.top = `${stickerData.y}px`;
                            sticker.style.width = `${stickerData.width}px`;
                            sticker.style.height = `${stickerData.height}px`;
                            sticker.style.zIndex = '10';

                            makeStickerDraggable(sticker);
                            container.appendChild(sticker);
                        });
                    }
                }
            }

            alert('Draft loaded successfully!');
        }, 1000); // Give the canvas some time to load

    } catch (error) {
        console.error('Error loading draft content:', error);
        alert('Failed to load draft content. Please try again.');
    }
}

// Add function to load draft
async function loadDraft(draftId) {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        alert('You must be logged in to load drafts.');
        return;
    }

    try {
        const API_URL = "https://charlie-card-backend-fbbe5a6118ba.herokuapp.com";
        const response = await fetch(`${API_URL}/api/drafts/${draftId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load draft');
        }

        const draft = await response.json();
        console.log("Loaded draft data:", draft);

        // First update sessionStorage
        sessionStorage.setItem('draftId', draft._id);
        sessionStorage.setItem('selectedCardIndex', draft.cardIndex);
        sessionStorage.setItem('selectedCardType', draft.cardType);

        // Then reinitialize the editor
        window.location.href = `/editor.html?card=${draft.cardIndex}&type=${draft.cardType}&draft=${draft._id}`;

    } catch (error) {
        console.error('Error loading draft:', error);
        alert('Failed to load draft. Please try again.');
    }
}

// Load card data from URL parameters or sessionStorage
function loadCardData() {
    // Get card index and type from session storage
    const cardIndex = sessionStorage.getItem('selectedCardIndex') || 0;
    const cardType = sessionStorage.getItem('selectedCardType') || 'eCard';
    
    currentCardData.cardIndex = parseInt(cardIndex);
    currentCardData.cardType = cardType;
    
    // Update the UI elements to reflect the card type
    document.getElementById('cardTypeDisplay').textContent = cardType;
    document.getElementById('priceDisplay').textContent = cardType === 'eCard' ? '100 Credits' : '200 Credits';
    document.getElementById('priceDisplay2').textContent = cardType === 'eCard' ? '£0.99' : '£1.99';
    
    // Select the appropriate card type button
    if (cardType === 'eCard') {
        document.getElementById('eCardBtn').classList.add('active');
        document.getElementById('printableBtn').classList.remove('active');
    } else {
        document.getElementById('eCardBtn').classList.remove('active');
        document.getElementById('printableBtn').classList.add('active');
    }
    
    // Load images for the selected card
    const cardImages = JSON.parse(sessionStorage.getItem('selectedCardImages'));
    if (cardImages) {
        currentCardData.images = cardImages;
        loadImagesIntoCanvases();
    } else {
        loadCardImages(cardIndex);
    }
}

// Load images for the selected card
function loadCardImages(cardIndex) {
    const API_URL = "https://charlie-card-backend-fbbe5a6118ba.herokuapp.com";
    const positions = ["Front", "Inner-Left", "Inner-Right", "Back"];
    const folderIndex = `card-${cardIndex + 1}`;
    
    const images = positions.map(position => 
        `${API_URL}/assets/templates/${folderIndex}/${position}.png`
    );
    
    currentCardData.images = images;
    
    // Set canvas dimensions to 567x794
    canvasIds.forEach(canvasId => {
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            canvas.width = 567;
            canvas.height = 794;
        }
    });
    
    // Start loading images into canvases
    loadImagesIntoCanvases();
}

// Modify loadImagesIntoCanvases to store the standardized images
async function loadImagesIntoCanvases() {
    for (let i = 0; i < canvasIds.length; i++) {
        const canvasId = canvasIds[i];
        if (i < currentCardData.images.length) {
            const canvas = document.getElementById(canvasId);
            canvas.width = 567;
            canvas.height = 794;
            const ctx = canvas.getContext('2d');
            
            currentCardData.canvases[canvasId] = canvas;
            currentCardData.contexts[canvasId] = ctx;
            
            try {
                const img = new Image();
                img.crossOrigin = "anonymous"; // Add this line for CORS
                img.onload = () => {
                    // Clear canvas
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    // Fill white background first
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

                    // Store the scaling info with the image
                    currentCardData.images[i] = {
                        src: img.src,
                        scale: scale,
                        x: x,
                        y: y,
                        width: scaledWidth,
                        height: scaledHeight
                    };
                    
                    redrawText(canvasId);
                };
                img.src = currentCardData.images[i];
            } catch (error) {
                console.error(`Error loading image for ${canvasId}:`, error);
            }
        }
    }
}

// Set up canvases
function setupCanvases() {
    canvasIds.forEach(id => {
        const canvas = document.getElementById(id);
        if (canvas) {
            // Ensure canvas is responsive
            canvas.style.maxWidth = '100%';
            canvas.style.maxHeight = '100%';
        }
    });
}

// Set up event listeners
function setupEventListeners() {
    // Card type selection
    document.getElementById('eCardBtn').addEventListener('click', function() {
        currentCardData.cardType = 'eCard';
        updateCardTypeView();
    });
    
    document.getElementById('printableBtn').addEventListener('click', function() {
        currentCardData.cardType = 'printable';
        updateCardTypeView();
    });
    
    // Text manipulation buttons
    document.getElementById('addTextBtn').addEventListener('click', addTextToActiveCanvas);
    document.getElementById('deleteTextBtn').addEventListener('click', deleteSelectedText);
    
    // Text styling buttons
    document.getElementById('boldBtn').addEventListener('click', toggleBold);
    document.getElementById('italicBtn').addEventListener('click', toggleItalic);
    document.getElementById('underlineBtn').addEventListener('click', toggleUnderline);
    
    // Font size buttons
    document.getElementById('increaseSizeBtn').addEventListener('click', increaseFontSize);
    document.getElementById('decreaseSizeBtn').addEventListener('click', decreaseFontSize);
    
    // Font style dropdown
    document.getElementById('fontStyleSelect').addEventListener('change', changeFontStyle);
    
    // Color buttons
    document.getElementById('whiteBtn').addEventListener('click', () => setTextColor('white'));
    document.getElementById('blackBtn').addEventListener('click', () => setTextColor('black'));
    document.getElementById('redBtn').addEventListener('click', () => setTextColor('red'));
    document.getElementById('blueBtn').addEventListener('click', () => setTextColor('blue'));
    document.getElementById('greenBtn').addEventListener('click', () => setTextColor('green'));
    
    // Action buttons
    document.getElementById('saveCustomizationBtn').addEventListener('click', saveCustomization);
    document.getElementById('addToBasketBtn').addEventListener('click', addToBasket);
    document.getElementById('buyNowBtn').addEventListener('click', buyNow);
    
    // Canvas click listeners for text selection
    canvasIds.forEach(canvasId => {
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            canvas.addEventListener('click', function(e) {
                handleCanvasClick(e, canvasId);
            });
            
            // Set active canvas when tab is changed
            const tabId = canvasId.replace('-canvas', '-tab');
            document.getElementById(tabId).addEventListener('click', function() {
                setActiveCanvas(canvasId.split('-')[0]);
            });
        }
    });

    // Tab click handlers with fixed canvas type handling
    const tabLinks = document.querySelectorAll('.nav-tabs .nav-link');
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('href').substring(1);
            let canvasType = tabId;
            
            // Map tab IDs to canvas types
            if (tabId === 'inner-left') canvasType = 'inner-left';
            if (tabId === 'inner-right') canvasType = 'inner-right';
            
            console.log('Setting active canvas to:', canvasType);
            
            // Update active canvas
            setActiveCanvas(canvasType);
            
            // Update tab UI
            tabLinks.forEach(tab => tab.classList.remove('active'));
            this.classList.add('active');
            
            // Update tab content
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('show', 'active');
            });
            document.getElementById(tabId).classList.add('show', 'active');
        });
    });
}

// Update view based on card type
function updateCardTypeView() {
    const isECard = currentCardData.cardType === 'eCard';
    
    // Update price displays
    document.getElementById('priceDisplay').textContent = isECard ? '100 Credits' : '200 Credits';
    document.getElementById('priceDisplay2').textContent = isECard ? '£0.99' : '£1.99';
    document.getElementById('cardTypeDisplay').textContent = isECard ? 'eCard' : 'Printable';
    
    // Show/hide relevant tabs based on card type
    document.getElementById('inner-left-tab-item').style.display = isECard ? 'none' : 'block';
    document.getElementById('back-tab-item').style.display = isECard ? 'none' : 'block';
    
    // If we were on a tab that is now hidden, switch to the front tab
    if (isECard && (currentCardData.activeCanvas === 'inner-left' || currentCardData.activeCanvas === 'back')) {
        $('#front-tab').tab('show');
        setActiveCanvas('front');
    }
    
    // Make sure session storage is updated
    sessionStorage.setItem('selectedCardType', currentCardData.cardType);
    sessionStorage.setItem('creditsRequired', isECard ? '100' : '200');
    sessionStorage.setItem('priceRequired', isECard ? '0.99' : '1.99');
}

// Set the active canvas
function setActiveCanvas(canvasType) {
    // Clean up the canvasType string and handle special cases
    canvasType = canvasType.toLowerCase()
        .replace('-tab', '')
        .replace('tab', '')
        .replace('inner-', 'inner-')  // Preserve 'inner-' prefix
        .trim();
    
    console.log('Setting active canvas type:', canvasType);
    
    // Initialize text array if it doesn't exist
    if (!currentCardData.activeTexts[canvasType]) {
        currentCardData.activeTexts[canvasType] = [];
    }
    
    currentCardData.activeCanvas = canvasType;
    currentCardData.activeTextIndex = -1;
    
    // Hide all text boxes and cursors
    textBoxIds.forEach(id => {
        document.getElementById(id).style.display = 'none';
    });
    
    cursorIds.forEach(id => {
        document.getElementById(id).style.display = 'none';
    });
    
    // Show and redraw the correct canvas
    const activeCanvasId = `${canvasType}-canvas`;
    console.log('Looking for canvas:', activeCanvasId);
    
    canvasIds.forEach(id => {
        const canvas = document.getElementById(id);
        if (canvas) {
            if (id === activeCanvasId) {
                canvas.style.display = 'block';
                console.log('Found and showing canvas:', id);
                redrawText(id);
            } else {
                canvas.style.display = 'none';
            }
        }
    });
}



// Add text to the active canvas
function addTextToActiveCanvas() {
    const activeCanvas = currentCardData.activeCanvas;
    const canvasId = `${activeCanvas}-canvas`;
    console.log('Add Text to Canvas:', activeCanvas);

    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error('Cannot find the canva:', canvasId);
        return;
    }

    // Ensure text array exists
    if (!currentCardData.activeTexts[activeCanvas]) {
        currentCardData.activeTexts[activeCanvas] = [];
    }

    // Add new text
    const newText = {
        text: 'Click to edit',
        x: canvas.width / 2,
        y: canvas.height / 2,
        fontSize: currentCardData.fontSize || 20,
        fontFamily: currentCardData.fontFamily || 'Arial',
        color: currentCardData.fontColor || 'black',
        fontStyle: currentCardData.fontStyle || 'normal',
        fontWeight: currentCardData.fontWeight || 'normal',
        textDecoration: currentCardData.textDecoration || 'none'
    };

    currentCardData.activeTexts[activeCanvas].push(newText);
    currentCardData.activeTextIndex = currentCardData.activeTexts[activeCanvas].length - 1;

    console.log('Text arrays on the text:', currentCardData.activeTexts[activeCanvas]);
    
    redrawText(canvasId);
    showTextBox(canvasId);
}

// Delete selected text
function deleteSelectedText() {
    if (currentCardData.activeTextIndex !== -1) {
        currentCardData.activeTexts[currentCardData.activeCanvas].splice(currentCardData.activeTextIndex, 1);
        currentCardData.activeTextIndex = -1;
        
        // Redraw the canvas
        const canvasId = `${currentCardData.activeCanvas}-canvas`;
        redrawText(canvasId);
        
        // Hide text box
        const textBoxId = `${currentCardData.activeCanvas}-text-box`;
        document.getElementById(textBoxId).style.display = 'none';
        
        // Hide cursor
        const cursorId = `${currentCardData.activeCanvas}-cursor`;
        document.getElementById(cursorId).style.display = 'none';
    }
}

// Update redrawText to use stored image dimensions
function redrawText(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const canvasType = canvasId.includes('inner-') ? 
        canvasId.replace('-canvas', '') : 
        canvasId.split('-')[0];
    
    // Create an off-screen canvas for double buffering
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;
    const offscreenCtx = offscreenCanvas.getContext('2d');
    
    // Get image data from stored array
    const imageData = currentCardData.images[canvasIds.indexOf(canvasId)];
    
    if (imageData) {
        const img = new Image();
        img.crossOrigin = "anonymous"; // Add this line for CORS
        img.onload = function() {
            // Fill white background
            offscreenCtx.fillStyle = '#ffffff';
            offscreenCtx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw using stored dimensions
            offscreenCtx.drawImage(img, imageData.x, imageData.y, imageData.width, imageData.height);
            
            // Draw all texts
            const texts = currentCardData.activeTexts[canvasType] || [];
            texts.forEach(text => {
                offscreenCtx.font = `${text.fontStyle} ${text.fontWeight} ${text.fontSize}px ${text.fontFamily}`;
                offscreenCtx.fillStyle = text.color;
                offscreenCtx.textAlign = 'center';
                offscreenCtx.fillText(text.text, text.x, text.y);
                
                if (text.textDecoration === 'underline') {
                    const textWidth = offscreenCtx.measureText(text.text).width;
                    offscreenCtx.beginPath();
                    offscreenCtx.moveTo(text.x - textWidth / 2, text.y + 5);
                    offscreenCtx.lineTo(text.x + textWidth / 2, text.y + 5);
                    offscreenCtx.strokeStyle = text.color;
                    offscreenCtx.lineWidth = 1;
                    offscreenCtx.stroke();
                }
            });

            // Copy to visible canvas
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(offscreenCanvas, 0, 0);

            // Handle stickers
            const existingStickers = canvas.parentElement.querySelectorAll('.placed-sticker');
            const currentStickers = currentCardData.stickers[canvasType] || [];
            
            // Remove only stickers that aren't in currentCardData
            existingStickers.forEach(sticker => {
                const stickerData = currentStickers.find(s => 
                    s.src === sticker.src && 
                    s.x === parseInt(sticker.style.left) && 
                    s.y === parseInt(sticker.style.top)
                );
                if (!stickerData) {
                    sticker.remove();
                }
            });
            
            // Add any missing stickers
            currentStickers.forEach(stickerData => {
                const exists = Array.from(existingStickers).some(sticker => 
                    sticker.src === stickerData.src && 
                    parseInt(sticker.style.left) === stickerData.x && 
                    parseInt(sticker.style.top) === stickerData.y
                );
                
                if (!exists) {
                    const sticker = document.createElement('img');
                    sticker.src = stickerData.src;
                    sticker.classList.add('placed-sticker');
                    sticker.style.left = `${stickerData.x}px`;
                    sticker.style.top = `${stickerData.y}px`;
                    sticker.style.width = `${stickerData.width}px`;
                    sticker.style.height = `${stickerData.height}px`;
                    makeStickerDraggable(sticker);
                    canvas.parentElement.appendChild(sticker);
                }
            });

            // Draw watermark last
            const watermark = new Image();
            watermark.crossOrigin = "anonymous"; // Add this line for CORS
            watermark.src = 'Images/watermark.png';
            watermark.onload = function() {
                const watermarkScale = Math.min(
                    canvas.width / watermark.width,
                    canvas.height / watermark.height
                );
                const watermarkX = (canvas.width - watermark.width * watermarkScale) / 2;
                const watermarkY = (canvas.height - watermark.height * watermarkScale) / 2;
                offscreenCtx.globalAlpha = 0.5;
                offscreenCtx.drawImage(watermark, watermarkX, watermarkY, watermark.width * watermarkScale, watermark.height * watermarkScale);
                offscreenCtx.globalAlpha = 1.0;

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(offscreenCanvas, 0, 0);
            };
        };
        img.src = imageData.src;
    }
}

// Show text box around selected text
function showTextBox(canvasId) {
    const canvasType = canvasId.includes('inner-') ? 
        canvasId.replace('-canvas', '') : 
        canvasId.split('-')[0];
    
    const textIndex = currentCardData.activeTextIndex;
    
    console.log('Showing text box for:', canvasType, 'index:', textIndex);
    
    const textBoxId = `${canvasType}-text-box`;
    const cursorId = `${canvasType}-cursor`;
    
    const textBox = document.getElementById(textBoxId);
    const cursor = document.getElementById(cursorId);
    
    if (!textBox || !cursor) {
        console.error('Text box or cursor elements not found:', textBoxId, cursorId);
        return;
    }
    
    const texts = currentCardData.activeTexts[canvasType] || [];
    
    if (textIndex === -1 || !texts[textIndex]) {
        textBox.style.display = 'none';
        cursor.style.display = 'none';
        return;
    }
    
    const text = texts[textIndex];
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    
    ctx.font = `${text.fontStyle} ${text.fontWeight} ${text.fontSize}px ${text.fontFamily}`;
    const textMetrics = ctx.measureText(text.text);
    const textWidth = textMetrics.width;
    const textHeight = parseInt(text.fontSize);
    
    const canvasRect = canvas.getBoundingClientRect();
    const scale = canvas.width / canvasRect.width;
    
    textBox.style.display = 'block';
    
    const textBoxLeft = canvasRect.left + (text.x / scale) - (textWidth / 2);
    const textBoxTop = canvasRect.top + (text.y / scale) - textHeight + 3;
    
    textBox.style.left = `${textBoxLeft}px`;
    textBox.style.top = `${textBoxTop}px`;
    textBox.style.width = `${textWidth}px`;
    textBox.style.height = `${textHeight}px`;
    
    cursor.style.display = 'block';
    cursor.style.left = `${textBoxLeft + textWidth}px`;
    cursor.style.top = `${textBoxTop}px`;
    cursor.style.height = `${textHeight}px`;
}

// Handle canvas click for text selection
function handleCanvasClick(e, canvasId) {
    const canvas = document.getElementById(canvasId);
    const canvasType = canvasId.includes('inner-') ? 
        canvasId.replace('-canvas', '') : 
        canvasId.split('-')[0];
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const texts = currentCardData.activeTexts[canvasType] || [];
    let clickedTextIndex = -1;
    
    // Check if click is on any text
    for (let i = texts.length - 1; i >= 0; i--) {
        const text = texts[i];
        const ctx = canvas.getContext('2d');
        ctx.font = `${text.fontStyle} ${text.fontWeight} ${text.fontSize}px ${text.fontFamily}`;
        const textWidth = ctx.measureText(text.text).width;
        const textHeight = parseInt(text.fontSize);
        
        if (x >= text.x - textWidth / 2 && 
            x <= text.x + textWidth / 2 && 
            y >= text.y - textHeight && 
            y <= text.y) {
            clickedTextIndex = i;
            break;
        }
    }
    
    currentCardData.activeTextIndex = clickedTextIndex;
    currentCardData.activeCanvas = canvasType;
    
    if (clickedTextIndex !== -1) {
        const selectedText = texts[clickedTextIndex];
        selectedText.dragStartX = x - selectedText.x;
        selectedText.dragStartY = y - selectedText.y;
        
        // Update UI to match selected text properties
        updateUIFromText(selectedText);
        
        canvas.addEventListener('mousedown', startDragging);
        showTextBox(canvasId);
    } else {
        hideTextBox(canvasType);
    }
}

// Add helper function to hide text box
function hideTextBox(canvasType) {
    const textBox = document.getElementById(`${canvasType}-text-box`);
    const cursor = document.getElementById(`${canvasType}-cursor`);
    
    if (textBox) textBox.style.display = 'none';
    if (cursor) cursor.style.display = 'none';
}

// Start dragging
function startDragging(e) {
    const canvas = e.target;
    const canvasType = currentCardData.activeCanvas;
    const textIndex = currentCardData.activeTextIndex;
    let isDragging = false;
    let initialX, initialY;
    
    function handleMouseDown(e) {
        isDragging = true;
        const text = currentCardData.activeTexts[canvasType][textIndex];
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        initialX = e.clientX - (text.x / scaleX);
        initialY = e.clientY - (text.y / scaleY);
    }
    
    function handleMouseMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        
        const text = currentCardData.activeTexts[canvasType][textIndex];
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        // Calculate new position with bounds checking
        const newX = Math.max(50, Math.min(canvas.width - 50, (e.clientX - initialX) * scaleX));
        const newY = Math.max(50, Math.min(canvas.height - 50, (e.clientY - initialY) * scaleY));
        
        text.x = newX;
        text.y = newY;
        
        redrawText(canvas.id);
        showTextBox(canvas.id);
    }
    
    function handleMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }
    
    handleMouseDown(e);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}

// Toggle bold text
function toggleBold() {
    currentCardData.fontWeight = currentCardData.fontWeight === 'bold' ? 'normal' : 'bold';
    updateTextStyle(text => {
        text.fontWeight = currentCardData.fontWeight;
    });
}

// Toggle italic text
function toggleItalic() {
    currentCardData.fontStyle = currentCardData.fontStyle === 'italic' ? 'normal' : 'italic';
    updateTextStyle(text => {
        text.fontStyle = currentCardData.fontStyle;
    });
}

// Toggle underline text
function toggleUnderline() {
    currentCardData.textDecoration = currentCardData.textDecoration === 'underline' ? 'none' : 'underline';
    updateTextStyle(text => {
        text.textDecoration = currentCardData.textDecoration;
    });
}

// Increase font size
function increaseFontSize() {
    currentCardData.fontSize += 5;
    updateTextStyle(text => {
        text.fontSize = currentCardData.fontSize;
    });
}

// Decrease font size
function decreaseFontSize() {
    currentCardData.fontSize = Math.max(5, currentCardData.fontSize - 5);
    updateTextStyle(text => {
        text.fontSize = currentCardData.fontSize;
    });
}

// Change font style
function changeFontStyle(e) {
    currentCardData.fontFamily = e.target.value;
    updateTextStyle(text => {
        text.fontFamily = currentCardData.fontFamily;
    });
}

// Set text color
function setTextColor(color) {
    currentCardData.fontColor = color;
    updateTextStyle(text => {
        text.color = currentCardData.fontColor;
    });
}

function updateTextStyle(updateFn) {
    if (currentCardData.activeTextIndex !== -1) {
        const text = currentCardData.activeTexts[currentCardData.activeCanvas][currentCardData.activeTextIndex];
        updateFn(text);
        
        const canvasId = `${currentCardData.activeCanvas}-canvas`;
        redrawText(canvasId);
    }
}

// Update redrawCanvas to maintain selection
function redrawCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    // ... existing drawing code ...
    
    // Always show text box if there's an active selection
    if (currentCardData.activeTextIndex !== -1 && 
        canvasId === `${currentCardData.activeCanvas}-canvas`) {
        showTextBox(canvasId);
    }
}

function maintainTextSelection() {
    const textBox = document.getElementById(`${currentCardData.activeCanvas}-text-box`);
    const cursor = document.getElementById(`${currentCardData.activeCanvas}-cursor`);
    if (textBox) textBox.style.display = 'block';
    if (cursor) cursor.style.display = 'block';
}

function saveCustomization() {
    // Create save draft dialog
    const draftDialog = document.createElement('div');
    draftDialog.classList.add('draft-dialog');
    draftDialog.innerHTML = `
        <div class="draft-dialog-content">
            <div class="draft-dialog-header">
                <h5>Save Draft</h5>
                <button type="button" class="close" id="closeDraftDialog">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="draft-dialog-body">
                <form id="saveDraftForm">
                    <div class="form-group">
                        <label for="draftName">Draft Name:</label>
                        <input type="text" class="form-control" id="draftName" placeholder="Enter a name for your draft" required>
                    </div>
                    <button type="submit" class="btn btn-success btn-block">Save Draft</button>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(draftDialog);

    // Get dialog elements
    const closeDraftDialog = document.getElementById('closeDraftDialog');
    const saveDraftForm = document.getElementById('saveDraftForm');

    // Close dialog
    closeDraftDialog.addEventListener('click', () => {
        draftDialog.remove();
    });

    // Submit form
    saveDraftForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const draftName = document.getElementById('draftName').value;
        const authToken = localStorage.getItem('authToken');

        if (!authToken) {
            alert('You must be logged in to save drafts.');
            draftDialog.remove();
            return;
        }

        // Simplify image data
        const processedImages = [];
        if (Array.isArray(currentCardData.images)) {
            currentCardData.images.forEach(img => {
                if (typeof img === 'string') {
                    processedImages.push(img);
                } else if (img && typeof img === 'object' && img.src) {
                    processedImages.push(img.src);
                }
            });
        }

        // Ensure stickers data format is correct
        const processedStickers = {};
        for (const canvas in currentCardData.stickers) {
            processedStickers[canvas] = currentCardData.stickers[canvas] || [];
        }

        // Prepare draft data
        const draftData = {
            name: draftName,
            cardIndex: currentCardData.cardIndex,
            cardType: currentCardData.cardType,
            images: processedImages,
            activeTexts: currentCardData.activeTexts,
            stickers: processedStickers
        };

        console.log("Saving draft data:", draftData);

        try {
            const API_URL = "https://charlie-card-backend-fbbe5a6118ba.herokuapp.com";

            // Key change: Create a new draft each time when saving, no longer update existing drafts
            const response = await fetch(`${API_URL}/api/drafts`, {
                method: 'POST', // Always use POST to create new drafts
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(draftData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save draft');
            }

            const savedDraft = await response.json();

            // Update draftId in sessionStorage
            sessionStorage.setItem('draftId', savedDraft._id);

            console.log("Draft saved:", savedDraft);
            alert('Draft saved successfully!');
            draftDialog.remove();

        } catch (error) {
            console.error('Error saving draft:', error);
            alert(`Failed to save draft: ${error.message}`);
            draftDialog.remove();
        }
    });
}


// Add to basket
function addToBasket() {
    // Save the current card data to sessionStorage or send it to the server
    sessionStorage.setItem('currentCardData', JSON.stringify(currentCardData));
    alert('Card added to basket!');
}

async function buyNow() {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        alert('You must be logged in to purchase a card.');
        window.location.href = '/login.html';
        return;
    }

    try {
        const API_URL = "https://charlie-card-backend-fbbe5a6118ba.herokuapp.com";

        const finalCanvas = document.createElement('canvas');
        const ctx = finalCanvas.getContext('2d');

        // Set canvas size
        if (currentCardData.cardType === 'eCard') {
            finalCanvas.width = 567 * 2;
            finalCanvas.height = 794;
        } else {
            finalCanvas.width = 567 * 2;
            finalCanvas.height = 794 * 2;
        }

        // Ensure all canvases are properly rendered before capturing them
        await ensureAllTabsRendered();

        // Capture each canvas as an image
        const frontCanvas = await createSecureCanvasCopy('front-canvas');
        const innerRightCanvas = await createSecureCanvasCopy('inner-right-canvas');
        const backCanvas = await createSecureCanvasCopy('back-canvas');
        const innerLeftCanvas = await createSecureCanvasCopy('inner-left-canvas');

        // Composite the canvases onto the final canvas
        if (currentCardData.cardType === 'eCard') {
            ctx.drawImage(frontCanvas, 0, 0);
            ctx.drawImage(innerRightCanvas, 567, 0);
        } else {
            ctx.drawImage(frontCanvas, 0, 0);
            ctx.drawImage(backCanvas, 567, 0);
            ctx.drawImage(innerLeftCanvas, 0, 794);
            ctx.drawImage(innerRightCanvas, 567, 794);
        }

        // Convert canvas to Blob
        const imageBlob = await new Promise(resolve => finalCanvas.toBlob(resolve, 'image/png'));

        // Create FormData
        const formData = new FormData();
        formData.append('type', currentCardData.cardType);
        formData.append('imageData', imageBlob, 'card.png');

        // Make purchase request
        const purchaseResponse = await fetch(`${API_URL}/api/cardPurchase/purchase`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData
        });

        if (purchaseResponse.status === 401) {
            localStorage.removeItem('authToken');
            alert('Your session has expired. Please login again.');
            window.location.href = '/login.html';
            return;
        }

        if (!purchaseResponse.ok) {
            const errorData = await purchaseResponse.json();
            throw new Error(errorData.message || 'Purchase failed');
        }

        // Convert canvas to PDF if it's a printable
        if (currentCardData.cardType === 'printable') {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ unit: 'px', format: [finalCanvas.width, finalCanvas.height] });

            // Draw the first page (Front & Back)
            pdf.addImage(finalCanvas.toDataURL('image/png'), 'PNG', 0, 0, finalCanvas.width, finalCanvas.height);
            
            // Create the second page (Inner Left & Inner Right)
            pdf.addPage();
            const innerCanvas = document.createElement('canvas');
            innerCanvas.width = finalCanvas.width;
            innerCanvas.height = finalCanvas.height;
            const innerCtx = innerCanvas.getContext('2d');

            innerCtx.drawImage(innerLeftCanvas, 0, 0);
            innerCtx.drawImage(innerRightCanvas, 567, 0);

            pdf.addImage(innerCanvas.toDataURL('image/png'), 'PNG', 0, 0, finalCanvas.width, finalCanvas.height);

            pdf.save(`${currentCardData.cardType}-${Date.now()}.pdf`);
        } else {
            // Save as PNG for eCards
            const dataUrl = finalCanvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.href = dataUrl;
            downloadLink.download = `${currentCardData.cardType}-${Date.now()}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }

        alert('Purchase successful! Your card has been downloaded.');

    } catch (error) {
        console.error('Purchase error:', error);
        if (error.message.includes('Insufficient balance')) {
            alert('Insufficient credits. Please add more credits to your account.');
        } else {
            alert('Purchase failed. Please try again.');
        }
    }
}


// Function to switch tabs, render stickers, and ensure all canvases are updated
async function ensureAllTabsRendered() {
    const tabIds = ['front-tab', 'inner-left-tab', 'inner-right-tab', 'back-tab'];
    for (let tabId of tabIds) {
        const tabElement = document.getElementById(tabId);
        if (tabElement) {
            tabElement.click(); // Simulate tab switch
            await new Promise(resolve => setTimeout(resolve, 500)); // Allow time for stickers to render
        }
    }
}

// Helper function to create secure canvas copies 
async function createSecureCanvasCopy(sourceId) {
    const sourceCanvas = document.getElementById(sourceId);
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = sourceCanvas.width;
    tempCanvas.height = sourceCanvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    try {
        // Fill background with white
        tempCtx.fillStyle = '#ffffff';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // Draw the background image
        const imgData = currentCardData.images[canvasIds.indexOf(sourceId)];
        if (imgData) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            await new Promise((resolve, reject) => {
                img.onload = () => {
                    tempCtx.drawImage(img, imgData.x, imgData.y, imgData.width, imgData.height);
                    resolve();
                };
                img.onerror = reject;
                img.src = `${imgData.src}?t=${new Date().getTime()}`;
            });
        }

        // Draw text
        const canvasType = sourceId.replace('-canvas', '');
        const texts = currentCardData.activeTexts[canvasType] || [];
        texts.forEach(text => {
            tempCtx.font = `${text.fontStyle} ${text.fontWeight} ${text.fontSize}px ${text.fontFamily}`;
            tempCtx.fillStyle = text.color;
            tempCtx.textAlign = 'center';
            tempCtx.fillText(text.text, text.x, text.y);
        });

        // Draw stickers from saved data
        const stickers = currentCardData.stickers[canvasType] || [];

        await Promise.all(stickers.map(sticker => new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
            // Adjust for correct placement
            const adjustedX = sticker.x * (tempCanvas.width / 567) - 205;
            const adjustedY = sticker.y * (tempCanvas.height / 794) + 100;
            const adjustedWidth = sticker.width * (tempCanvas.width / 567) * 1.5;
            const adjustedHeight = sticker.height * (tempCanvas.height / 794) * 1.5;

                tempCtx.drawImage(img, adjustedX, adjustedY, adjustedWidth, adjustedHeight);
                resolve();
            };
            img.onerror = (err) => {
                console.error("Sticker load error:", err, "Source:", img.src);
                reject(err);
            };
            img.src = `${sticker.src}?t=${new Date().getTime()}`;
        })));

        return tempCanvas; // Return the processed canvas

    } catch (error) {
        console.error(`Error in createSecureCanvasCopy for ${sourceId}:`, error);
        throw error;
    }
}


function createPreviewImage() {
    const finalCanvas = document.createElement('canvas');
    const ctx = finalCanvas.getContext('2d');
    
    try {
        if (currentCardData.cardType === 'eCard') {
            finalCanvas.width = 567 * 2;
            finalCanvas.height = 794;
            
            // Use a clean canvas for each panel
            const frontCanvas = document.createElement('canvas');
            const innerRightCanvas = document.createElement('canvas');
            frontCanvas.width = innerRightCanvas.width = 567;
            frontCanvas.height = innerRightCanvas.height = 794;
            
            // Copy the content from the original canvases
            frontCanvas.getContext('2d').drawImage(document.getElementById('front-canvas'), 0, 0);
            innerRightCanvas.getContext('2d').drawImage(document.getElementById('inner-right-canvas'), 0, 0);
            
            // Draw to final canvas
            ctx.drawImage(frontCanvas, 0, 0);
            ctx.drawImage(innerRightCanvas, 567, 0);
        } else {
            finalCanvas.width = 567 * 2;
            finalCanvas.height = 794 * 2;
            
            // Use clean canvases for each panel
            const panels = ['front', 'inner-left', 'inner-right', 'back'].map(id => {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = 567;
                tempCanvas.height = 794;
                tempCanvas.getContext('2d').drawImage(document.getElementById(`${id}-canvas`), 0, 0);
                return tempCanvas;
            });
            
            // Draw to final canvas
            ctx.drawImage(panels[0], 0, 0); // front
            ctx.drawImage(panels[1], 567, 0); // inner-left
            ctx.drawImage(panels[2], 0, 794); // inner-right
            ctx.drawImage(panels[3], 567, 794); // back
        }
        
        return finalCanvas.toDataURL('image/png');
    } catch (error) {
        console.error('Error creating preview:', error);
        alert('Unable to create preview. Please try again.');
        return null;
    }
}

// Canvas keydown event to handle text input
document.addEventListener('keydown', (e) => {
    if (currentCardData.activeTextIndex !== -1) {
        const text = currentCardData.activeTexts[currentCardData.activeCanvas][currentCardData.activeTextIndex];
        if (e.key === 'Backspace') {
            text.text = text.text.slice(0, -1);
        } else if (e.key.length === 1) {
            text.text += e.key;
        }
        redrawText(`${currentCardData.activeCanvas}-canvas`);
        showTextBox(`${currentCardData.activeCanvas}-canvas`);
    }
});

// Add event listener to deselect text when clicking outside
document.addEventListener('click', (e) => {
    const canvasIds = ['front-canvas', 'inner-left-canvas', 'inner-right-canvas', 'back-canvas'];
    const clickedInsideCanvas = canvasIds.some(id => document.getElementById(id).contains(e.target));
    
    if (!clickedInsideCanvas) {
        currentCardData.activeTextIndex = -1;
        textBoxIds.forEach(id => document.getElementById(id).style.display = 'none');
        cursorIds.forEach(id => document.getElementById(id).style.display = 'none');
    }
});

// Add these new functions
function initializeStickerDragAndDrop() {
    const stickerOptions = document.querySelectorAll('.sticker-option');
    const canvasContainers = document.querySelectorAll('.canvas-container');

    stickerOptions.forEach(sticker => {
        sticker.addEventListener('dragstart', handleStickerDragStart);
    });

    canvasContainers.forEach(container => {
        container.addEventListener('dragover', handleStickerDragOver);
        container.addEventListener('drop', handleStickerDrop);
    });
}

function handleStickerDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.src);
}

function handleStickerDragOver(e) {
    e.preventDefault();
}

// Update handleStickerDrop to use larger base size
function handleStickerDrop(e) {
    e.preventDefault();
    const container = e.currentTarget;
    const stickerSrc = e.dataTransfer.getData('text/plain');
    const canvasId = container.querySelector('canvas').id;
    const canvasType = canvasId.replace('-canvas', '');
    const canvas = document.getElementById(canvasId);

    // Calculate position relative to canvas container
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Create and load sticker image
    const tempImg = new Image();
    tempImg.crossOrigin = "anonymous"; // Add this line for CORS
    tempImg.onload = () => {
        const aspectRatio = tempImg.width / tempImg.height;
        const baseSize = 150; // Increased base size for stickers
        
        const sticker = document.createElement('img');
        sticker.src = stickerSrc;
        sticker.classList.add('placed-sticker');
        
        // Set size maintaining aspect ratio
        let stickerWidth, stickerHeight;
        if (aspectRatio > 1) {
            stickerWidth = baseSize;
            stickerHeight = baseSize / aspectRatio;
        } else {
            stickerHeight = baseSize;
            stickerWidth = baseSize * aspectRatio;
        }
        
        sticker.style.width = `${stickerWidth}px`;
        sticker.style.height = `${stickerHeight}px`;
        
        // Center sticker on drop position
        const stickerX = x - stickerWidth/2;
        const stickerY = y - stickerHeight/2;
        
        sticker.style.left = `${stickerX}px`;
        sticker.style.top = `${stickerY}px`;
        
        makeStickerDraggable(sticker);
        container.appendChild(sticker);
        
        // Save sticker data
        currentCardData.stickers[canvasType].push({
            src: stickerSrc,
            x: x - stickerWidth / 2,
            y: y - stickerHeight / 2,
            width: stickerWidth,
            height: stickerHeight
        });        
    };
    tempImg.src = stickerSrc;
}

function makeStickerDraggable(sticker) {
    let isDragging = false;
    let initialX;
    let initialY;

    function handleMouseDown(e) {
        isDragging = true;
        initialX = e.clientX - sticker.offsetLeft;
        initialY = e.clientY - sticker.offsetTop;
        sticker.classList.add('dragging');
    }

    function handleMouseMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        
        const currentX = e.clientX - initialX;
        const currentY = e.clientY - initialY;
        
        const container = sticker.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        // Check if sticker is outside container bounds
        if (currentX < -25 || currentY < -25 || 
            currentX > containerRect.width - 25 || 
            currentY > containerRect.height - 25) {
            // Remove sticker if dragged outside
            removeSticker(sticker);
            return;
        }
        
        // Constrain movement within container
        const boundedX = Math.max(0, Math.min(currentX, containerRect.width - sticker.offsetWidth));
        const boundedY = Math.max(0, Math.min(currentY, containerRect.height - sticker.offsetHeight));
        
        sticker.style.left = `${boundedX}px`;
        sticker.style.top = `${boundedY}px`;
    }

    function removeSticker(sticker) {
        const container = sticker.parentElement;
        const canvasType = container.querySelector('canvas').id.replace('-canvas', '');
        const stickerIndex = Array.from(container.querySelectorAll('.placed-sticker')).indexOf(sticker);
        
        // Remove from currentCardData
        if (stickerIndex !== -1) {
            currentCardData.stickers[canvasType].splice(stickerIndex, 1);
        }
        
        // Clean up event listeners
        if (sticker.cleanup) sticker.cleanup();
        
        // Remove the element
        sticker.remove();
        isDragging = false;
    }

    function handleMouseUp() {
        if (isDragging) {
            isDragging = false;
            sticker.classList.remove('dragging');
            
            // Update sticker position in currentCardData
            const container = sticker.parentElement;
            const canvasType = container.querySelector('canvas').id.replace('-canvas', '');
            const stickerIndex = Array.from(container.querySelectorAll('.placed-sticker')).indexOf(sticker);
            
            if (stickerIndex !== -1 && currentCardData.stickers[canvasType][stickerIndex]) {
                currentCardData.stickers[canvasType][stickerIndex].x = parseInt(sticker.style.left);
                currentCardData.stickers[canvasType][stickerIndex].y = parseInt(sticker.style.top);
            }
        }
    }

    // Remove any existing listeners before adding new ones
    sticker.removeEventListener('mousedown', handleMouseDown);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    // Add the new listeners
    sticker.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Add cleanup for when sticker is removed
    sticker.cleanup = () => {
        sticker.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };
}

// Add CSS for dragging state
const style = document.createElement('style');
style.textContent = `
    .placed-sticker.dragging {
        opacity: 0.8;
        pointer-events: none;
    }
`;
document.head.appendChild(style);

// Add new function to update UI based on selected text
function updateUIFromText(text) {
    // Update currentCardData properties
    currentCardData.fontSize = text.fontSize;
    currentCardData.fontFamily = text.fontFamily;
    currentCardData.fontColor = text.color;
    currentCardData.fontStyle = text.fontStyle;
    currentCardData.fontWeight = text.fontWeight;
    currentCardData.textDecoration = text.textDecoration;

    // Update font style dropdown
    document.getElementById('fontStyleSelect').value = text.fontFamily;

    // Update text style buttons
    document.getElementById('boldBtn').classList.toggle('selected', text.fontWeight === 'bold');
    document.getElementById('italicBtn').classList.toggle('selected', text.fontStyle === 'italic');
    document.getElementById('underlineBtn').classList.toggle('selected', text.textDecoration === 'underline');

    // Update color buttons
    const colorButtons = ['white', 'black', 'red', 'blue', 'green'];
    colorButtons.forEach(color => {
        const button = document.getElementById(`${color}Btn`);
        if (button) {
            button.classList.toggle('selected', text.color === color);
            if (text.color === color) {
                button.style.border = '3px solid rgb(232, 70, 130)';
            } else {
                button.style.border = 'none';
            }
        }
    });
}

// Get and display user's draft list
async function loadUserDrafts() {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        alert('You must be logged in to view drafts.');
        return;
    }

    try {
        const API_URL = "https://charlie-card-backend-fbbe5a6118ba.herokuapp.com";
        const response = await fetch(`${API_URL}/api/drafts`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load drafts');
        }

        const drafts = await response.json();
        console.log("Retrieved drafts count:", drafts.length);

        // Create drafts list dialog
        const draftsDialog = document.createElement('div');
        draftsDialog.classList.add('drafts-dialog');
        draftsDialog.style.position = 'fixed';
        draftsDialog.style.top = '0';
        draftsDialog.style.left = '0';
        draftsDialog.style.width = '100%';
        draftsDialog.style.height = '100%';
        draftsDialog.style.backgroundColor = 'rgba(0,0,0,0.5)';
        draftsDialog.style.display = 'flex';
        draftsDialog.style.justifyContent = 'center';
        draftsDialog.style.alignItems = 'center';
        draftsDialog.style.zIndex = '1000';

        let draftsHTML = `
            <div style="background-color: white; border-radius: 5px; width: 80%; max-width: 600px; max-height: 80vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background-color: #e8468a; color: white;">
                    <h5 style="margin: 0;">Your Drafts</h5>
                    <button type="button" style="background: none; border: none; color: white; font-size: 1.5rem;" id="closeDraftsDialog">×</button>
                </div>
                <div style="padding: 15px;">
        `;

        if (!drafts || drafts.length === 0) {
            draftsHTML += `<p>You don't have any saved drafts yet.</p>`;
        } else {
            draftsHTML += `<ul style="list-style: none; padding: 0;">`;
            drafts.forEach(draft => {
                const date = new Date(draft.updatedAt).toLocaleDateString();
                draftsHTML += `
                    <li style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee;" data-draft-id="${draft._id}" data-card-index="${draft.cardIndex}" data-card-type="${draft.cardType}">
                        <div>
                            <span style="font-weight: bold;">${draft.name}</span>
                            <br>
                            <small style="color: #666;">Last updated: ${date}</small>
                        </div>
                        <div>
                            <button class="load-draft-btn" style="margin-right: 5px; padding: 5px 10px; background-color: #28a745; color: white; border: none; border-radius: 3px;">Edit</button>
                            <button class="delete-draft-btn" style="padding: 5px 10px; background-color: #dc3545; color: white; border: none; border-radius: 3px;">Delete</button>
                        </div>
                    </li>
                `;
            });
            draftsHTML += `</ul>`;
        }

        draftsHTML += `</div></div>`;
        draftsDialog.innerHTML = draftsHTML;

        document.body.appendChild(draftsDialog);

        // Handle closing dialog
        document.getElementById('closeDraftsDialog').addEventListener('click', () => {
            draftsDialog.remove();
        });

        // Handle loading drafts
        const loadButtons = document.querySelectorAll('.load-draft-btn');
        loadButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const listItem = e.target.closest('li');
                const draftId = listItem.dataset.draftId;
                const cardIndex = listItem.dataset.cardIndex;
                const cardType = listItem.dataset.cardType;

                // Close dialog
                draftsDialog.remove();

                // Use new loading method
                window.location.href = `/editor.html?card=${cardIndex}&type=${cardType}&draft=${draftId}`;
            });
        });

        // Handle deleting drafts
        const deleteButtons = document.querySelectorAll('.delete-draft-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                if (confirm('Are you sure you want to delete this draft?')) {
                    const draftItem = e.target.closest('li');
                    const draftId = draftItem.dataset.draftId;

                    try {
                        const deleteResponse = await fetch(`${API_URL}/api/drafts/${draftId}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${authToken}`
                            }
                        });

                        if (!deleteResponse.ok) {
                            throw new Error('Failed to delete draft');
                        }

                        // Remove deleted draft entry
                        draftItem.remove();

                        // If no more drafts, update list display
                        if (document.querySelectorAll('[data-draft-id]').length === 0) {
                            document.querySelector('.drafts-dialog > div > div:last-child').innerHTML = `<p>You don't have any saved drafts yet.</p>`;
                        }

                    } catch (error) {
                        console.error('Error deleting draft:', error);
                        alert('Failed to delete draft. Please try again.');
                    }
                }
            });
        });

    } catch (error) {
        console.error('Error loading drafts:', error);
        alert('Failed to load drafts. Please try again.');
    }
}
