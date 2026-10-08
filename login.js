const API_BASE = "https://campusbridge-backend-production-4b21.up.railway.app";

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

const loginMessage = document.getElementById("login-message");
const registerMessage = document.getElementById("register-message");

const authTitle = document.getElementById("auth-title");
const authDescription = document.getElementById("auth-description");

const authSwitchText = document.getElementById("auth-switch-text");
const authSwitchButton = document.getElementById("auth-switch-button");
const forgotPasswordButton = document.getElementById("forgot-password-button");
const backToLoginButton = document.getElementById("back-to-login-button");
const forgotPasswordForm = document.getElementById("forgot-password-form");

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

forgotPasswordButton.addEventListener("click", () => {
    loginForm.style.display = "none";
    registerForm.style.display = "none";
    forgotPasswordForm.style.display = "flex";

    authTitle.textContent = "Reset your password";
    authDescription.textContent =
        "Enter your CampusBridge email to receive a recovery code.";
});

backToLoginButton.addEventListener("click", () => {
    forgotPasswordForm.style.display = "none";
    registerForm.style.display = "none";
    loginForm.style.display = "flex";

    authTitle.textContent = "Sign in";
    authDescription.textContent =
        "Access your CampusBridge student dashboard.";
});

forgotPasswordForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("forgot-email").value.trim();
    const message = document.getElementById("forgot-password-message");

    message.textContent = "Sending recovery code...";

    try {
        const response = await fetch(
            `${API_BASE}/api/auth/request-password-reset`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            message.textContent =
                result.error || "Unable to request password reset.";
            return;
        }

        document.getElementById("password-reset-fields").style.display =
            "block";

        if (result.development_code) {
            message.textContent =
                `Recovery code: ${result.development_code} (expires in ${result.expires_in_minutes} minutes)`;
        } else {
            message.textContent =
                result.message ||
                "If an account exists for this email, a recovery code will be sent.";
        }
    } catch (error) {
        console.error("Password reset request error:", error);
        message.textContent =
            "Unable to connect to CampusBridge. Please try again.";
    }
});

const resetPasswordButton = document.getElementById("reset-password-button");

resetPasswordButton.addEventListener("click", async () => {
    const email = document.getElementById("forgot-email").value.trim();
    const recoveryCode = document.getElementById("recovery-code").value.trim();
    const newPassword = document.getElementById("new-password").value;
    const message = document.getElementById("forgot-password-message");

    if (!recoveryCode || !newPassword) {
        message.textContent =
            "Enter the recovery code and your new password.";
        return;
    }

    message.textContent = "Resetting password...";

    try {
        const response = await fetch(
            `${API_BASE}/api/auth/reset-password`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    recovery_code: recoveryCode,
                    new_password: newPassword
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            message.textContent =
                result.error || "Unable to reset password.";
            return;
        }

        message.textContent =
            "Password reset successfully. You can now sign in.";

        document.getElementById("password-reset-fields").style.display =
            "none";

        document.getElementById("forgot-password-form").reset();

        setTimeout(() => {
            forgotPasswordForm.style.display = "none";
            registerForm.style.display = "none";
            loginForm.style.display = "flex";

            authTitle.textContent = "Sign in";
            authDescription.textContent =
                "Access your CampusBridge student dashboard.";
        }, 1500);
    } catch (error) {
        console.error("Password reset error:", error);
        message.textContent =
            "Unable to connect to CampusBridge. Please try again.";
    }
});

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

    const legalConsent = document.getElementById("register-legal-consent");
    if (!legalConsent || !legalConsent.checked) {
        registerMessage.textContent =
            "Please agree to the Privacy Policy and Terms of Use before creating an account.";
        return;
    }


    const name =
        document.getElementById("register-name").value.trim();

    const email =
        document.getElementById("register-email").value.trim();

    const password =
        document.getElementById("register-password").value;

    const institution =
        document.getElementById("register-institution").value.trim();

    const fieldOfStudy =
        document.getElementById("register-field-of-study").value.trim();

    const level =
        document.getElementById("register-level").value.trim();

    const skills =
        document.getElementById("register-skills").value.trim();

    const interests =
        document.getElementById("register-interests").value.trim();

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
                    password,
                    institution,
                    field_of_study: fieldOfStudy,
                    level,
                    skills,
                    interests
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

const passwordToggles =
    document.querySelectorAll(".password-toggle");

passwordToggles.forEach(toggle => {

    toggle.addEventListener("click", () => {

        const targetId =
            toggle.dataset.target;

        const passwordInput =
            document.getElementById(targetId);

        if (!passwordInput) {
            return;
        }

        const isVisible =
            passwordInput.type === "text";

        passwordInput.type =
            isVisible ? "password" : "text";

        toggle.setAttribute(
            "aria-label",
            isVisible
                ? "Show password"
                : "Hide password"
        );

    });

});
