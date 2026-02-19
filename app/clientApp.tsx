"use client";

import { useEffect } from "react";

type ProductCard = {
  id: string;
  handle: string;
  title: string;
  featuredImage: { url: string; altText?: string | null } | null;
  price: { amount: string; currencyCode: string };
};

type ProductDetail = {
  id: string;
  handle: string;
  title: string;
  description: string;
  images: Array<{ url: string; altText?: string | null }>;
  variants: Array<{
    id: string;
    title: string;
    selectedOptions: Array<{ name: string; value: string }>;
    price: { amount: string; currencyCode: string };
  }>;
};

type CartLine = {
  id: string;
  quantity: number;
  merchandiseId: string;
  title: string;
  productTitle: string;
  image: string | null;
  price: { amount: string; currencyCode: string };
};

type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  subtotalAmount: { amount: string; currencyCode: string };
  lines: CartLine[];
};

const CART_ID_KEY = "shopify_cart_id_v1";

async function postJson<T>(url: string, body?: Record<string, unknown>): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload?.error || `Request failed (${res.status})`);
  }
  return payload as T;
}

function formatMoney(amount: string, currencyCode: string): string {
  const n = Number(amount || 0);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode || "USD" }).format(n);
}

export default function ClientApp() {
  useEffect(() => {
    const productGrid = document.getElementById("products");
    const yearEl = document.getElementById("year");
    const menuBtn = document.getElementById("menuBtn") as HTMLButtonElement | null;
    const mobileNav = document.getElementById("mobileNav");
    const bagBtn = document.getElementById("bagBtn");

    const detailDialog = document.getElementById("detailDialog") as HTMLDialogElement | null;
    const detailCloseBtn = document.getElementById("detailCloseBtn") as HTMLButtonElement | null;
    const detailTitle = document.getElementById("detailTitle");
    const detailMeta = document.getElementById("detailMeta");
    const detailDescription = document.getElementById("detailDescription");
    const detailMediaFrame = document.getElementById("detailMediaFrame");
    const detailPrevBtn = document.getElementById("detailPrevBtn") as HTMLButtonElement | null;
    const detailNextBtn = document.getElementById("detailNextBtn") as HTMLButtonElement | null;
    const detailSizeRow = document.getElementById("detailSizeRow");
    const detailSizeSelect = document.getElementById("detailSizeSelect") as HTMLSelectElement | null;
    const detailSizeHint = document.getElementById("detailSizeHint");
    const detailPrice = document.getElementById("detailPrice");
    const detailAddToCartBtn = document.getElementById("detailAddToCartBtn") as HTMLButtonElement | null;
    const detailBuyBtn = document.getElementById("detailBuyBtn") as HTMLButtonElement | null;

    const cartDialog = document.getElementById("cartDialog") as HTMLDialogElement | null;
    const cartCloseBtn = document.getElementById("cartCloseBtn") as HTMLButtonElement | null;
    const cartItems = document.getElementById("cartItems");
    const cartEmpty = document.getElementById("cartEmpty");
    const cartSubtotal = document.getElementById("cartSubtotal");
    const cartCheckoutBtn = document.getElementById("cartCheckoutBtn") as HTMLButtonElement | null;
    const cartStatus = document.getElementById("cartStatus");

    let products: ProductCard[] = [];
    let activeDetail: ProductDetail | null = null;
    let activeMediaIndex = 0;
    let cart: Cart | null = null;

    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    if (menuBtn && mobileNav) {
      menuBtn.addEventListener("click", () => {
        const open = mobileNav.classList.toggle("open");
        menuBtn.setAttribute("aria-expanded", String(open));
      });
    }

    function getSelectedVariant(detail: ProductDetail): ProductDetail["variants"][number] | null {
      if (detail.variants.length === 0) return null;
      const selectedId = detailSizeSelect?.value;
      if (selectedId) {
        const found = detail.variants.find((v) => v.id === selectedId);
        if (found) return found;
      }
      return detail.variants[0] || null;
    }

    function updateBagCount() {
      if (!bagBtn) return;
      const count = cart?.totalQuantity || 0;
      bagBtn.textContent = `BAG (${count})`;
    }

    function renderCart() {
      if (!cartItems || !cartEmpty || !cartSubtotal) return;
      cartItems.innerHTML = "";
      const lines = cart?.lines || [];
      cartEmpty.hidden = lines.length > 0;

      for (const line of lines) {
        const row = document.createElement("div");
        row.className = "cart-item";
        row.innerHTML = `
          <div>
            <p><strong>${line.productTitle}</strong></p>
            <p class="meta">${line.title}</p>
            <p class="meta">${formatMoney(line.price.amount, line.price.currencyCode)}</p>
          </div>
          <div class="cart-item-actions">
            <button class="menu-btn" data-dec="${line.id}">-</button>
            <span>${line.quantity}</span>
            <button class="menu-btn" data-inc="${line.id}">+</button>
            <button class="menu-btn" data-remove="${line.id}">Remove</button>
          </div>
        `;
        cartItems.appendChild(row);
      }

      cartSubtotal.textContent = cart
        ? `Subtotal: ${formatMoney(cart.subtotalAmount.amount, cart.subtotalAmount.currencyCode)}`
        : "Subtotal: $0.00";

      cartItems.querySelectorAll("button[data-inc]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const lineId = (btn as HTMLButtonElement).dataset.inc;
          const line = cart?.lines.find((l) => l.id === lineId);
          if (!line || !cart) return;
          await refreshCartFromServer(await postJson<{ cart: Cart }>("/api/shopify/cart/update", {
            cartId: cart.id,
            lineId,
            quantity: line.quantity + 1,
          }).then((r) => r.cart));
        });
      });

      cartItems.querySelectorAll("button[data-dec]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const lineId = (btn as HTMLButtonElement).dataset.dec;
          const line = cart?.lines.find((l) => l.id === lineId);
          if (!line || !cart) return;
          if (line.quantity <= 1) {
            await refreshCartFromServer(await postJson<{ cart: Cart }>("/api/shopify/cart/remove", {
              cartId: cart.id,
              lineId,
            }).then((r) => r.cart));
            return;
          }
          await refreshCartFromServer(await postJson<{ cart: Cart }>("/api/shopify/cart/update", {
            cartId: cart.id,
            lineId,
            quantity: line.quantity - 1,
          }).then((r) => r.cart));
        });
      });

      cartItems.querySelectorAll("button[data-remove]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const lineId = (btn as HTMLButtonElement).dataset.remove;
          if (!lineId || !cart) return;
          await refreshCartFromServer(await postJson<{ cart: Cart }>("/api/shopify/cart/remove", {
            cartId: cart.id,
            lineId,
          }).then((r) => r.cart));
        });
      });
    }

    async function refreshCartFromServer(nextCart: Cart | null) {
      cart = nextCart;
      if (cart?.id) localStorage.setItem(CART_ID_KEY, cart.id);
      updateBagCount();
      renderCart();
    }

    async function ensureCart() {
      const storedId = localStorage.getItem(CART_ID_KEY);
      if (storedId) {
        try {
          const loaded = await postJson<{ cart: Cart }>("/api/shopify/cart/get", { cartId: storedId });
          await refreshCartFromServer(loaded.cart);
          return;
        } catch {
          localStorage.removeItem(CART_ID_KEY);
        }
      }
      const created = await postJson<{ cart: Cart }>("/api/shopify/cart/create");
      await refreshCartFromServer(created.cart);
    }

    function renderDetailMedia() {
      if (!activeDetail || !detailMediaFrame) return;
      const media = activeDetail.images[activeMediaIndex];
      if (!media) {
        detailMediaFrame.innerHTML = "";
        return;
      }
      detailMediaFrame.innerHTML = `<img src="${media.url}" alt="${media.altText || activeDetail.title}" />`;
      const disableNav = activeDetail.images.length < 2;
      if (detailPrevBtn) detailPrevBtn.disabled = disableNav;
      if (detailNextBtn) detailNextBtn.disabled = disableNav;
    }

    function renderDetailVariantOptions(detail: ProductDetail) {
      if (!detailSizeRow || !detailSizeSelect || !detailSizeHint) return;
      const variants = detail.variants;
      detailSizeSelect.innerHTML = "";
      if (variants.length <= 1) {
        detailSizeRow.hidden = true;
        detailSizeHint.textContent = "";
        return;
      }

      detailSizeRow.hidden = false;
      for (const variant of variants) {
        const sizeOpt = variant.selectedOptions.find((opt) => opt.name.toLowerCase() === "size");
        const label = sizeOpt?.value || variant.title;
        const option = document.createElement("option");
        option.value = variant.id;
        option.textContent = label;
        detailSizeSelect.appendChild(option);
      }
      detailSizeHint.textContent = "Select a size before adding to cart.";
    }

    async function openDetail(handle: string) {
      const result = await postJson<{ product: ProductDetail }>("/api/shopify/product", { handle });
      activeDetail = result.product;
      activeMediaIndex = 0;

      if (detailTitle) detailTitle.textContent = activeDetail.title;
      if (detailMeta) detailMeta.textContent = `${activeDetail.images.length} media item${activeDetail.images.length === 1 ? "" : "s"}`;
      if (detailDescription) detailDescription.textContent = activeDetail.description || "";
      const variant = getSelectedVariant(activeDetail);
      if (detailPrice) detailPrice.textContent = variant ? formatMoney(variant.price.amount, variant.price.currencyCode) : "";

      renderDetailVariantOptions(activeDetail);
      renderDetailMedia();
      detailDialog?.showModal();
    }

    async function addActiveToCart(quantity: number) {
      if (!activeDetail) return;
      await ensureCart();
      const variant = getSelectedVariant(activeDetail);
      if (!variant || !cart) return;
      const result = await postJson<{ cart: Cart }>("/api/shopify/cart/add", {
        cartId: cart.id,
        merchandiseId: variant.id,
        quantity,
      });
      await refreshCartFromServer(result.cart);
    }

    function renderProducts() {
      if (!productGrid) return;
      productGrid.innerHTML = "";

      if (products.length === 0) {
        const empty = document.createElement("p");
        empty.className = "meta";
        empty.textContent = "No live products yet.";
        productGrid.appendChild(empty);
        return;
      }

      for (const product of products) {
        const card = document.createElement("article");
        card.className = "product-card";
        const imageHtml = product.featuredImage
          ? `<img src="${product.featuredImage.url}" alt="${product.featuredImage.altText || product.title}" loading="lazy" />`
          : "";

        card.innerHTML = `
          <button class="product-link" type="button" aria-label="${product.title}">
            <div class="product-image">${imageHtml}</div>
            <p class="product-name">${product.title}</p>
          </button>
          <div class="product-actions">
            <button class="menu-btn product-cart-btn" type="button">Add to Cart</button>
            <button class="buy-btn product-buy-btn" type="button">Buy</button>
          </div>
        `;

        const openBtn = card.querySelector(".product-link") as HTMLButtonElement | null;
        const cartBtn = card.querySelector(".product-cart-btn") as HTMLButtonElement | null;
        const buyBtn = card.querySelector(".product-buy-btn") as HTMLButtonElement | null;

        openBtn?.addEventListener("click", () => openDetail(product.handle));
        cartBtn?.addEventListener("click", async () => {
          await openDetail(product.handle);
          await addActiveToCart(1);
        });
        buyBtn?.addEventListener("click", async () => {
          await openDetail(product.handle);
          await addActiveToCart(1);
          if (cart?.checkoutUrl) window.location.href = cart.checkoutUrl;
        });

        productGrid.appendChild(card);
      }
    }

    async function loadProducts() {
      const result = await postJson<{ products: ProductCard[] }>("/api/shopify/products");
      products = result.products;
      renderProducts();
    }

    bagBtn?.addEventListener("click", async (event) => {
      event.preventDefault();
      if (!cart) await ensureCart();
      renderCart();
      cartDialog?.showModal();
    });

    cartCloseBtn?.addEventListener("click", () => cartDialog?.close());
    detailCloseBtn?.addEventListener("click", () => detailDialog?.close());

    detailPrevBtn?.addEventListener("click", () => {
      if (!activeDetail || activeDetail.images.length < 2) return;
      activeMediaIndex = (activeMediaIndex - 1 + activeDetail.images.length) % activeDetail.images.length;
      renderDetailMedia();
    });

    detailNextBtn?.addEventListener("click", () => {
      if (!activeDetail || activeDetail.images.length < 2) return;
      activeMediaIndex = (activeMediaIndex + 1) % activeDetail.images.length;
      renderDetailMedia();
    });

    detailSizeSelect?.addEventListener("change", () => {
      if (!activeDetail || !detailPrice) return;
      const variant = getSelectedVariant(activeDetail);
      if (variant) detailPrice.textContent = formatMoney(variant.price.amount, variant.price.currencyCode);
    });

    detailAddToCartBtn?.addEventListener("click", async () => {
      try {
        await addActiveToCart(1);
        if (detailSizeHint) detailSizeHint.textContent = "Added to cart.";
      } catch (error) {
        if (detailSizeHint) detailSizeHint.textContent = error instanceof Error ? error.message : "Failed to add.";
      }
    });

    detailBuyBtn?.addEventListener("click", async () => {
      try {
        await addActiveToCart(1);
        if (cart?.checkoutUrl) window.location.href = cart.checkoutUrl;
      } catch (error) {
        if (detailSizeHint) detailSizeHint.textContent = error instanceof Error ? error.message : "Failed to checkout.";
      }
    });

    cartCheckoutBtn?.addEventListener("click", () => {
      if (!cart?.checkoutUrl) {
        if (cartStatus) cartStatus.textContent = "Cart is empty.";
        return;
      }
      window.location.href = cart.checkoutUrl;
    });

    loadProducts().catch((error) => {
      if (productGrid) {
        productGrid.innerHTML = `<p class="meta">${error instanceof Error ? error.message : "Failed to load products."}</p>`;
      }
    });

    ensureCart().catch(() => {
      // ignore initial cart failure; user can still browse products
    });
  }, []);

  return null;
}
