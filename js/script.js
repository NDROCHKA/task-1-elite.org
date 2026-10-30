/* ================================================================
   EMBER & OAK — STORE INTERACTIONS

   The reference store includes a slideshow, search, product quick
   view, filters, reviews, and a cart drawer. This file recreates
   those useful features in a smaller, beginner-friendly way.
   ================================================================ */

const isInsidePagesFolder = window.location.pathname.includes("/pages/");
const productsPage = isInsidePagesFolder ? "products.html" : "pages/products.html";
const imagePath = (fileName) => `${isInsidePagesFolder ? "../" : ""}images/${fileName}`;

/* ----------------------------------------------------------------
   1. ROTATING ANNOUNCEMENT
   ---------------------------------------------------------------- */
const announcementMessages = [
  "Free delivery on orders over $45",
  "Exchange online purchases within 14 days",
  "Fresh coffee roasted every week in Beirut",
];
const announcementText = document.querySelector(".announcement-bar p");
let announcementIndex = 0;

if (announcementText) {
  window.setInterval(() => {
    announcementIndex = (announcementIndex + 1) % announcementMessages.length;
    announcementText.textContent = announcementMessages[announcementIndex];
  }, 4500);
}

/* ----------------------------------------------------------------
   2. HOMEPAGE HERO SLIDESHOW
   ---------------------------------------------------------------- */
const heroSlides = document.querySelectorAll(".hero-slide");
const slideCount = document.querySelector("[data-slide-count]");
let currentSlide = 0;
let heroTimer;

function showSlide(index) {
  if (!heroSlides.length) return;
  currentSlide = (index + heroSlides.length) % heroSlides.length;
  heroSlides.forEach((slide, slideIndex) => {
    slide.classList.toggle("active", slideIndex === currentSlide);
  });
  if (slideCount) {
    slideCount.textContent = `${String(currentSlide + 1).padStart(2, "0")} / ${String(heroSlides.length).padStart(2, "0")}`;
  }
}

function restartHeroTimer() {
  window.clearInterval(heroTimer);
  if (heroSlides.length > 1) {
    heroTimer = window.setInterval(() => showSlide(currentSlide + 1), 6000);
  }
}

document.querySelector("[data-slide-prev]")?.addEventListener("click", () => {
  showSlide(currentSlide - 1);
  restartHeroTimer();
});

document.querySelector("[data-slide-next]")?.addEventListener("click", () => {
  showSlide(currentSlide + 1);
  restartHeroTimer();
});

restartHeroTimer();

/* ----------------------------------------------------------------
   3. PRODUCT FILTERS
   ---------------------------------------------------------------- */
const filterButtons = document.querySelectorAll(".filter-button");
const filterableCards = document.querySelectorAll(".full-product-grid .product-card");
const productCount = document.querySelector("#product-count");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedRoast = button.dataset.filter;
    let visibleCoffees = 0;

    filterButtons.forEach((filterButton) => {
      const isSelected = filterButton === button;
      filterButton.classList.toggle("active", isSelected);
      filterButton.setAttribute("aria-pressed", String(isSelected));
    });

    filterableCards.forEach((card) => {
      const shouldShow = selectedRoast === "all" || card.dataset.roast === selectedRoast;
      card.hidden = !shouldShow;
      if (shouldShow) visibleCoffees += 1;
    });

    if (productCount) {
      productCount.textContent = `${visibleCoffees} ${visibleCoffees === 1 ? "coffee" : "coffees"}`;
    }
  });
});

/* ----------------------------------------------------------------
   4. SHARED SEARCH AND BAG BUTTONS
   JavaScript inserts these buttons into the existing header so the
   same feature works on all four plain-HTML pages.
   ---------------------------------------------------------------- */
const navActions = document.querySelector(".nav-actions");

if (navActions) {
  const searchButton = document.createElement("button");
  searchButton.className = "header-tool search-trigger";
  searchButton.type = "button";
  searchButton.innerHTML = '<span aria-hidden="true">&#8981;</span><span class="sr-only">Search</span>';
  searchButton.setAttribute("data-open-search", "");

  const bagButton = document.createElement("button");
  bagButton.className = "header-tool bag-trigger";
  bagButton.type = "button";
  bagButton.innerHTML = 'Bag <span class="bag-count" data-cart-count>0</span>';
  bagButton.setAttribute("data-open-cart", "");

  navActions.prepend(searchButton);
  navActions.append(bagButton);
}

/* ----------------------------------------------------------------
   5. PRODUCT DATA AND QUICK VIEW
   ---------------------------------------------------------------- */
// BACKEND REQUIRED: replace this display catalog with products, prices,
// stock status, and images returned by the production product API.
const fallbackCatalog = [
  { name: "Golden Hour", meta: "Brazil · Medium roast", price: "$16", image: "coffee-1.jpg" },
  { name: "Cloud Forest", meta: "Ethiopia · Light roast", price: "$19", image: "coffee-2.jpg" },
  { name: "Common Ground", meta: "Guatemala · Medium roast", price: "$17", image: "coffee-3.jpg" },
  { name: "Night Shift", meta: "Indonesia · Dark roast", price: "$18", image: "coffee-4.jpg" },
  { name: "After Rain", meta: "Colombia · Medium roast", price: "$18", image: "coffee-5.jpg" },
  { name: "Ember House", meta: "Seasonal · Dark roast", price: "$15", image: "coffee-6.jpg" },
];

let selectedProduct = null;

document.querySelectorAll(".product-card").forEach((card) => {
  const productImage = card.querySelector(".product-image");
  const image = productImage?.querySelector("img");
  const name = card.querySelector("h3")?.textContent.trim();
  const price = card.querySelector(".product-details > strong, .product-details > .price, .product-details strong")?.textContent.trim();
  const meta = card.querySelector(".product-details p")?.textContent.trim();
  const tasteNotes = card.querySelector(".taste-notes")?.textContent.trim();

  if (!productImage || !image || !name || !price) return;

  const quickViewButton = document.createElement("button");
  quickViewButton.className = "quick-view-button";
  quickViewButton.type = "button";
  quickViewButton.textContent = "Quick view";
  quickViewButton.setAttribute("aria-label", `Quick view ${name}`);
  productImage.append(quickViewButton);

  quickViewButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    selectedProduct = {
      name,
      price: price.match(/\$\d+(?:\.\d{2})?/)?.[0] || price,
      meta: tasteNotes || meta || "Freshly roasted coffee",
      image: image.src,
    };
    openQuickView();
  });
});

document.body.insertAdjacentHTML("beforeend", `
  <div class="store-modal" data-quick-view-modal hidden>
    <button class="store-modal-backdrop" type="button" data-close-quick-view aria-label="Close quick view"></button>
    <div class="quick-view-card" role="dialog" aria-modal="true" aria-labelledby="quick-view-name">
      <button class="store-modal-close" type="button" data-close-quick-view aria-label="Close">&times;</button>
      <img data-quick-view-image src="${imagePath("coffee-1.jpg")}" alt="">
      <div class="quick-view-copy">
        <p class="eyebrow">Quick view</p>
        <h2 id="quick-view-name" data-quick-view-name></h2>
        <strong data-quick-view-price></strong>
        <p data-quick-view-meta></p>
        <label>Bag size<select><option>250 g</option><option>500 g</option><option>1 kg</option></select></label>
        <button class="button button-dark" type="button" data-add-to-cart>Add to bag</button>
      </div>
    </div>
  </div>
`);

const quickViewModal = document.querySelector("[data-quick-view-modal]");

function openQuickView() {
  if (!quickViewModal || !selectedProduct) return;
  const modalImage = quickViewModal.querySelector("[data-quick-view-image]");
  modalImage.src = selectedProduct.image;
  modalImage.alt = selectedProduct.name;
  quickViewModal.querySelector("[data-quick-view-name]").textContent = selectedProduct.name;
  quickViewModal.querySelector("[data-quick-view-price]").textContent = selectedProduct.price;
  quickViewModal.querySelector("[data-quick-view-meta]").textContent = selectedProduct.meta;
  quickViewModal.hidden = false;
  document.body.classList.add("store-overlay-open");
  quickViewModal.querySelector(".store-modal-close").focus();
}

function closeQuickView() {
  if (!quickViewModal) return;
  quickViewModal.hidden = true;
  document.body.classList.remove("store-overlay-open");
}

document.querySelectorAll("[data-close-quick-view]").forEach((button) => {
  button.addEventListener("click", closeQuickView);
});

/* ----------------------------------------------------------------
   6. SEARCH OVERLAY
   BACKEND REQUIRED: production search should query the full product
   catalog on the server rather than the small display array above.
   ---------------------------------------------------------------- */
document.body.insertAdjacentHTML("beforeend", `
  <div class="search-overlay" data-search-overlay hidden>
    <div class="search-panel" role="dialog" aria-modal="true" aria-labelledby="search-title">
      <div class="search-panel-heading">
        <div><p class="eyebrow">Search the shop</p><h2 id="search-title">What are you looking for?</h2></div>
        <button type="button" data-close-search aria-label="Close search">&times;</button>
      </div>
      <label class="search-field">
        <span class="sr-only">Search products</span>
        <input type="search" data-search-input placeholder="Try “dark roast” or “Ethiopia”" autocomplete="off">
      </label>
      <div class="search-results" data-search-results></div>
    </div>
    <button class="search-backdrop" type="button" data-close-search aria-label="Close search"></button>
  </div>
`);

const searchOverlay = document.querySelector("[data-search-overlay]");
const searchInput = document.querySelector("[data-search-input]");
const searchResults = document.querySelector("[data-search-results]");

function renderSearchResults(query = "") {
  if (!searchResults) return;
  const normalizedQuery = query.trim().toLowerCase();
  const matches = fallbackCatalog.filter((product) =>
    `${product.name} ${product.meta}`.toLowerCase().includes(normalizedQuery)
  );

  if (!matches.length) {
    searchResults.innerHTML = '<p class="empty-search">No coffees match that search. Try a roast level or origin.</p>';
    return;
  }

  searchResults.innerHTML = matches.slice(0, 4).map((product) => `
    <a class="search-result" href="${productsPage}">
      <img src="${imagePath(product.image)}" alt="${product.name}">
      <span><small>${product.meta}</small><strong>${product.name}</strong></span>
      <b>${product.price}</b>
    </a>
  `).join("");
}

function openSearch() {
  if (!searchOverlay) return;
  searchOverlay.hidden = false;
  document.body.classList.add("store-overlay-open");
  renderSearchResults();
  searchInput?.focus();
}

function closeSearch() {
  if (!searchOverlay) return;
  searchOverlay.hidden = true;
  document.body.classList.remove("store-overlay-open");
}

document.querySelector("[data-open-search]")?.addEventListener("click", openSearch);
document.querySelectorAll("[data-close-search]").forEach((button) => button.addEventListener("click", closeSearch));
searchInput?.addEventListener("input", () => renderSearchResults(searchInput.value));

/* ----------------------------------------------------------------
   7. BAG DRAWER
   BACKEND REQUIRED: production cart contents must be validated against
   server-side inventory, pricing, customer sessions, and checkout data.
   ---------------------------------------------------------------- */
let cartItems = [];
try {
  cartItems = JSON.parse(window.localStorage.getItem("ember-oak-cart")) || [];
} catch (error) {
  cartItems = [];
}

document.body.insertAdjacentHTML("beforeend", `
  <button class="cart-backdrop" type="button" data-close-cart aria-label="Close bag" hidden></button>
  <aside class="cart-drawer" data-cart-drawer aria-hidden="true">
    <div class="cart-heading"><h2>Your bag</h2><button type="button" data-close-cart aria-label="Close bag">&times;</button></div>
    <div class="cart-items" data-cart-items></div>
    <div class="cart-summary"><p><span>Subtotal</span><strong data-cart-total>$0</strong></p><small>Delivery is calculated at checkout.</small><!-- BACKEND REQUIRED: connect this control to secure checkout and payment processing. --><button class="button button-dark" type="button">Checkout securely</button></div>
  </aside>
`);

const cartDrawer = document.querySelector("[data-cart-drawer]");
const cartBackdrop = document.querySelector(".cart-backdrop");
const cartItemsContainer = document.querySelector("[data-cart-items]");

function saveCart() {
  try {
    window.localStorage.setItem("ember-oak-cart", JSON.stringify(cartItems));
  } catch (error) {
    // The cart still works for the current page if browser storage is blocked.
  }
}

function renderCart() {
  document.querySelectorAll("[data-cart-count]").forEach((count) => {
    count.textContent = cartItems.length;
  });

  if (!cartItemsContainer) return;

  if (!cartItems.length) {
    cartItemsContainer.innerHTML = `<div class="empty-cart"><p>Your bag is empty.</p><a href="${productsPage}">Explore the coffee collection &#8594;</a></div>`;
  } else {
    cartItemsContainer.innerHTML = cartItems.map((item, index) => `
      <article class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div><small>250 g</small><h3>${item.name}</h3><strong>${item.price}</strong><button type="button" data-remove-item="${index}">Remove</button></div>
      </article>
    `).join("");
  }

  const total = cartItems.reduce((sum, item) => sum + Number(item.price.replace(/[^0-9.]/g, "")), 0);
  document.querySelector("[data-cart-total]").textContent = `$${total.toFixed(2)}`;

  document.querySelectorAll("[data-remove-item]").forEach((button) => {
    button.addEventListener("click", () => {
      cartItems.splice(Number(button.dataset.removeItem), 1);
      saveCart();
      renderCart();
    });
  });
}

function openCart() {
  cartDrawer?.classList.add("open");
  cartDrawer?.setAttribute("aria-hidden", "false");
  if (cartBackdrop) cartBackdrop.hidden = false;
  document.body.classList.add("store-overlay-open");
}

function closeCart() {
  cartDrawer?.classList.remove("open");
  cartDrawer?.setAttribute("aria-hidden", "true");
  if (cartBackdrop) cartBackdrop.hidden = true;
  document.body.classList.remove("store-overlay-open");
}

document.querySelector("[data-open-cart]")?.addEventListener("click", openCart);
document.querySelectorAll("[data-close-cart]").forEach((button) => button.addEventListener("click", closeCart));

document.querySelector("[data-add-to-cart]")?.addEventListener("click", () => {
  if (!selectedProduct) return;
  cartItems.push(selectedProduct);
  saveCart();
  renderCart();
  closeQuickView();
  openCart();
});

renderCart();

/* ----------------------------------------------------------------
   8. REVIEW CAROUSEL AND CONTACT FORM
   ---------------------------------------------------------------- */
const reviewTrack = document.querySelector("[data-review-track]");
const moveReviews = (direction) => {
  const firstReview = reviewTrack?.querySelector("blockquote");
  if (!reviewTrack || !firstReview) return;
  reviewTrack.scrollBy({ left: direction * (firstReview.offsetWidth + 18), behavior: "smooth" });
};

document.querySelector("[data-review-prev]")?.addEventListener("click", () => moveReviews(-1));
document.querySelector("[data-review-next]")?.addEventListener("click", () => moveReviews(1));

// BACKEND REQUIRED: this success state is front-end only. Send and validate
// the form through a secure endpoint before using it in production.
document.querySelector(".contact-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  let message = form.querySelector(".form-success-message");
  if (!message) {
    message = document.createElement("p");
    message.className = "form-success-message";
    form.append(message);
  }
  message.textContent = "Thank you. Your message has been received, and our team will be in touch shortly.";
  form.reset();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeQuickView();
  closeSearch();
  closeCart();
});
