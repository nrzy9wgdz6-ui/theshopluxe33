const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".nav");
const cartButton = document.querySelector(".cart-button");
const cartCount = document.querySelector("#cart-count");
const cartDrawer = document.querySelector("#cart-drawer");
const cartOverlay = document.querySelector("#cart-overlay");
const cartClose = document.querySelector(".cart-close");
const cartItems = document.querySelector("#cart-items");
const cartEmpty = document.querySelector("#cart-empty");
const cartSummary = document.querySelector("#cart-summary");
const cartTotal = document.querySelector("#cart-total");
const cartWhatsapp = document.querySelector("#cart-whatsapp");
const toast = document.querySelector("#toast");
const monclerMainImage = document.querySelector("#moncler-main-image");
const selectedMonclerVariant = document.querySelector("#selected-moncler-variant");
const diorMainImage = document.querySelector("#dior-main-image");
const selectedDiorVariant = document.querySelector("#selected-dior-variant");
const currency = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

let cart = [];
let toastTimer;

try {
  cart = JSON.parse(localStorage.getItem("shopluxe33-cart")) || [];
} catch {
  cart = [];
}

function saveCart() {
  localStorage.setItem("shopluxe33-cart", JSON.stringify(cart));
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  cartButton.setAttribute("aria-expanded", "true");
  cartOverlay.hidden = false;
  document.body.classList.add("cart-open");
  cartClose.focus();
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  cartButton.setAttribute("aria-expanded", "false");
  cartOverlay.hidden = true;
  document.body.classList.remove("cart-open");
}

function updateCart() {
  const quantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartCount.textContent = quantity;
  cartItems.replaceChildren();

  cart.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "cart-item";

    const details = document.createElement("div");
    const name = document.createElement("p");
    name.textContent = item.product;
    const variant = document.createElement("small");
    variant.textContent = `${item.variant} · ${currency.format(item.price)}`;
    details.append(name, variant);

    const actions = document.createElement("div");
    actions.className = "cart-item-actions";
    const remove = document.createElement("button");
    remove.type = "button";
    remove.dataset.action = "remove";
    remove.dataset.index = index;
    remove.setAttribute("aria-label", `Retirer un ${item.product}`);
    remove.textContent = "−";
    const count = document.createElement("span");
    count.textContent = item.quantity;
    const add = document.createElement("button");
    add.type = "button";
    add.dataset.action = "add";
    add.dataset.index = index;
    add.setAttribute("aria-label", `Ajouter un ${item.product}`);
    add.textContent = "+";
    actions.append(remove, count, add);
    row.append(details, actions);
    cartItems.append(row);
  });

  cartEmpty.hidden = cart.length > 0;
  cartSummary.hidden = cart.length === 0;
  cartTotal.textContent = currency.format(total);

  const lines = cart.map(item => `• ${item.quantity} × ${item.product} (${item.variant})`);
  const message = `Bonjour, je souhaite commander :\n${lines.join("\n")}\nTotal : ${currency.format(total)}`;
  cartWhatsapp.href = `https://wa.me/33773267816?text=${encodeURIComponent(message)}`;
  saveCart();
}

menuButton.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".nav a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll(".add-to-cart:not(:disabled)").forEach(button => {
  button.addEventListener("click", () => {
    const product = button.dataset.product;
    const price = Number(button.dataset.price);
    const productCard = button.closest(".product-card");
    const selectedOptions = Array.from(productCard?.querySelectorAll(".cart-option strong") || [])
      .map(option => option.textContent.trim())
      .filter(Boolean);
    const variant = selectedOptions.length ? selectedOptions.join(" • ") : "Modèle standard";
    const existing = cart.find(item => item.product === product && item.variant === variant);

    if (existing) existing.quantity += 1;
    else cart.push({ product, price, variant, quantity: 1 });

    updateCart();
    showToast(`${product} ajouté au panier`);
  });
});

cartItems.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const index = Number(button.dataset.index);
  if (button.dataset.action === "add") cart[index].quantity += 1;
  if (button.dataset.action === "remove") cart[index].quantity -= 1;
  cart = cart.filter(item => item.quantity > 0);
  updateCart();
});

cartButton.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && cartDrawer.classList.contains("open")) closeCart();
});

document.querySelectorAll(".variant").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".variant").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    monclerMainImage.style.opacity = "0";
    setTimeout(() => {
      monclerMainImage.src = button.dataset.image;
      monclerMainImage.alt = button.dataset.label;
      monclerMainImage.style.opacity = "1";
    }, 150);
    selectedMonclerVariant.textContent = button.dataset.label;
  });
});

function updateDiorImage() {
  const selectedColor = document.querySelector(".dior-color.active");
  const selectedView = document.querySelector(".dior-view.active")?.dataset.view || "front";
  const image = selectedColor?.dataset[selectedView];
  if (!diorMainImage || !selectedColor || !image) return;

  const color = selectedColor.dataset.color;
  const viewLabel = selectedView === "back" ? "vue de dos" : "vue de face";
  selectedDiorVariant.textContent = color;
  diorMainImage.style.opacity = "0";
  setTimeout(() => {
    diorMainImage.src = image;
    diorMainImage.alt = `T-shirt Dior ${color.toLowerCase()}, ${viewLabel}`;
    diorMainImage.style.opacity = "1";
  }, 150);
}

document.querySelectorAll(".dior-color").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".dior-color").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    updateDiorImage();
  });
});

document.querySelectorAll(".dior-view").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".dior-view").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    updateDiorImage();
  });
});

document.querySelectorAll(".size-picker").forEach(picker => {
  const productCard = picker.closest(".product-card");
  const selectedSize = productCard?.querySelector(".selected-size");

  picker.querySelectorAll(".size-option").forEach(button => {
    button.addEventListener("click", () => {
      picker.querySelectorAll(".size-option").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      if (selectedSize) selectedSize.textContent = button.dataset.size;
    });
  });
});

document.querySelectorAll(".simple-color-picker").forEach(picker => {
  const productCard = picker.closest(".product-card");
  const selectedColor = productCard?.querySelector(".selected-color");
  const productImage = productCard?.querySelector(".product-image img");

  picker.querySelectorAll(".simple-color-option").forEach(button => {
    button.addEventListener("click", () => {
      picker.querySelectorAll(".simple-color-option").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      if (selectedColor) selectedColor.textContent = button.dataset.color;
      if (productImage && button.dataset.image) {
        productImage.style.opacity = "0";
        setTimeout(() => {
          productImage.src = button.dataset.image;
          productImage.alt = button.dataset.alt || `T-shirt ${button.dataset.color}`;
          productImage.style.opacity = "1";
        }, 150);
      }
    });
  });
});

document.querySelector("#year").textContent = new Date().getFullYear();
updateCart();
