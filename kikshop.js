const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();

const STORAGE_KEY = "kik_shop_cart_v2";

const categories = [
    { id: "all", title: "Все товары" },
    { id: "tshirts", title: "Футболки" },
    { id: "hoodies", title: "Худи и свитшоты" },
    { id: "outerwear", title: "Куртки" },
    { id: "pants", title: "Брюки" },
    { id: "caps", title: "Кепки" },
];

// Для реальных фото укажите относительный или абсолютный путь в поле image.
const products = [
    {
        id: 1,
        name: "Футболка с принтом",
        category: "tshirts",
        price: 1900,
        type: "shirt",
        cloth: "#f7f7f7",
        badge: "База",
        image: "",
        description: "Хлопковая футболка под ваш логотип, рисунок или надпись.",
        features: ["Плотность 180 г/м2", "Размеры XS-3XL", "DTF или шелкография"],
        sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
        colors: ["Белый", "Черный", "Синий"],
        popularity: 8,
    },
    {
        id: 2,
        name: "Оверсайз футболка",
        category: "tshirts",
        price: 2400,
        type: "shirt",
        cloth: "#151923",
        badge: "Хит",
        image: "",
        description: "Свободная посадка, плотный трикотаж и крупный принт на груди или спине.",
        features: ["Плотность 220 г/м2", "Свободный крой", "Можно добавить бирку"],
        sizes: ["S", "M", "L", "XL", "2XL"],
        colors: ["Черный", "Графит", "Молочный"],
        popularity: 10,
    },
    {
        id: 3,
        name: "Худи с вышивкой",
        category: "hoodies",
        price: 4600,
        type: "hoodie",
        cloth: "#2f466b",
        badge: "Вышивка",
        image: "",
        description: "Теплое худи с индивидуальной вышивкой или небольшим принтом.",
        features: ["Футер 3-нитка", "Капюшон с подкладом", "Вышивка до 12 см"],
        sizes: ["S", "M", "L", "XL", "2XL"],
        colors: ["Синий", "Черный", "Серый"],
        popularity: 9,
    },
    {
        id: 4,
        name: "Свитшот на заказ",
        category: "hoodies",
        price: 3900,
        type: "hoodie",
        cloth: "#e9eef7",
        badge: "Команды",
        image: "",
        description: "Лаконичный свитшот для команды, бренда или личного мерча.",
        features: ["Без капюшона", "Манжеты в тон", "Принт спереди или сзади"],
        sizes: ["S", "M", "L", "XL", "2XL"],
        colors: ["Молочный", "Черный", "Зеленый"],
        popularity: 6,
    },
    {
        id: 5,
        name: "Легкая ветровка",
        category: "outerwear",
        price: 5900,
        type: "hoodie",
        cloth: "#f47b5b",
        badge: "Промо",
        image: "",
        description: "Ветровка с логотипом, патчем или принтом для промо и повседневной носки.",
        features: ["Водоотталкивающая ткань", "Молния", "Печать или нашивка"],
        sizes: ["S", "M", "L", "XL", "2XL"],
        colors: ["Оранжевый", "Черный", "Синий"],
        popularity: 5,
    },
    {
        id: 6,
        name: "Карго брюки",
        category: "pants",
        price: 5200,
        type: "pants",
        cloth: "#50604d",
        badge: "Патч",
        image: "",
        description: "Брюки с карманами и возможностью брендирования патчем.",
        features: ["Плотный хлопок", "Регулировка по низу", "Патч или вышивка"],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Хаки", "Черный", "Песочный"],
        popularity: 4,
    },
    {
        id: 7,
        name: "Спортивные джоггеры",
        category: "pants",
        price: 4100,
        type: "pants",
        cloth: "#1e2636",
        badge: "Униформа",
        image: "",
        description: "Мягкие джоггеры с небольшим логотипом или персональной надписью.",
        features: ["Футер 2-нитка", "Эластичный пояс", "Печать до 20 см"],
        sizes: ["S", "M", "L", "XL", "2XL"],
        colors: ["Черный", "Серый", "Синий"],
        popularity: 7,
    },
    {
        id: 8,
        name: "Кепка с вышивкой",
        category: "caps",
        price: 1700,
        type: "cap",
        cloth: "#111827",
        badge: "Аксессуар",
        image: "",
        description: "Классическая кепка с вышитым логотипом или короткой фразой.",
        features: ["Регулируемый ремешок", "6 клиньев", "Вышивка спереди"],
        sizes: ["One size"],
        colors: ["Черный", "Белый", "Синий"],
        popularity: 6,
    },
];

const state = {
    category: "all",
    search: "",
    sort: "popular",
    cart: loadCart(),
    activeProductId: null,
};

const screens = {
    catalog: document.getElementById("catalogScreen"),
    product: document.getElementById("productScreen"),
    cart: document.getElementById("cartScreen"),
};

const categorySelect = document.getElementById("categorySelect");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const catalog = document.getElementById("catalog");
const catalogMeta = document.getElementById("catalogMeta");
const cartBadge = document.getElementById("cartBadge");
const cartList = document.getElementById("cartList");
const summary = document.getElementById("summary");
const orderForm = document.getElementById("orderForm");
const formStatus = document.getElementById("formStatus");

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatPrice(value) {
    return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}

function loadCart() {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart));
}

function showScreen(name) {
    Object.values(screens).forEach((screen) => screen.classList.remove("active"));
    screens[name].classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function getProduct(id) {
    return products.find((product) => product.id === Number(id));
}

function getCartItem(key) {
    return state.cart.find((item) => item.key === key);
}

function getCartCount() {
    return state.cart.reduce((sum, item) => sum + item.qty, 0);
}

function getCartTotal() {
    return state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getDefaultOptions(product) {
    return {
        size: product.sizes[0] || "One size",
        color: product.colors[0] || "Стандартный",
        note: "",
    };
}

function makeCartKey(productId, options) {
    const noteKey = String(options.note || "").trim().toLowerCase();
    return [productId, options.size, options.color, noteKey].join("|");
}

function getSizeLabel(product) {
    if (product.sizes.length <= 1) return product.sizes[0] || "One size";
    return `${product.sizes[0]}-${product.sizes.at(-1)}`;
}

function productMedia(product, extraClass = "") {
    const image = String(product.image || "").trim();
    const imageClass = image ? "has-image" : "";
    const imageMarkup = image
        ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}" loading="lazy" />`
        : "";

    return `
        <div class="product-art ${imageClass} ${extraClass}" style="--cloth:${product.cloth};">
            ${imageMarkup}
            <span class="product-badge">${escapeHtml(product.badge)}</span>
            <div class="clothes-piece ${escapeHtml(product.type)}" aria-hidden="true"></div>
        </div>
    `;
}

function addToCart(id, options = null) {
    const product = getProduct(id);
    if (!product) return;

    const selected = options || getDefaultOptions(product);
    const normalized = {
        size: String(selected.size || product.sizes[0] || "One size").trim(),
        color: String(selected.color || product.colors[0] || "Стандартный").trim(),
        note: String(selected.note || "").trim(),
    };
    const key = makeCartKey(product.id, normalized);
    const existing = getCartItem(key);

    if (existing) {
        existing.qty += 1;
    } else {
        state.cart.push({
        key,
        id: product.id,
        name: product.name,
        category: categories.find((cat) => cat.id === product.category)?.title || product.category,
        price: product.price,
        image: product.image || "",
        size: normalized.size,
        color: normalized.color,
        note: normalized.note,
        qty: 1,
        });
    }

    saveCart();
    renderCartBadge();
    renderCart();
}

function changeQty(key, delta) {
    const item = getCartItem(key);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
        state.cart = state.cart.filter((cartItem) => cartItem.key !== key);
    }

    saveCart();
    renderCartBadge();
    renderCart();
}

function removeFromCart(key) {
    state.cart = state.cart.filter((item) => item.key !== key);
    saveCart();
    renderCartBadge();
    renderCart();
}

function clearCart() {
    state.cart = [];
    saveCart();
    renderCartBadge();
    renderCart();
}

function renderCartBadge() {
    cartBadge.textContent = getCartCount();
}

function renderCategories() {
    categorySelect.innerHTML = categories
        .map((category) => `<option value="${category.id}">${category.title}</option>`)
        .join("");
    categorySelect.value = state.category;
}

function getFilteredProducts() {
    const query = state.search.trim().toLowerCase();
    const filtered = products.filter((product) => {
        const inCategory = state.category === "all" || product.category === state.category;
        const searchable = [
        product.name,
        product.description,
        product.badge,
        ...product.features,
        ...product.colors,
        ...product.sizes,
        ]
        .join(" ")
        .toLowerCase();
        return inCategory && (!query || searchable.includes(query));
    });

    return filtered.sort((a, b) => {
        if (state.sort === "price-asc") return a.price - b.price;
        if (state.sort === "price-desc") return b.price - a.price;
        if (state.sort === "name") return a.name.localeCompare(b.name, "ru");
        return b.popularity - a.popularity;
    });
}

function renderCatalog() {
    const filtered = getFilteredProducts();
    catalogMeta.textContent = `${filtered.length} ${plural(filtered.length, "товар", "товара", "товаров")}`;

    if (!filtered.length) {
        catalog.innerHTML = `<div class="empty">Ничего не найдено. Попробуйте изменить поиск или категорию.</div>`;
        return;
    }

    catalog.innerHTML = filtered
        .map(
        (product) => `
        <article class="product-card">
            ${productMedia(product)}
            <div class="product-body">
                <h2 class="product-title">${escapeHtml(product.name)}</h2>
                <div class="product-desc">${escapeHtml(product.description)}</div>
                <div class="option-row">
                    <span class="option-pill">${escapeHtml(getSizeLabel(product))}</span>
                    <span class="option-pill">${escapeHtml(product.colors[0])}</span>
                </div>
                <div class="product-foot">
                    <span class="price">${formatPrice(product.price)}</span>
                    <div class="actions">
                        <button class="btn secondary" type="button" data-action="details" data-id="${product.id}">Подробнее</button>
                        <button class="btn" type="button" data-action="add" data-id="${product.id}">Добавить</button>
                    </div>
                </div>
            </div>
        </article>
        `
    )
    .join("");
}

function plural(value, one, few, many) {
    const mod10 = value % 10;
    const mod100 = value % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
}

function renderProduct(id) {
    const product = getProduct(id);
    if (!product) return;

    state.activeProductId = product.id;
    const defaults = getDefaultOptions(product);

    screens.product.innerHTML = `
        <div class="detail">
            <article class="detail-panel">
                ${productMedia(product, "detail-art")}
            </article>
            <aside class="detail-info detail-panel">
                <button class="btn secondary" type="button" data-action="catalog">Назад к каталогу</button>
                <h2>${escapeHtml(product.name)}</h2>
                <p class="detail-copy">${escapeHtml(product.description)}</p>
                <div class="price">${formatPrice(product.price)}</div>
                <ul class="features">
                ${product.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("")}
                </ul>
                <div class="option-grid">
                    <div class="field">
                        <label for="detailSize">Размер</label>
                        <select id="detailSize">
                            ${product.sizes.map((size) => `<option value="${escapeHtml(size)}">${escapeHtml(size)}</option>`).join("")}
                        </select>
                    </div>
                    <div class="field">
                        <label for="detailColor">Цвет</label>
                        <select id="detailColor">
                            ${product.colors.map((color) => `<option value="${escapeHtml(color)}">${escapeHtml(color)}</option>`).join("")}
                        </select>
                    </div>
                </div>
                <div class="field">
                    <label for="detailNote">Пожелание к макету</label>
                    <textarea id="detailNote" placeholder="Например: логотип на груди, ник на спине, нужен макет"></textarea>
                </div>
                <div class="actions">
                    <button class="btn" type="button" data-action="add-configured" data-id="${product.id}">Добавить в корзину</button>
                    <button class="btn secondary" type="button" data-action="cart">Перейти в корзину</button>
                </div>
            </aside>
        </div>
  `;

  document.getElementById("detailSize").value = defaults.size;
  document.getElementById("detailColor").value = defaults.color;
  showScreen("product");
}

function renderCart() {
    if (!state.cart.length) {
        cartList.innerHTML = `<div class="empty">Корзина пустая. Добавьте товары из каталога.</div>`;
        summary.innerHTML = `<div class="summary-row total"><span>Итого</span><span>${formatPrice(0)}</span></div>`;
        return;
    }

    cartList.innerHTML = state.cart
        .map(
        (item) => `
            <div class="cart-item">
                <div>
                    <b>${escapeHtml(item.name)}</b>
                    <small>
                    ${escapeHtml(item.category)} · ${escapeHtml(item.size)} · ${escapeHtml(item.color)} · ${formatPrice(item.price)} за шт.
                    </small>
                    ${item.note ? `<small>Макет: ${escapeHtml(item.note)}</small>` : ""}
                    <div class="qty">
                        <button type="button" data-action="qty" data-delta="-1" data-key="${escapeHtml(item.key)}">−</button>
                        <span>${item.qty}</span>
                        <button type="button" data-action="qty" data-delta="1" data-key="${escapeHtml(item.key)}">+</button>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <b>${formatPrice(item.price * item.qty)}</b>
                    <button class="btn danger" type="button" data-action="remove" data-key="${escapeHtml(item.key)}">Убрать</button>
                </div>
            </div>
        `
        )
        .join("");

    summary.innerHTML = `
        <div class="summary-row"><span>Позиций</span><span>${state.cart.length}</span></div>
        <div class="summary-row"><span>Товаров</span><span>${getCartCount()}</span></div>
        <div class="summary-row"><span>Сумма по товарам</span><span>${formatPrice(getCartTotal())}</span></div>
        <div class="summary-row total"><span>Итого</span><span>${formatPrice(getCartTotal())}</span></div>
    `;
}

function openCart() {
    renderCart();
    showScreen("cart");
}

function setStatus(message, type = "info") {
    formStatus.textContent = message;
    formStatus.className = `form-status ${type}`;
}

function fillTelegramUser() {
    const user = tg?.initDataUnsafe?.user;
    const nameInput = document.getElementById("customerName");
    const phoneInput = document.getElementById("customerPhone");

    if (user?.first_name && !nameInput.value) {
        nameInput.value = [user.first_name, user.last_name].filter(Boolean).join(" ");
    }

    if (user?.username && !phoneInput.value) {
        phoneInput.value = `@${user.username}`;
    }
}

function submitOrder(event) {
    event.preventDefault();

    if (!state.cart.length) {
        setStatus("Добавьте хотя бы один товар перед отправкой заказа.", "error");
        return;
    }

    const formData = new FormData(orderForm);
    const user = tg?.initDataUnsafe?.user || {};
    const order = {
        type: "custom_clothes_order",
        createdAt: new Date().toISOString(),
        customer: {
        name: String(formData.get("customerName") || "").trim(),
        contact: String(formData.get("customerPhone") || "").trim(),
        city: String(formData.get("customerCity") || "").trim(),
        comment: String(formData.get("customerComment") || "").trim(),
        },
        telegramUser: {
        id: user.id || null,
        username: user.username || "",
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        },
        items: state.cart.map(({ key, ...item }) => ({ ...item })),
        total: getCartTotal(),
    };

    if (!order.customer.name || !order.customer.contact || !order.customer.city) {
        setStatus("Заполните имя, контакт и город доставки.", "error");
        return;
    }

    if (!tg?.sendData) {
        setStatus("Отправка заказа доступна при открытии магазина через Telegram.", "error");
        return;
    }

    tg.sendData(JSON.stringify(order));
    clearCart();
    orderForm.reset();
    fillTelegramUser();
    setStatus("Заказ отправлен менеджеру. Он свяжется с вами для согласования макета и оплаты.", "success");
}

categorySelect.addEventListener("change", (event) => {
    state.category = event.target.value;
    renderCatalog();
});

searchInput.addEventListener("input", (event) => {
    state.search = event.target.value;
    renderCatalog();
});

sortSelect.addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderCatalog();
});

catalog.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    const { action, id } = button.dataset;
    if (action === "add") addToCart(id);
    if (action === "details") renderProduct(id);
});

screens.product.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    const { action, id } = button.dataset;
    if (action === "catalog") showScreen("catalog");
    if (action === "cart") openCart();
    if (action === "add-configured") {
        addToCart(id, {
        size: document.getElementById("detailSize").value,
        color: document.getElementById("detailColor").value,
        note: document.getElementById("detailNote").value,
        });
    }
});

cartList.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    const { action, key, delta } = button.dataset;
    if (action === "qty") changeQty(key, Number(delta));
    if (action === "remove") removeFromCart(key);
});

window.addEventListener(
    "error",
    (event) => {
        const target = event.target;
        if (!(target instanceof HTMLImageElement)) return;
        const art = target.closest(".product-art");
        if (!art) return;
        target.hidden = true;
        art.classList.remove("has-image");
    },
    true
);

document.getElementById("openCartBtn").addEventListener("click", openCart);
document.getElementById("backToCatalogBtn").addEventListener("click", () => showScreen("catalog"));
document.getElementById("clearCartBtn").addEventListener("click", clearCart);
orderForm.addEventListener("submit", submitOrder);

renderCategories();
renderCatalog();
renderCartBadge();
renderCart();
fillTelegramUser();
