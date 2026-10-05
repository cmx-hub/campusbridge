document.addEventListener("DOMContentLoaded", () => {

const searchInput = document.querySelector(".search-box input");
const filterButtons = document.querySelectorAll(".filter");
const opportunityCards = document.querySelectorAll(".listing-card");

let currentFilter = "all";

function filterOpportunities() {

    const searchTerm = searchInput.value.toLowerCase().trim();

    opportunityCards.forEach(card => {

        const cardText = card.textContent.toLowerCase();

        const categoryElement = card.querySelector(".listing-category");

        const category = categoryElement
            ? categoryElement.textContent.toLowerCase()
            : "";

        const matchesSearch = cardText.includes(searchTerm);

        let matchesFilter = true;

        if (currentFilter !== "all") {
            matchesFilter = category.includes(currentFilter);
        }

        if (matchesSearch && matchesFilter) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }

    });
}


// SEARCH
if (searchInput) {
    searchInput.addEventListener("input", filterOpportunities);
}


// CATEGORY FILTERS
filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        const buttonText = button.textContent.toLowerCase();

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

}

});
