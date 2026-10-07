const API_BASE = "https://campusbridge-backend-production-4b21.up.railway.app";

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    loginMessage.textContent = "Signing in...";

    try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            loginMessage.textContent =
                data.error || "Login failed. Please check your details.";
            return;
        }

        localStorage.setItem("campusbridge_token", data.token);
        localStorage.setItem("campusbridge_user", JSON.stringify(data.user));

        window.location.href = "student-dashboard.html";

    } catch (error) {
        console.error("Login error:", error);
        loginMessage.textContent =
            "Unable to connect to CampusBridge. Please try again.";
    }
});
