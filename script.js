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
           Real CampusBridge backend verification
           ----------------------------------------- */

        fetch(
            "https://campusbridge-backend-production-4b21.up.railway.app/api/verify",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    url: sourceUrl,
                    organization: sourceName
                })
            }
        )
        .then(async response => {

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error ||
                    "Verification request failed."
                );
            }

            return result;

        })
        .then(result => {

            const progress =
                panel.querySelector(
                    ".verification-progress p"
                );

            const results =
                panel.querySelectorAll(
                    ".verification-result"
                );

            if (progress) {

                progress.textContent =
                    `Verification complete. Risk level: ${
                        result.risk_level || "UNKNOWN"
                    }.`;

            }

            if (results[0]) {

                const verified =
                    result.source_verified === true;

                results[0].classList.remove(
                    "pending",
                    "available",
                    "review"
                );

                results[0].classList.add(
                    verified
                        ? "available"
                        : "review"
                );

                results[0].querySelector(
                    ".result-icon"
                ).textContent =
                    verified ? "✓" : "⚠";

                results[0].querySelector(
                    "small"
                ).textContent =
                    verified
                        ? "The domain matches a known official source."
                        : "The domain could not be confirmed as an official source.";

            }

            if (results[1]) {

                const secure =
                    result.https === true;

                results[1].classList.remove(
                    "pending",
                    "available",
                    "review"
                );

                results[1].classList.add(
                    secure
                        ? "available"
                        : "review"
                );

                results[1].querySelector(
                    ".result-icon"
                ).textContent =
                    secure ? "✓" : "⚠";

                results[1].querySelector(
                    "small"
                ).textContent =
                    secure
                        ? "HTTPS is enabled for the source."
                        : "The source does not use HTTPS.";

            }

            if (results[2]) {

                const riskLevel =
                    String(
                        result.risk_level || "UNKNOWN"
                    ).toUpperCase();

                const lowRisk =
                    riskLevel === "LOW";

                results[2].classList.remove(
                    "pending",
                    "available",
                    "review"
                );

                results[2].classList.add(
                    lowRisk
                        ? "available"
                        : "review"
                );

                results[2].querySelector(
                    ".result-icon"
                ).textContent =
                    lowRisk ? "✓" : "⚠";

                results[2].querySelector(
                    "small"
                ).textContent =
                    `Risk score: ${
                        result.risk_score ?? "N/A"
                    }/100 (${riskLevel}).`;

            }

            const note =
                panel.querySelector(
                    ".verification-note p"
                );

            if (note) {

                const findings =
                    Array.isArray(result.findings)
                        ? result.findings
                        : [];

                note.textContent =
                    findings.length
                        ? findings.slice(0, 4).join(" ")
                        : "Verification completed without additional findings.";

            }

        })
        .catch(error => {

            const progress =
                panel.querySelector(
                    ".verification-progress p"
                );

            const results =
                panel.querySelectorAll(
                    ".verification-result"
                );

            const note =
                panel.querySelector(
                    ".verification-note p"
                );

            if (progress) {

                progress.textContent =
                    "Verification could not be completed.";

            }

            if (note) {

                note.textContent =
                    error.message ||
                    "The CampusBridge verification service is currently unavailable.";

            }

            results.forEach(result => {

                result.classList.remove(
                    "pending",
                    "available"
                );

                result.classList.add("review");

                const icon =
                    result.querySelector(".result-icon");

                if (icon) {
                    icon.textContent = "⚠";
                }

            });

        });


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
