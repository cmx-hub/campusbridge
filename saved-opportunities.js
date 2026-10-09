(() => {
    const API = "https://campusbridge-backend-production-4b21.up.railway.app";
    const cards = document.querySelectorAll(".opportunity-clickable");
    const savedIds = new Set();

    function getSession() {
        try {
            return {
                token: localStorage.getItem("campusbridge_token"),
                user: JSON.parse(localStorage.getItem("campusbridge_user") || "null")
            };
        } catch {
            return { token: null, user: null };
        }
    }

    function normalizeUrl(value) {
        try {
            const url = new URL(value);
            url.hash = "";
            url.hostname = url.hostname.toLowerCase();
            if (url.pathname.length > 1) {
                url.pathname = url.pathname.replace(/\/+$/, "");
            }
            return url.href;
        } catch {
            return "";
        }
    }

    function sourceUrlFromCard(card) {
        try {
            const details = new URL(card.dataset.detailsUrl, window.location.href);
            return details.searchParams.get("sourceUrl") || "";
        } catch {
            return "";
        }
    }

    function showButtonState(button, isSaved) {
        button.textContent = isSaved ? "✓ Saved — Remove" : "☆ Save Opportunity";
        button.classList.toggle("is-saved", isSaved);
        button.setAttribute("aria-pressed", String(isSaved));
    }

    function redirectToLogin() {
        window.location.href = "login.html";
    }

    async function initialize() {
        let opportunities;

        try {
            const response = await fetch(`${API}/api/opportunities`);
            if (!response.ok) throw new Error("Could not load opportunity records.");
            opportunities = await response.json();
        } catch {
            console.error("Saved opportunities: backend records could not be loaded.");
            return;
        }

        const session = getSession();
        const headers = session.token
            ? { Authorization: `Bearer ${session.token}` }
            : {};

        if (session.token && session.user?.id != null) {
            try {
                const response = await fetch(
                    `${API}/api/students/${session.user.id}/saved-opportunities`,
                    { headers }
                );

                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem("campusbridge_token");
                    localStorage.removeItem("campusbridge_user");
                    redirectToLogin();
                    return;
                }

                if (!response.ok) throw new Error("Could not load saved records.");

                const data = await response.json();
                (data.saved_opportunities || []).forEach(item => {
                    savedIds.add(Number(item.id));
                });
            } catch (error) {
                console.error("Saved opportunities could not be loaded:", error);
                return;
            }
        }

        const bySource = new Map();
        opportunities.forEach(item => {
            const key = normalizeUrl(item.source_url || "");
            if (key && !bySource.has(key)) bySource.set(key, item);
        });

        cards.forEach(card => {
            const key = normalizeUrl(sourceUrlFromCard(card));
            const opportunity = bySource.get(key);
            const actions = card.querySelector(".listing-actions");

            if (!opportunity || !actions) {
                console.warn("Save button skipped: no matching database record.", key);
                return;
            }

            const button = document.createElement("button");
            button.type = "button";
            button.className = "verify-button save-opportunity-button";
            button.dataset.opportunityId = String(opportunity.id);
            showButtonState(button, savedIds.has(Number(opportunity.id)));

            button.addEventListener("click", async event => {
                event.preventDefault();
                event.stopPropagation();

                const current = getSession();
                if (!current.token || current.user?.id == null) {
                    redirectToLogin();
                    return;
                }

                if (button.disabled) return;
                button.disabled = true;

                try {
                    const id = Number(opportunity.id);
                    const isSaved = savedIds.has(id);
                    const url = isSaved
                        ? `${API}/api/students/${current.user.id}/saved-opportunities/${id}`
                        : `${API}/api/students/${current.user.id}/saved-opportunities`;

                    const response = await fetch(url, {
                        method: isSaved ? "DELETE" : "POST",
                        headers: {
                            ...headersFor(current.token),
                            ...(isSaved ? {} : { "Content-Type": "application/json" })
                        },
                        ...(isSaved ? {} : {
                            body: JSON.stringify({ opportunity_id: id })
                        })
                    });

                    if (response.status === 401 || response.status === 403) {
                        localStorage.removeItem("campusbridge_token");
                        localStorage.removeItem("campusbridge_user");
                        redirectToLogin();
                        return;
                    }

                    if (!response.ok) {
                        const result = await response.json().catch(() => ({}));
                        throw new Error(result.error || result.message || "Save action failed.");
                    }

                    if (isSaved) savedIds.delete(id);
                    else savedIds.add(id);

                    showButtonState(button, savedIds.has(id));
                } catch (error) {
                    alert(error.message || "Could not update saved opportunities. Please try again.");
                } finally {
                    button.disabled = false;
                }
            });

            actions.appendChild(button);
        });
    }

    function headersFor(token) {
        return { Authorization: `Bearer ${token}` };
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize);
    } else {
        initialize();
    }
})();
