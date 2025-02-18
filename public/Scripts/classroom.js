document.addEventListener("DOMContentLoaded", async () => {
    const authToken = localStorage.getItem("authToken");
    const role = localStorage.getItem("role");

    // Restrict access to teachers only
    if (!authToken || role !== "teacher") {
        alert("Access denied. Only teachers can view this page.");
        window.location.href = "index.html"; // Redirect non-teachers
        return;
    }

    document.getElementById("teacherWelcome").textContent = `Welcome, ${localStorage.getItem("username")}`;

    // Fetch student list
    await loadStudents();

    // Event listener for adding a student
    document.getElementById("addStudentButton").addEventListener("click", addStudentToClass);

    // Event listener for adding credits to selected students
    document.getElementById("addCreditsButton").addEventListener("click", addCreditsToSelected);
});

// Fetch students in the teacher's class
async function loadStudents() {
    const authToken = localStorage.getItem("authToken");
    try {
        const response = await fetch("https://charlie-card-backend-fbbe5a6118ba.herokuapp.com/api/classroom/students", {
            method: "GET",
            headers: { "Authorization": `Bearer ${authToken}` }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch students");
        }

        const students = await response.json();
        const tableBody = document.getElementById("studentTableBody");
        tableBody.innerHTML = ""; // Clear table

        students.forEach(student => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><input type="checkbox" class="studentCheckbox" data-email="${student.email}"></td>
                <td>${student.username}</td>
                <td>${student.email}</td>
                <td>${student.balance} Credits</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading students:", error);
    }
}

// Add a student to the class
async function addStudentToClass() {
    const studentEmail = document.getElementById("studentEmail").value.trim();
    const authToken = localStorage.getItem("authToken");

    if (!studentEmail) {
        document.getElementById("addStudentStatus").textContent = "Please enter a valid student email.";
        return;
    }

    try {
        const response = await fetch("https://charlie-card-backend-fbbe5a6118ba.herokuapp.com/api/classroom/add-student", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ email: studentEmail })
        });

        const data = await response.json();
        document.getElementById("addStudentStatus").textContent = data.message;

        if (response.ok) {
            await loadStudents(); // Refresh list
        }
    } catch (error) {
        console.error("Error adding student:", error);
        document.getElementById("addStudentStatus").textContent = "Error adding student.";
    }
}

// Add 100 credits to selected students
async function addCreditsToSelected() {
    const authToken = localStorage.getItem("authToken");
    const selectedStudents = [...document.querySelectorAll(".studentCheckbox:checked")].map(cb => cb.dataset.email);

    if (selectedStudents.length === 0) {
        document.getElementById("creditStatus").textContent = "No students selected.";
        return;
    }

    try {
        const response = await fetch("https://charlie-card-backend-fbbe5a6118ba.herokuapp.com/api/classroom/add-credits", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ emails: selectedStudents, amount: 100 })
        });

        const data = await response.json();
        document.getElementById("creditStatus").textContent = data.message;

        if (response.ok) {
            await loadStudents(); // Refresh balance display
        }
    } catch (error) {
        console.error("Error adding credits:", error);
        document.getElementById("creditStatus").textContent = "Error adding credits.";
    }
}

async function removeSelectedStudents() {
    const authToken = localStorage.getItem("authToken");
    const selectedStudents = [...document.querySelectorAll(".studentCheckbox:checked")].map(cb => cb.dataset.email);

    if (selectedStudents.length === 0) {
        document.getElementById("removeStudentStatus").textContent = "No students selected.";
        return;
    }

    if (!confirm(`Are you sure you want to remove ${selectedStudents.length} students?`)) return;

    try {
        const response = await fetch("https://charlie-card-backend-fbbe5a6118ba.herokuapp.com/api/classroom/remove-students", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ emails: selectedStudents })
        });

        const data = await response.json();
        document.getElementById("removeStudentStatus").textContent = data.message;

        if (response.ok) await loadStudents();
    } catch (error) {
        console.error("Error removing students:", error);
        document.getElementById("removeStudentStatus").textContent = "Error removing students.";
    }
}

function toggleSelectAll() {
    const checkboxes = document.querySelectorAll(".studentCheckbox");
    checkboxes.forEach(cb => cb.checked = document.getElementById("selectAll").checked);
}