/* ================================================================
   COFFEE FILTER

   This is the only JavaScript feature in the project for now.
   It compares the clicked button's data-filter value with each coffee
   card's data-roast value, then hides cards that do not match.
   ================================================================ */

// Find all filter buttons, all coffee cards, and the visible-count text.
const filterButtons = document.querySelectorAll(".filter-button");
const coffeeCards = document.querySelectorAll(".full-product-grid .product-card");
const productCount = document.querySelector("#product-count");

// Give every filter button the same click behaviour.
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Example values: "all", "light", "medium", or "dark".
    const selectedRoast = button.dataset.filter;
    let visibleCoffees = 0;

    // First remove the active style from every button.
    filterButtons.forEach((filterButton) => {
      filterButton.classList.remove("active");
      filterButton.setAttribute("aria-pressed", "false");
    });

    // Then show which button was clicked.
    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");

    coffeeCards.forEach((card) => {
      // "All" displays every card; other buttons need an exact match.
      const shouldShow =
        selectedRoast === "all" || card.dataset.roast === selectedRoast;

      card.hidden = !shouldShow;

      if (shouldShow) {
        visibleCoffees += 1;
      }
    });

    // Keep the result count accurate and use the correct singular/plural word.
    const coffeeWord = visibleCoffees === 1 ? "coffee" : "coffees";
    productCount.textContent = `${visibleCoffees} ${coffeeWord}`;
  });
});
