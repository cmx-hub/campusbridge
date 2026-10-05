// CampusBridge website interactions

const contactForm = document.querySelector(".contact-form");
const formMessage = document.querySelector(".form-message");

if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        formMessage.textContent =
            "Thank you! Your message has been received. We'll get back to you soon.";

        contactForm.reset();
    });
}


// Smooth navigation for internal links

document.querySelectorAll('a[href^="#"]').forEach(function (link) {

    link.addEventListener("click", function (event) {

        const targetId = this.getAttribute("href");

        if (targetId === "#") {
            return;
        }

        const target = document.querySelector(targetId);

        if (target) {
            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth"
            });
        }

    });

});
