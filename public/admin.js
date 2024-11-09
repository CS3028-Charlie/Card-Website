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

    // prevent form submission if files are not .png .jpg or .jpeg
    const allowedFiletypes = ["png", "jpg", "jpeg"]
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

    const API_URL = "http://localhost:3000"

    fetch(`${API_URL}/upload_card`, {
        method: "POST",
        body: formData
    })
    .then((res) => console.log(res))
    .catch((err) => console.log("Error occured", err));
}
