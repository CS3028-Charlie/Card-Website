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

function getRandomCards(maxNumber, count = 3) {
    const numbers = Array.from({ length: maxNumber }, (_, i) => i + 1);
    const shuffled = numbers.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

async function loadFeaturedCards() {
    const API_URL = "https://charlie-card-backend-fbbe5a6118ba.herokuapp.com";
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

// Load featured cards when the page loads
window.addEventListener('load', loadFeaturedCards);
