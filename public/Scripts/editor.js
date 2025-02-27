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
    textDecoration: 'none'
};

// DOM Elements
const canvasIds = ['front-canvas', 'inner-left-canvas', 'inner-right-canvas', 'back-canvas'];
const textBoxIds = ['front-text-box', 'inner-left-text-box', 'inner-right-text-box', 'back-text-box'];
const cursorIds = ['front-cursor', 'inner-left-cursor', 'inner-right-cursor', 'back-cursor'];

// Initialize the editor on window load
window.onload = function() {
    loadCardData();
    setupCanvases();
    setupEventListeners();
    updateCardTypeView();
};

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
    const targetBackImage = "Images/background.png";
    const folderIndex = `card-${cardIndex + 1}`;
    
    const images = [];
    
    positions.forEach(position => {
        if (position === "Back") {
            images.push(targetBackImage);
        } else {
            images.push(`${API_URL}/assets/templates/${folderIndex}/${position}.png`);
        }
    });
    
    currentCardData.images = images;
    
    // Start loading images into canvases
    loadImagesIntoCanvases();
}

// Load images into canvases
function loadImagesIntoCanvases() {
    canvasIds.forEach((canvasId, index) => {
        if (index < currentCardData.images.length) {
            const canvas = document.getElementById(canvasId);
            const ctx = canvas.getContext('2d');
            
            // Store canvas and context references
            currentCardData.canvases[canvasId] = canvas;
            currentCardData.contexts[canvasId] = ctx;
            
            // Load the image
            const img = new Image();
            img.onload = function() {
                // Clear canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Draw image centered and scaled to fit canvas
                const scale = Math.min(
                    canvas.width / img.width,
                    canvas.height / img.height
                );
                
                const x = (canvas.width - img.width * scale) / 2;
                const y = (canvas.height - img.height * scale) / 2;
                
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                
                // Redraw any existing text
                redrawText(canvasId);
            };
            img.src = currentCardData.images[index];
        }
    });
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
    document.getElementById('downloadCanvasBtn').addEventListener('click', downloadCanvas);
    
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
    console.log('Adding text to canvas type:', activeCanvas);
    console.log('Canvas ID:', canvasId);
    
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error('Canvas element not found:', canvasId);
        return;
    }
    
    // Ensure the text array exists
    if (!currentCardData.activeTexts[activeCanvas]) {
        currentCardData.activeTexts[activeCanvas] = [];
    }
    
    const newText = {
        text: 'Click to edit',
        x: canvas.width / 2,
        y: canvas.height / 2,
        fontSize: currentCardData.fontSize,
        fontFamily: currentCardData.fontFamily,
        color: currentCardData.fontColor,
        fontStyle: currentCardData.fontStyle,
        fontWeight: currentCardData.fontWeight,
        textDecoration: currentCardData.textDecoration
    };
    
    currentCardData.activeTexts[activeCanvas].push(newText);
    currentCardData.activeTextIndex = currentCardData.activeTexts[activeCanvas].length - 1;
    
    console.log('Text array for canvas:', currentCardData.activeTexts[activeCanvas]);
    
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

// Redraw text on canvas
function redrawText(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error('Canvas not found for redraw:', canvasId);
        return;
    }
    
    // Fix canvas type detection
    let canvasType = canvasId.includes('inner-') ? 
        canvasId.replace('-canvas', '') : 
        canvasId.split('-')[0];
    
    console.log('Redrawing canvas type:', canvasType);
    console.log('Active texts for canvas:', currentCardData.activeTexts[canvasType]);
    
    // Create an off-screen canvas for double buffering
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;
    const offscreenCtx = offscreenCanvas.getContext('2d');
    
    // Get the texts for this canvas
    const texts = currentCardData.activeTexts[canvasType] || [];
    
    // Draw background image
    const img = new Image();
    img.src = currentCardData.images[canvasIds.indexOf(canvasId)];
    
    img.onload = function() {
        // Draw to offscreen canvas first
        const scale = Math.min(
            canvas.width / img.width,
            canvas.height / img.height
        );
        
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;
        
        offscreenCtx.drawImage(img, x, y, img.width * scale, img.height * scale);
        
        // Draw all texts
        texts.forEach(text => {
            offscreenCtx.font = `${text.fontStyle} ${text.fontWeight} ${text.fontSize}px ${text.fontFamily}`;
            offscreenCtx.fillStyle = text.color;
            offscreenCtx.textAlign = 'center';
            
            console.log('Drawing text:', text.text, 'at:', text.x, text.y);
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
    };
}

// Show text box around selected text
function showTextBox(canvasId) {
    // Extract the correct canvas type that matches our DOM IDs
    const canvasType = canvasId.includes('inner-') ? 
        canvasId.replace('-canvas', '') : 
        canvasId.split('-')[0];
    
    const textIndex = currentCardData.activeTextIndex;
    
    console.log('Showing text box for:', canvasType, 'index:', textIndex);
    
    // Get DOM elements using correct IDs
    const textBoxId = `${canvasType}-text-box`;
    const cursorId = `${canvasType}-cursor`;
    
    const textBox = document.getElementById(textBoxId);
    const cursor = document.getElementById(cursorId);
    
    if (!textBox || !cursor) {
        console.error('Text box or cursor elements not found:', textBoxId, cursorId);
        return;
    }
    
    // Get the text array for this canvas type
    if (!currentCardData.activeTexts[canvasType]) {
        currentCardData.activeTexts[canvasType] = [];
        return;
    }
    
    if (textIndex === -1 || !currentCardData.activeTexts[canvasType][textIndex]) {
        textBox.style.display = 'none';
        cursor.style.display = 'none';
        return;
    }
    
    const text = currentCardData.activeTexts[canvasType][textIndex];
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    
    // Measure text dimensions
    ctx.font = `${text.fontStyle} ${text.fontWeight} ${text.fontSize}px ${text.fontFamily}`;
    const textMetrics = ctx.measureText(text.text);
    const textWidth = textMetrics.width;
    const textHeight = parseInt(text.fontSize);
    
    // Calculate position relative to canvas
    const canvasRect = canvas.getBoundingClientRect();
    const scale = canvas.width / canvasRect.width;
    
    // Position the text box
    textBox.style.display = 'block';
    
    // Calculate exact positions
    const textBoxLeft = canvasRect.left + (text.x / scale) - (textWidth / 2);
    const textBoxTop = canvasRect.top + (text.y / scale) - textHeight + 3;
    
    textBox.style.left = `${textBoxLeft}px`;
    textBox.style.top = `${textBoxTop}px`;
    textBox.style.width = `${textWidth}px`;
    textBox.style.height = `${textHeight}px`;
    
    // Position cursor
    cursor.style.display = 'block';
    cursor.style.left = `${textBoxLeft + textWidth}px`;
    cursor.style.top = `${textBoxTop}px`;
    cursor.style.height = `${textHeight}px`;
}

// Handle canvas click for text selection
function handleCanvasClick(e, canvasId) {
    const canvas = document.getElementById(canvasId);
    // Fix canvas type detection for inner pages
    const canvasType = canvasId.includes('inner-') ? 
        canvasId.replace('-canvas', '') : 
        canvasId.split('-')[0];
    
    console.log('Handling click for canvas type:', canvasType);
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Check if click is on a text
    const texts = currentCardData.activeTexts[canvasType] || [];
    console.log('Active texts for this canvas:', texts);
    
    let clickedTextIndex = -1;
    
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
    
    // Update selection
    currentCardData.activeTextIndex = clickedTextIndex;
    currentCardData.activeCanvas = canvasType;
    
    console.log('Selected text index:', clickedTextIndex);
    console.log('Active canvas:', currentCardData.activeCanvas);
    
    if (clickedTextIndex !== -1) {
        const selectedText = texts[clickedTextIndex];
        selectedText.dragStartX = x - selectedText.x;
        selectedText.dragStartY = y - selectedText.y;
        
        canvas.addEventListener('mousedown', startDragging);
        showTextBox(canvasId);
    } else {
        // Hide text box and cursor
        const textBox = document.getElementById(`${canvasType}-text-box`);
        const cursor = document.getElementById(`${canvasType}-cursor`);
        
        if (textBox) textBox.style.display = 'none';
        if (cursor) cursor.style.display = 'none';
    }
}

// Start dragging
function startDragging(e) {
    const canvas = e.target;
    
    // Only proceed if we have a text selected
    if (currentCardData.activeTextIndex === -1) return;
    
    function dragMove(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        const text = currentCardData.activeTexts[currentCardData.activeCanvas][currentCardData.activeTextIndex];
        text.x = x - text.dragStartX;
        text.y = y - text.dragStartY;
        
        redrawText(canvas.id);
        showTextBox(canvas.id);
    }
    
    function dragEnd() {
        document.removeEventListener('mousemove', dragMove);
        document.removeEventListener('mouseup', dragEnd);
    }
    
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragEnd);
}

// Toggle bold text
function toggleBold() {
    currentCardData.fontWeight = currentCardData.fontWeight === 'bold' ? 'normal' : 'bold';
    if (currentCardData.activeTextIndex !== -1) {
        const text = currentCardData.activeTexts[currentCardData.activeCanvas][currentCardData.activeTextIndex];
        text.fontWeight = currentCardData.fontWeight;
        redrawText(`${currentCardData.activeCanvas}-canvas`);
        showTextBox(`${currentCardData.activeCanvas}-canvas`);
    }
}

// Toggle italic text
function toggleItalic() {
    currentCardData.fontStyle = currentCardData.fontStyle === 'italic' ? 'normal' : 'italic';
    if (currentCardData.activeTextIndex !== -1) {
        const text = currentCardData.activeTexts[currentCardData.activeCanvas][currentCardData.activeTextIndex];
        text.fontStyle = currentCardData.fontStyle;
        redrawText(`${currentCardData.activeCanvas}-canvas`);
        showTextBox(`${currentCardData.activeCanvas}-canvas`);
    }
}

// Toggle underline text
function toggleUnderline() {
    currentCardData.textDecoration = currentCardData.textDecoration === 'underline' ? 'none' : 'underline';
    if (currentCardData.activeTextIndex !== -1) {
        const text = currentCardData.activeTexts[currentCardData.activeCanvas][currentCardData.activeTextIndex];
        text.textDecoration = currentCardData.textDecoration;
        redrawText(`${currentCardData.activeCanvas}-canvas`);
        showTextBox(`${currentCardData.activeCanvas}-canvas`);
    }
}

// Increase font size
function increaseFontSize() {
    currentCardData.fontSize += 5;
    if (currentCardData.activeTextIndex !== -1) {
        const text = currentCardData.activeTexts[currentCardData.activeCanvas][currentCardData.activeTextIndex];
        text.fontSize = currentCardData.fontSize;
        redrawText(`${currentCardData.activeCanvas}-canvas`);
        showTextBox(`${currentCardData.activeCanvas}-canvas`);
    }
}

// Decrease font size
function decreaseFontSize() {
    currentCardData.fontSize = Math.max(5, currentCardData.fontSize - 5);
    if (currentCardData.activeTextIndex !== -1) {
        const text = currentCardData.activeTexts[currentCardData.activeCanvas][currentCardData.activeTextIndex];
        text.fontSize = currentCardData.fontSize;
        redrawText(`${currentCardData.activeCanvas}-canvas`);
        showTextBox(`${currentCardData.activeCanvas}-canvas`);
    }
}

// Change font style
function changeFontStyle(e) {
    currentCardData.fontFamily = e.target.value;
    if (currentCardData.activeTextIndex !== -1) {
        const text = currentCardData.activeTexts[currentCardData.activeCanvas][currentCardData.activeTextIndex];
        text.fontFamily = currentCardData.fontFamily;
        redrawText(`${currentCardData.activeCanvas}-canvas`);
        showTextBox(`${currentCardData.activeCanvas}-canvas`);
    }
}

// Set text color
function setTextColor(color) {
    currentCardData.fontColor = color;
    if (currentCardData.activeTextIndex !== -1) {
        const text = currentCardData.activeTexts[currentCardData.activeCanvas][currentCardData.activeTextIndex];
        text.color = currentCardData.fontColor;
        redrawText(`${currentCardData.activeCanvas}-canvas`);
        showTextBox(`${currentCardData.activeCanvas}-canvas`);
    }
}

// Save customization
function saveCustomization() {
    // Save the current card data to sessionStorage or send it to the server
    sessionStorage.setItem('currentCardData', JSON.stringify(currentCardData));
    alert('Customization saved!');
}

// Add to basket
function addToBasket() {
    // Save the current card data to sessionStorage or send it to the server
    sessionStorage.setItem('currentCardData', JSON.stringify(currentCardData));
    alert('Card added to basket!');
}

// Download canvas as PNG
function downloadCanvas() {
    const canvas = document.getElementById(`${currentCardData.activeCanvas}-canvas`);
    const link = document.createElement('a');
    link.download = 'card.png';
    link.href = canvas.toDataURL();
    link.click();
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