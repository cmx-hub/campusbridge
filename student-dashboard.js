const API_BASE = "http://127.0.0.1:5000";
const STUDENT_ID = 2;

async function loadProfile() {
    const loading = document.getElementById("profile-loading");
    const content = document.getElementById("profile-content");
    const error = document.getElementById("profile-error");

    try {
        const response = await fetch(
            `${API_BASE}/api/students/${STUDENT_ID}/profile`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to load profile.");
        }

        document.getElementById("student-name").textContent = data.user.name;
        document.getElementById("student-email").textContent = data.user.email;
        document.getElementById("student-institution").textContent =
            data.profile.institution || "Not provided";
        document.getElementById("student-field").textContent =
            data.profile.field_of_study || "Not provided";
        document.getElementById("student-level").textContent =
            data.profile.level || "Not provided";
        document.getElementById("student-skills").textContent =
            data.profile.skills || "Not provided";
        document.getElementById("student-interests").textContent =
            data.profile.interests || "Not provided";

        loading.hidden = true;
        content.hidden = false;
    } catch (errorMessage) {
        loading.hidden = true;
        error.textContent = errorMessage.message;
        error.hidden = false;
    }
}

async function loadApplications() {
    const loading = document.getElementById("applications-loading");
    const content = document.getElementById("applications-content");
    const error = document.getElementById("applications-error");
    const list = document.getElementById("applications-list");

    try {
        const response = await fetch(
            `${API_BASE}/api/students/${STUDENT_ID}/applications`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to load applications.");
        }

        document.getElementById("application-count").textContent = data.count;

        if (data.applications.length === 0) {
            list.innerHTML = "<p>No applications submitted yet.</p>";
        } else {
            list.innerHTML = data.applications.map(application => `
                <div class="application-item">
                    <h3>${application.opportunity_title}</h3>
                    <p><strong>Organization:</strong> ${application.organization}</p>
                    <p><strong>Status:</strong> ${application.status}</p>
                    <p><strong>Applied:</strong> ${application.applied_at}</p>
                    <p><strong>Notes:</strong> ${application.notes || "None"}</p>
                </div>
            `).join("");
        }

        loading.hidden = true;
        content.hidden = false;
    } catch (errorMessage) {
        loading.hidden = true;
        error.textContent = errorMessage.message;
        error.hidden = false;
    }
}

loadProfile();
loadApplications();
