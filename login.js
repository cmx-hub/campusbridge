const API_BASE = "https://campusbridge-backend-production-4b21.up.railway.app";

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

const loginMessage = document.getElementById("login-message");
const registerMessage = document.getElementById("register-message");

const authTitle = document.getElementById("auth-title");
const authDescription = document.getElementById("auth-description");

const authSwitchText = document.getElementById("auth-switch-text");
const authSwitchButton = document.getElementById("auth-switch-button");

function showLoginForm() {

    loginForm.style.display = "";
    registerForm.style.display = "none";

    authTitle.textContent = "Sign in";

    authDescription.textContent =
        "Access your CampusBridge student dashboard.";

    authSwitchText.textContent =
        "Don't have a CampusBridge account?";

    authSwitchButton.textContent =
        "Create an account";

    registerMessage.textContent = "";
}

function showRegisterForm() {

    loginForm.style.display = "none";
    registerForm.style.display = "";

    authTitle.textContent = "Create your account";

    authDescription.textContent =
        "Join CampusBridge to discover and manage opportunities.";

    authSwitchText.textContent =
        "Already have a CampusBridge account?";

    authSwitchButton.textContent =
        "Sign in";

    loginMessage.textContent = "";
}

authSwitchButton.addEventListener("click", () => {

    if (registerForm.style.display === "none") {
        showRegisterForm();
    } else {
        showLoginForm();
    }

});

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    loginMessage.textContent = "Signing in...";

    try {

        const response = await fetch(
            `${API_BASE}/api/auth/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            loginMessage.textContent =
                data.error ||
                "Login failed. Please check your details.";

            return;
        }

        localStorage.setItem(
            "campusbridge_token",
            data.token
        );

        localStorage.setItem(
            "campusbridge_user",
            JSON.stringify(data.user)
        );

        window.location.href =
            "student-dashboard.html";

    } catch (error) {

        console.error("Login error:", error);

        loginMessage.textContent =
            "Unable to connect to CampusBridge. Please try again.";

    }

});

registerForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const name =
        document.getElementById("register-name").value.trim();

    const email =
        document.getElementById("register-email").value.trim();

    const password =
        document.getElementById("register-password").value;

    registerMessage.textContent =
        "Creating your account...";

    try {

        const response = await fetch(
            `${API_BASE}/api/auth/register`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            registerMessage.textContent =
                data.error ||
                "Unable to create your account.";

            return;
        }

        registerMessage.textContent =
            "Account created successfully. You can now sign in.";

        registerForm.reset();

        setTimeout(() => {
            showLoginForm();
        }, 1200);

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        registerMessage.textContent =
            "Unable to connect to CampusBridge. Please try again.";

    }

});
