const API_BASE = "https://campusbridge-backend-production-4b21.up.railway.app";

const TOKEN = localStorage.getItem("campusbridge_token");
const USER = JSON.parse(localStorage.getItem("campusbridge_user") || "null");

if (!TOKEN || !USER) {
    window.location.href = "login.html";
}

const STUDENT_ID = USER.id;

const AUTH_HEADERS = {
    "Authorization": `Bearer ${TOKEN}`
};

async function loadProfile() {
    const loading = document.getElementById("profile-loading");
    const content = document.getElementById("profile-content");
    const error = document.getElementById("profile-error");

    try {
        const response = await fetch(
            `${API_BASE}/api/students/${STUDENT_ID}/profile`,
            {
                headers: AUTH_HEADERS
            }
        );

        const data = await response.json();

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("campusbridge_token");
            localStorage.removeItem("campusbridge_user");
            window.location.href = "login.html";
            return;
        }

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
            `${API_BASE}/api/students/${STUDENT_ID}/applications`,
            {
                headers: AUTH_HEADERS
            }
        );

        const data = await response.json();

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("campusbridge_token");
            localStorage.removeItem("campusbridge_user");
            window.location.href = "login.html";
            return;
        }

        if (!response.ok) {
            throw new Error(data.error || "Unable to load applications.");
        }

        document.getElementById("application-count").textContent = data.count;
        document.getElementById("dashboard-application-summary").textContent = data.count;

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


async function loadSavedOpportunities() {
    const loading = document.getElementById("saved-opportunities-loading");
    const content = document.getElementById("saved-opportunities-content");
    const error = document.getElementById("saved-opportunities-error");
    const list = document.getElementById("saved-opportunities-list");

    try {
        const response = await fetch(
            `${API_BASE}/api/students/${STUDENT_ID}/saved-opportunities`,
            { headers: AUTH_HEADERS }
        );

        const data = await response.json();

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("campusbridge_token");
            localStorage.removeItem("campusbridge_user");
            window.location.href = "login.html";
            return;
        }

        if (!response.ok) {
            throw new Error(data.error || "Unable to load saved opportunities.");
        }

        document.getElementById("saved-opportunities-count").textContent = data.count;

        if (!data.saved_opportunities.length) {
            list.textContent = "You have not saved any opportunities yet.";
        } else {
            list.replaceChildren();

            data.saved_opportunities.forEach(opportunity => {
                const item = document.createElement("div");
                item.className = "application-item";

                const heading = document.createElement("h3");
                heading.textContent = opportunity.title || "Untitled opportunity";
                item.appendChild(heading);

                const organization = document.createElement("p");
                organization.textContent = `Organization: ${opportunity.organization || "Not specified"}`;
                item.appendChild(organization);

                const category = document.createElement("p");
                category.textContent = `Category: ${opportunity.category || "Not specified"}`;
                item.appendChild(category);

                if (opportunity.source_url) {
                    const link = document.createElement("a");
                    link.href = opportunity.source_url;
                    link.target = "_blank";
                    link.rel = "noopener noreferrer";
                    link.textContent = "View official source";
                    item.appendChild(link);
                }

                list.appendChild(item);
            });
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
loadSavedOpportunities();
