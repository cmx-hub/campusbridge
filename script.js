document.addEventListener("DOMContentLoaded", () => {

    const searchInput = document.querySelector(".search-box input");
    const filterButtons = document.querySelectorAll(".filter");
    const opportunityCards = document.querySelectorAll(".listing-card");
    const emptyState = document.querySelector(".opportunity-empty-state");

    let currentFilter = "all";


    /* =========================================
       OPPORTUNITY SEARCH + FILTERING
       ========================================= */

    function filterOpportunities() {

        const searchTerm = searchInput
            ? searchInput.value.toLowerCase().trim()
            : "";

        let visibleCount = 0;

        opportunityCards.forEach(card => {

            const cardText = card.textContent.toLowerCase();

            const categoryElement =
                card.querySelector(".listing-category");

            const category = categoryElement
                ? categoryElement.textContent.toLowerCase()
                : "";

            const matchesSearch =
                cardText.includes(searchTerm);

            let matchesFilter = true;

            if (currentFilter !== "all") {
                matchesFilter =
                    category.includes(currentFilter);
            }

            if (matchesSearch && matchesFilter) {
                card.style.display = "";
                visibleCount++;
            } else {
                card.style.display = "none";
            }

        });

        if (emptyState) {
            emptyState.hidden = visibleCount !== 0;
        }

    }


    /* =========================================
       SEARCH
       ========================================= */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterOpportunities
        );

    }


    /* =========================================
       CATEGORY FILTERS
       ========================================= */

    filterButtons.forEach(button => {

        button.addEventListener("click", () => {

            filterButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            const buttonText =
                button.textContent.toLowerCase();

            if (buttonText.includes("scholarship")) {

                currentFilter = "scholarship";

            } else if (buttonText.includes("internship")) {

                currentFilter = "internship";

            } else if (buttonText.includes("competition")) {

                currentFilter = "competition";

            } else if (buttonText.includes("training")) {

                currentFilter = "training";

            } else {

                currentFilter = "all";

            }

            filterOpportunities();

        });

    });


    /* =========================================
       SOURCE VERIFICATION
       ========================================= */

    const verifyButtons =
        document.querySelectorAll(".verify-button");


    verifyButtons.forEach(button => {

        button.addEventListener("click", () => {

            const sourceUrl =
                button.getAttribute("data-source");

            const card =
                button.closest(".listing-card");

            if (!card || !sourceUrl) {
                return;
            }


            const titleElement =
                card.querySelector("h2");

            const sourceElement =
                card.querySelector(".source small");

            const title =
                titleElement
                    ? titleElement.textContent.trim()
                    : "This opportunity";

            const sourceName =
                sourceElement
                    ? sourceElement.textContent.trim()
                    : "Provided source";


            showVerificationPanel(
                title,
                sourceName,
                sourceUrl
            );

        });

    });


    /* =========================================
       VERIFICATION PANEL
       ========================================= */

    function showVerificationPanel(
        title,
        sourceName,
        sourceUrl
    ) {

        // Remove an existing panel first
        const existingPanel =
            document.querySelector(".verification-modal");

        if (existingPanel) {
            existingPanel.remove();
        }


        // Create overlay
        const overlay =
            document.createElement("div");

        overlay.className =
            "verification-modal";


        // Create verification box
        const panel =
            document.createElement("div");

        panel.className =
            "verification-panel";


        panel.innerHTML = `

            <button
                type="button"
                class="verification-close"
                aria-label="Close verification">
                ×
            </button>

            <div class="verification-header">

                <span class="verification-shield">
                    🛡️
                </span>

                <div>

                    <span class="verification-label">
                        SOURCE VERIFICATION
                    </span>

                    <h2>
                        Checking opportunity
                    </h2>

                </div>

            </div>


            <div class="verification-opportunity">

                <strong>
                    ${escapeHTML(title)}
                </strong>

                <span>
                    Listed source:
                    ${escapeHTML(sourceName)}
                </span>

            </div>


            <div class="verification-progress">

                <div class="verification-spinner">
                    🔎
                </div>

                <p>
                    Preparing source verification...
                </p>

            </div>


            <div class="verification-results">

                <div class="verification-result pending">

                    <span class="result-icon">
                        ⏳
                    </span>

                    <div>

                        <strong>
                            Official source
                        </strong>

                        <small>
                            Checking the supplied source link...
                        </small>

                    </div>

                </div>


                <div class="verification-result pending">

                    <span class="result-icon">
                        ⏳
                    </span>

                    <div>

                        <strong>
                            Source information
                        </strong>

                        <small>
                            Checking the information provided by CampusBridge...
                        </small>

                    </div>

                </div>


                <div class="verification-result pending">

                    <span class="result-icon">
                        ⏳
                    </span>

                    <div>

                        <strong>
                            Independent verification
                        </strong>

                        <small>
                            External sources require backend/API verification.
                        </small>

                    </div>

                </div>

            </div>


            <div class="verification-source">

                <span>
                    Source URL
                </span>

                <a
                    href="${escapeAttribute(sourceUrl)}"
                    target="_blank"
                    rel="noopener noreferrer">
                    ${escapeHTML(sourceUrl)}
                </a>

            </div>


            <div class="verification-note">

                <strong>
                    Verification notice
                </strong>

                <p>
                    CampusBridge has a source link for this opportunity.
                    This browser prototype does not yet independently verify
                    Google, Facebook, LinkedIn or other external sources.
                </p>

            </div>


            <div class="verification-actions">

                <a
                    href="${escapeAttribute(sourceUrl)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="listing-button">
                    Open Source →
                </a>

                <button
                    type="button"
                    class="verification-done">
                    Done
                </button>

            </div>

        `;


        overlay.appendChild(panel);

        document.body.appendChild(overlay);


        /* -----------------------------------------
           Simulated local verification process
           ----------------------------------------- */

        setTimeout(() => {

            const progress =
                panel.querySelector(
                    ".verification-progress p"
                );

            if (progress) {

                progress.textContent =
                    "Source link found. Review the official page before applying.";

            }


            const results =
                panel.querySelectorAll(
                    ".verification-result"
                );


            if (results[0]) {

                results[0].classList.remove("pending");
                results[0].classList.add("available");

                results[0].querySelector(
                    ".result-icon"
                ).textContent = "✓";

                results[0].querySelector(
                    "small"
                ).textContent =
                    "A source link has been provided.";

            }


            if (results[1]) {

                results[1].classList.remove("pending");
                results[1].classList.add("available");

                results[1].querySelector(
                    ".result-icon"
                ).textContent = "✓";

                results[1].querySelector(
                    "small"
                ).textContent =
                    "The listing contains source information.";

            }


            if (results[2]) {

                results[2].classList.remove("pending");
                results[2].classList.add("review");

                results[2].querySelector(
                    ".result-icon"
                ).textContent = "⚠";

                results[2].querySelector(
                    "small"
                ).textContent =
                    "Independent cross-platform verification is not available in this frontend yet.";

            }

        }, 1200);


        /* -----------------------------------------
           Close buttons
           ----------------------------------------- */

        const closeButton =
            panel.querySelector(
                ".verification-close"
            );

        const doneButton =
            panel.querySelector(
                ".verification-done"
            );


        closeButton.addEventListener(
            "click",
            () => overlay.remove()
        );


        doneButton.addEventListener(
            "click",
            () => overlay.remove()
        );


        overlay.addEventListener(
            "click",
            event => {

                if (event.target === overlay) {
                    overlay.remove();
                }

            }
        );

    }


    /* =========================================
       SECURITY HELPERS
       Prevent opportunity titles/source URLs
       from being interpreted as HTML.
       ========================================= */

    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function escapeAttribute(value) {

        return escapeHTML(value);

    }
    /* =========================================
       CAMPUSBRIDGE BACKEND CONNECTION
       ========================================= */

    const BACKEND_URL =
        "http://192.168.211.128:5000";

    async function checkBackendConnection() {

        try {

            const response =
                await fetch(`${BACKEND_URL}/api/health`);

            if (!response.ok) {
                throw new Error("Backend unavailable");
            }

            const data =
                await response.json();

            console.log(
                "CampusBridge Backend:",
                data.message
            );

        } catch (error) {

            console.warn(
                "CampusBridge Backend is currently unavailable."
            );

        }

    }

    checkBackendConnection();

});

/* =========================================
   OPPORTUNITY DETAILS NAVIGATION
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const opportunityCards =
        document.querySelectorAll(".opportunity-clickable");

    opportunityCards.forEach(card => {

        card.addEventListener("click", event => {

            if (event.target.closest("a, button")) {
                return;
            }

            const detailsUrl =
                card.dataset.detailsUrl;

            if (detailsUrl) {
                window.location.href = detailsUrl;
            }

        });

    });

});
