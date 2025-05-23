import config from "./config.js"

const API_URL = config.API_URL

// Fetches total number of available cards from the server
// Returns 0 if fetch fails to prevent errors
async function getNumberOfCards() {
    try {
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

// Generates an array of random unique card indices
// maxNumber: total cards available, count: number of cards to select
function getRandomCards(maxNumber, count = 3) {
    const numbers = Array.from({ length: maxNumber }, (_, i) => i + 1);
    const shuffled = numbers.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Loads and displays random featured cards on the homepage
// Creates card elements with images, titles and shop links
async function loadFeaturedCards() {
    const container = document.querySelector('.featured-cards .row');
    
    try {
        const numCards = await getNumberOfCards();
        if (numCards === 0) return;

        const randomIndexes = getRandomCards(numCards);
        container.innerHTML = ''; // Clear existing cards

        const cardTitles = [
            'Birthday Card',
            'Holiday Greetings',
            'Thank You Card',
            'Celebration Card',
            'Seasonal Greetings',
            'Special Occasion'
        ];

        randomIndexes.forEach((index, i) => {
            const card = document.createElement('div');
            card.className = 'col-md-4';
            card.innerHTML = `
                <div class="card shadow">
                    <div class="card-image-container">
                        <img src="${API_URL}/assets/templates/card-${index}/Front.png" 
                             class="card-img-top" 
                             alt="Card ${index}">
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${cardTitles[i % cardTitles.length]}</h5>
                        <p class="card-text">Send the perfect personalised card via email or print it at home.</p>
                        <a href="shop.html" class="btn btn-outline-success">Shop Now</a>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading featured cards:', error);
    }
}

// Initialize featured cards display when page loads
window.addEventListener('load', loadFeaturedCards);
