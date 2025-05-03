import config from "./config.js"

const API_URL = config.API_URL

// Initial page load handler
// Verifies teacher credentials and sets up all necessary event listeners
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

    // Fetch student list and teacher balance
    await loadStudents();
    await fetchAndUpdateTeacherBalance();

    // Event listeners for various actions
    document.getElementById("addStudentButton").addEventListener("click", addStudentToClass);
    document.getElementById("addCreditsButton").addEventListener("click", addCreditsToSelected);
    document.getElementById("removeStudentsButton").addEventListener("click", removeSelectedStudents);
    document.getElementById("withdrawCreditsButton").addEventListener("click", withdrawCreditsFromSelected);
    document.getElementById("selectAll").addEventListener("change", toggleSelectAll);
});

// Fetches and displays all students assigned to current teacher
// Filters students by teacherId and creates table rows with checkboxes
async function loadStudents() {
    const authToken = localStorage.getItem("authToken");
    const teacherId = localStorage.getItem("teacherId");

    try {
        const response = await fetch(`${API_URL}/api/classroom/students`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${authToken}` }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch students");
        }

        const data = await response.json();

        const { students, teacherId: fetchedTeacherId } = data;

        if (!Array.isArray(students)) {
            throw new Error("Invalid students data");
        }

        // Filter students by teacherId
        const filteredStudents = students.filter(student => student.teacherId === fetchedTeacherId);

        const tableBody = document.getElementById("studentTableBody");
        tableBody.innerHTML = ""; // Clear table

        // Create interactive table rows for each student
        // Each row includes a checkbox for batch operations
        filteredStudents.forEach(student => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><input type="checkbox" class="studentCheckbox" data-email="${student.email}" data-username="${student.username}"></td>
                <td>${student.username}</td>
                <td>${student.email}</td>
                <td>${student.balance} Credits</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading students:", error);
        logNotification("Error loading students.");
    }
}

// Updates teacher's credit balance in UI
// Fetches current balance from server and formats it for display
async function fetchAndUpdateTeacherBalance() {
    const authToken = localStorage.getItem("authToken");

    try {
        const response = await fetch(`${API_URL}/api/auth/balance`, { 
            method: 'GET',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Failed to fetch balance:", errorData); // Debugging log
            throw new Error("Failed to fetch balance");
        }

        const data = await response.json();
        const balance = data.balance;

        document.getElementById("teacherBalance").textContent = `Credits: ${parseFloat(balance).toFixed(0)}`;
    } catch (error) {
        console.error("Error fetching balance:", error);
        document.getElementById("teacherBalance").textContent = "Error loading balance.";
    }
}

// Processes student addition to teacher's class
// Validates email and sends request to backend
async function addStudentToClass() {
    const studentEmail = document.getElementById("studentEmail").value.trim();
    const authToken = localStorage.getItem("authToken");
    const teacherId = localStorage.getItem("teacherId");

    if (!studentEmail) {
        logNotification("Please enter a valid student email.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/classroom/add-student`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ email: studentEmail, teacherId: teacherId })
        });

        const data = await response.json();
        logNotification(`${data.message} (Student: ${studentEmail}) at ${new Date().toLocaleString()}`, "addStudentStatus");

        if (response.ok) {
            await loadStudents(); // Refresh list
        }
    } catch (error) {
        console.error("Error adding student:", error);
        logNotification("Error adding student.", "addStudentStatus");
    }
}

// Bulk operation to add credits to selected students
// Awards 100 credits to each selected student
async function addCreditsToSelected() {
    const authToken = localStorage.getItem("authToken");
    const selectedStudents = [...document.querySelectorAll(".studentCheckbox:checked")].map(cb => cb.dataset.email);

    if (selectedStudents.length === 0) {
        logNotification("No students selected.", "creditStatus");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/classroom/add-credits`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ emails: selectedStudents, amount: 100 })
        });

        const data = await response.json();
        logNotification(`${data.message} (Students: ${selectedStudents.join(", ")}) at ${new Date().toLocaleString()}`, "creditStatus");

        if (response.ok) {
            await loadStudents(); // Refresh balance display
            await updateUserUI(); // Update user UI to reflect new balance
        }
    } catch (error) {
        console.error("Error adding credits:", error);
        logNotification("Error adding credits.", "creditStatus");
    }
}

// Bulk remove students from teacher's class
// Includes confirmation dialog before deletion
async function removeSelectedStudents() {
    const authToken = localStorage.getItem("authToken");
    const selectedStudents = [...document.querySelectorAll(".studentCheckbox:checked")].map(cb => cb.dataset.email);

    if (selectedStudents.length === 0) {
        logNotification("No students selected.", "removeStudentStatus");
        return;
    }

    if (!confirm(`Are you sure you want to remove ${selectedStudents.length} students?`)) return;

    try {
        const response = await fetch(`${API_URL}/api/classroom/remove-students`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ emails: selectedStudents })
        });

        const data = await response.json();
        logNotification(`${data.message} (Students: ${selectedStudents.join(", ")}) at ${new Date().toLocaleString()}`, "removeStudentStatus");

        if (response.ok) await loadStudents();
    } catch (error) {
        console.error("Error removing students:", error);
        logNotification("Error removing students.", "removeStudentStatus");
    }
}

// Bulk withdrawal of credits from selected students
// Updates both student and teacher balances after operation
async function withdrawCreditsFromSelected() {
    const authToken = localStorage.getItem("authToken");
    const selectedStudents = [...document.querySelectorAll(".studentCheckbox:checked")].map(cb => cb.dataset.email);

    if (selectedStudents.length === 0) {
        logNotification("No students selected.", "withdrawStatus");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/classroom/withdraw-credits`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ emails: selectedStudents })
        });

        const data = await response.json();
        logNotification(`${data.message} (Students: ${selectedStudents.join(", ")}) at ${new Date().toLocaleString()}`, "withdrawStatus");

        if (response.ok) {
            await loadStudents(); // Refresh balance display
            await updateUserUI(); // Update user UI to reflect new balance
            fetchAndUpdateTeacherBalance(); // Update teacher balance
        }
    } catch (error) {
        console.error("Error withdrawing credits:", error);
        logNotification("Error withdrawing credits.", "withdrawStatus");
    }
}

// Toggle select all checkboxes
function toggleSelectAll() {
    const checkboxes = document.querySelectorAll(".studentCheckbox");
    checkboxes.forEach(cb => cb.checked = document.getElementById("selectAll").checked);
}

// Utility function to display notifications
// Supports both general notifications and status-specific messages
function logNotification(message, statusId) {
    const notificationsPanel = document.getElementById("notificationsPanel");
    const notification = document.createElement("div");
    notification.className = "alert alert-info";
    notification.textContent = message;
    notificationsPanel.appendChild(notification);

    if (statusId) {
        const statusElement = document.getElementById(statusId);
        if (statusElement) {
            statusElement.textContent = message;
        }
    }
}

// Define updateUserUI function
async function updateUserUI() {
    // Implementation of updateUserUI
}

// Export functions for testing
module.exports = {
    loadStudents,
    addStudentToClass,
    addCreditsToSelected,
    removeSelectedStudents,
    withdrawCreditsFromSelected,
    fetchAndUpdateTeacherBalance
};