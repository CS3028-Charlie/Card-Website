import config from "./config.js"

const API_URL = config.API_URL

// image upload validation
document.getElementById("uploadForm").addEventListener("submit", function (event) {
    const fileInput = document.getElementById("cardImages");
    const fileArray = [...fileInput.files];

    const countFeedback = document.getElementById("countFeedback");
    const labelFeedback = document.getElementById("labelFeedback");

    let valid = true;

    countFeedback.style.display = "none";
    filetypeFeedback.style.display = "none"
    labelFeedback.style.display = "none";

    // prevent form submission if 4 files not uploaded
    if (fileArray.length != 4) {
        countFeedback.style.display = "inline-block";
        valid = false;
    }

    // prevent form submission if files are not .png
    const allowedFiletypes = ["png"]
    if (!fileArray.every(e => allowedFiletypes.includes(e.name.split(".")[1].toLowerCase()))) {
        filetypeFeedback.style.display = "inline-block"
        valid = false;
    }

    // prevent form submission if file names are not labelled correctly
    const requiredLabels = ["Front", "Back", "Inner-Left", "Inner-Right"];
    if (!fileArray.every(e => requiredLabels.includes(e.name.split(".")[0]))) {
        labelFeedback.style.display = "inline-block";
        valid = false;
    }

    if (valid) {
        let title = document.getElementById("cardTitle").value

        uploadCard(title, fileArray);
        event.preventDefault();
    } else {
        event.preventDefault();
    }
});

// card upload
function uploadCard(title, files) {
    const form = document.getElementById("uploadForm");
    const formData = new FormData();

    formData.append("title", title)
    
    files.forEach(f => {
        formData.append("images", f)
    });

    fetch(`${API_URL}/upload_card`, {
        method: "POST",
        body: formData
    })
        .then((res) => {
            if (res.status == 200) {
                displayCardPreviews();
            }
        })
        .catch((err) => console.log("Error occured", err));
}

// card retrieval
async function fetchCardsPreview() {
    const response = await fetch(`${API_URL}/get_card_previews`)
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`)
    }
    const json = await response.json()

    return json.cards
}

// card display
function displayCardPreviews() {
    fetchCardsPreview()
    .then(cards => {
        const cardList = document.getElementById("cardList");
        cardList.innerHTML = '';

        cards.forEach(card => {
            // Create card item container
            const cardItem = document.createElement('div');
            cardItem.classList.add('card-item');

            // create card item sections
            const section1 = document.createElement("div")
            section1.classList.add("card-section1")
            cardItem.appendChild(section1)

            const section2 = document.createElement("div")
            section2.classList.add("card-section2")
            cardItem.appendChild(section2)

            // Create and append card images 
            const images = ["Front.png", "Inner-Left.png", "Inner-Right.png", "Back.png"]
            images.forEach(i => {
                let element = document.createElement("img")
                element.src = `${API_URL}/assets/templates/${card}/${i}`;
                section2.appendChild(element)
            })

            const cardInfo = document.createElement("div")

            // Create and append card title
            const cardTitle = document.createElement("h2");
            cardTitle.textContent = card;
            section1.appendChild(cardTitle);

            // Create and append delete button
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', function() {
                deleteCard(card, cardItem);
            });
            section1.appendChild(deleteButton)

            // Append the card item to the card list
            cardList.appendChild(cardItem);
        });
    })
}

function deleteCard(card, element) {
    if (!window.confirm(`Are you sure you want to delete ${card}?`)) { return }

    fetch(`${API_URL}/delete_card`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ card : card })
    })
        .then(res => {
            if (res.status == 200) {
                element.remove()
            } else {
                alert(`Failed to remove ${card}`)
            }
        })
}

async function verifyAdmin() {
    try {
        const response = await fetch(`${API_URL}/api/auth/user`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : `Bearer ${localStorage.getItem("authToken")}`
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.message); // Show error from backend
            window.location.href = '/'
            return;
        }

        let user = await response.json()

        if (user.role == "admin") {
            return
        } else {
            window.alert("Insufficient permissions to access this page")
            window.location.href = '/'
        }

    } catch (error) {
        window.alert(error.message)
        window.location.href = '/'
    }
}

window.onload = () => {
    // check user credentials, redirect if not admin
    verifyAdmin();

    // load
    displayCardPreviews()
}