const ADMIN_SESSION_KEY = "portfolio_admin_session_v2";
const ADMIN_PASSCODE_KEY = "portfolio_admin_passcode_v2";
const CART_KEY = "portfolio_cart_v1";
const API_BASE = resolveApiBase();
const SUPABASE_URL = String(window.SUPABASE_URL || localStorage.getItem("supabase_url") || "").trim();
const SUPABASE_ANON_KEY = String(window.SUPABASE_ANON_KEY || localStorage.getItem("supabase_anon_key") || "").trim();
const SUPABASE_ADMIN_EMAIL = String(window.SUPABASE_ADMIN_EMAIL || localStorage.getItem("supabase_admin_email") || "").trim();
const SUPABASE_MEDIA_BUCKET = String(window.SUPABASE_MEDIA_BUCKET || localStorage.getItem("supabase_media_bucket") || "site-media").trim();
const SUPABASE_ENABLED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase);
const supabaseClient = SUPABASE_ENABLED
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
const ARCHIVE_ZOOM_KEY = "archive_zoom_px_v1";
const ARCHIVE_ZOOM_SENSITIVITY = 100; // 0-100

const productGrid = document.getElementById("products");
const homeProductsGrid = document.getElementById("homeProducts");
const heroTrack = document.getElementById("heroTrack");
const homePage = document.getElementById("homePage");
const portfolioPage = document.getElementById("portfolioPage");
const livePage = document.getElementById("livePage");
const archivePage = document.getElementById("archivePage");
const uploadPage = document.getElementById("uploadPage");
const archiveIndex = document.getElementById("archiveIndex");
const portfolioGrid = document.getElementById("portfolioGrid");
const routeLinks = document.querySelectorAll('a[href="#home"], a[href="#portfolio"], a[href="#live"], a[href="#archive"]');
const yearEl = document.getElementById("year");
const menuBtn = document.getElementById("menuBtn");
const mobileNav = document.getElementById("mobileNav");
const bagEl = document.getElementById("bagBtn");
const landingScreen = document.getElementById("landingScreen");
const landingVideo = document.getElementById("landingVideo");
const landingGif = document.getElementById("landingGif");
const enterBtn = document.getElementById("enterBtn");
const experienceAudio = document.getElementById("experienceAudio");
const siteBgGif = document.getElementById("siteBgGif");

const adminLoginBtn = document.getElementById("adminLoginBtn");
const adminLogoutBtn = document.getElementById("adminLogoutBtn");
const uploadToggleBtn = document.getElementById("uploadToggleBtn");
const uploadPanel = document.getElementById("uploadPage");
const uploadPanelTitle = document.getElementById("uploadPanelTitle");
const uploadForm = document.getElementById("uploadForm");
const uploadStatus = document.getElementById("uploadStatus");
const uploadSubmitBtn = document.getElementById("uploadSubmitBtn");
const uploadCancelEditBtn = document.getElementById("uploadCancelEditBtn");
const titleInput = document.getElementById("titleInput");
const descriptionInput = document.getElementById("descriptionInput");
const detailsInput = document.getElementById("detailsInput");
const yearInput = document.getElementById("yearInput");
const priceInput = document.getElementById("priceInput");
const buyUrlInput = document.getElementById("buyUrlInput");
const statusInput = document.getElementById("statusInput");
const avxColorInput = document.getElementById("avxColorInput");
const avxItemInput = document.getElementById("avxItemInput");
const avxSizeInput = document.getElementById("avxSizeInput");
const avxSeasonInput = document.getElementById("avxSeasonInput");
const avxYearInput = document.getElementById("avxYearInput");
const avxIdInput = document.getElementById("avxIdInput");
const archiveMetaFields = document.getElementById("archiveMetaFields");
const archiveSeasonInput = document.getElementById("archiveSeasonInput");
const archiveYearInput = document.getElementById("archiveYearInput");
const variantRows = document.getElementById("variantRows");
const addVariantBtn = document.getElementById("addVariantBtn");
const mediaInput = document.getElementById("mediaInput");
const experienceForm = document.getElementById("experienceForm");
const landingGifInput = document.getElementById("landingGifInput");
const bannerGifInput = document.getElementById("bannerGifInput");
const experienceMp3Input = document.getElementById("experienceMp3Input");
const experienceStatus = document.getElementById("experienceStatus");
const portfolioForm = document.getElementById("portfolioForm");
const portfolioTitleInput = document.getElementById("portfolioTitleInput");
const portfolioDescriptionInput = document.getElementById("portfolioDescriptionInput");
const portfolioDetailsInput = document.getElementById("portfolioDetailsInput");
const portfolioFolderInput = document.getElementById("portfolioFolderInput");
const portfolioStatus = document.getElementById("portfolioStatus");
const portfolioPanelTitle = document.getElementById("portfolioPanelTitle");
const portfolioSubmitBtn = document.getElementById("portfolioSubmitBtn");
const portfolioCancelEditBtn = document.getElementById("portfolioCancelEditBtn");

const adminDialog = document.getElementById("adminDialog");
const adminForm = document.getElementById("adminForm");
const adminPasscodeInput = document.getElementById("adminPasscodeInput");
const adminStatus = document.getElementById("adminStatus");
const adminCancelBtn = document.getElementById("adminCancelBtn");

const detailDialog = document.getElementById("detailDialog");
const detailCloseBtn = document.getElementById("detailCloseBtn");
const detailTitle = document.getElementById("detailTitle");
const detailMeta = document.getElementById("detailMeta");
const detailDescription = document.getElementById("detailDescription");
const detailFullText = document.getElementById("detailFullText");
const detailViewer = document.getElementById("detailViewer");
const detailMediaFrame = document.getElementById("detailMediaFrame");
const detailPortfolioMediaGrid = document.getElementById("detailPortfolioMediaGrid");
const detailPrevBtn = document.getElementById("detailPrevBtn");
const detailNextBtn = document.getElementById("detailNextBtn");
const detailSizeRow = document.getElementById("detailSizeRow");
const detailSizeSelect = document.getElementById("detailSizeSelect");
const detailSizeHint = document.getElementById("detailSizeHint");
const detailPrice = document.getElementById("detailPrice");
const detailBuyBtn = document.getElementById("detailBuyBtn");
const detailEditBtn = document.getElementById("detailEditBtn");
const detailAddToCartBtn = document.getElementById("detailAddToCartBtn");

const cartDialog = document.getElementById("cartDialog");
const cartCloseBtn = document.getElementById("cartCloseBtn");
const cartItemsEl = document.getElementById("cartItems");
const cartEmptyEl = document.getElementById("cartEmpty");
const cartSubtotalEl = document.getElementById("cartSubtotal");
const cartCheckoutBtn = document.getElementById("cartCheckoutBtn");
const cartStatus = document.getElementById("cartStatus");

let uploadedProducts = [];
let portfolioProjects = [];
let isAdmin = localStorage.getItem(ADMIN_SESSION_KEY) === "1"
  && Boolean((sessionStorage.getItem(ADMIN_PASSCODE_KEY) || "").trim());
let activeDetailItem = null;
let activeDetailType = "product";
let activeMediaIndex = 0;
let cartItems = loadCart();
let editingProductId = null;
let editingPortfolioId = null;
let siteSettings = null;
let archiveZoom = loadArchiveZoom();
let archiveTouchDistance = null;

if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

updateBagUi();
setVariationsInForm([]);
syncArchiveMetaVisibility("live");
syncAvxId();
renderProducts();
renderPortfolio();
updateAdminUi();
loadData();
initializeExperience();
syncRouteFromHash();

window.addEventListener("hashchange", syncRouteFromHash);

if (menuBtn && mobileNav) {
  menuBtn.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
  });
}

if (uploadToggleBtn) {
  uploadToggleBtn.addEventListener("click", () => {
    window.location.hash = "#upload";
  });
}

for (const link of routeLinks) {
  link.addEventListener("click", () => {
    if (!mobileNav || !menuBtn) return;
    mobileNav.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  });
}

if (addVariantBtn) {
  addVariantBtn.addEventListener("click", () => addVariantRow());
}
setupArchivePinchZoom();

if (statusInput) {
  statusInput.addEventListener("change", () => syncArchiveMetaVisibility(statusInput.value));
}

for (const field of [avxColorInput, avxItemInput, avxSizeInput, avxSeasonInput, avxYearInput]) {
  if (field) field.addEventListener("change", syncAvxId);
  if (field) field.addEventListener("input", syncAvxId);
}

if (bagEl && cartDialog) {
  bagEl.addEventListener("click", (event) => {
    event.preventDefault();
    openCartDialog();
  });
}

if (cartCloseBtn && cartDialog) {
  cartCloseBtn.addEventListener("click", () => cartDialog.close());
}

if (cartCheckoutBtn) {
  cartCheckoutBtn.addEventListener("click", checkoutCart);
}

if (adminLoginBtn && adminDialog) {
  adminLoginBtn.addEventListener("click", () => {
    adminStatus.textContent = "";
    adminPasscodeInput.value = "";
    adminDialog.showModal();
    adminPasscodeInput.focus();
  });
}

if (adminCancelBtn && adminDialog) {
  adminCancelBtn.addEventListener("click", () => adminDialog.close());
}

if (adminForm) {
  adminForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const passcode = (adminPasscodeInput.value || "").trim();
    if (!passcode) {
      adminStatus.textContent = "Passcode required.";
      return;
    }

    try {
      adminStatus.textContent = "Checking...";
      await apiRequest("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ passcode }),
      });

      sessionStorage.setItem(ADMIN_PASSCODE_KEY, SUPABASE_ENABLED ? "supabase-auth" : passcode);
      isAdmin = true;
      localStorage.setItem(ADMIN_SESSION_KEY, "1");
      updateAdminUi();
      adminDialog.close();
    } catch (error) {
      adminStatus.textContent = error.message || "Wrong passcode.";
    }
  });
}

if (adminLogoutBtn) {
  adminLogoutBtn.addEventListener("click", async () => {
    if (SUPABASE_ENABLED) {
      try {
        await apiRequest("/api/admin/logout", { method: "POST" });
      } catch {
        // Keep local logout flow even if remote sign-out fails.
      }
    }
    isAdmin = false;
    sessionStorage.removeItem(ADMIN_PASSCODE_KEY);
    localStorage.removeItem(ADMIN_SESSION_KEY);
    updateAdminUi();
    closeUploadPanel();
  });
}

function getAdminPasscode() {
  if (!isAdmin) return "";
  if (SUPABASE_ENABLED) return "supabase-auth";
  return (sessionStorage.getItem(ADMIN_PASSCODE_KEY) || "").trim();
}

if (uploadCancelEditBtn) {
  uploadCancelEditBtn.addEventListener("click", () => {
    resetEditMode();
    setUploadStatus("Edit canceled.");
  });
}

if (experienceForm) {
  experienceForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!isAdmin) {
      setExperienceStatus("Admin login required.");
      return;
    }

    const adminPasscode = getAdminPasscode();
    if (!adminPasscode) {
      setExperienceStatus("Log in again to save dashboard media.");
      return;
    }

    const gifFile = landingGifInput?.files?.[0] || null;
    const bannerFiles = Array.from(bannerGifInput?.files || []).filter((file) => file.size > 0);
    const mp3File = experienceMp3Input?.files?.[0] || null;

    if (!gifFile && bannerFiles.length === 0 && !mp3File) {
      setExperienceStatus("Choose at least one file.");
      return;
    }

    if (gifFile && gifFile.type !== "image/gif") {
      setExperienceStatus("Landing file must be a GIF.");
      return;
    }

    if (bannerFiles.some((file) => !String(file.type || "").startsWith("image/"))) {
      setExperienceStatus("Banner files must be images.");
      return;
    }

    if (mp3File && !isMp3File(mp3File)) {
      setExperienceStatus("Audio file must be an MP3.");
      return;
    }

    try {
      setExperienceStatus("Saving...");
      const payload = {};
      const useStorageUpload = SUPABASE_ENABLED && Boolean(SUPABASE_MEDIA_BUCKET);

      if (gifFile) {
        if (useStorageUpload) {
          payload.landingGifDataUrl = await uploadExperienceFileToStorage(gifFile, "landing");
        } else {
          payload.landingGifDataUrl = await fileToDataUrl(gifFile);
        }
      }
      if (bannerFiles.length > 0) {
        payload.bannerMediaDataUrls = useStorageUpload
          ? await Promise.all(bannerFiles.map((file) => uploadExperienceFileToStorage(file, "banner")))
          : await Promise.all(bannerFiles.map((file) => fileToDataUrl(file)));
      }
      if (mp3File) {
        if (useStorageUpload) {
          payload.experienceAudioDataUrl = await uploadExperienceFileToStorage(mp3File, "audio");
        } else {
          payload.experienceAudioDataUrl = await fileToDataUrl(mp3File);
        }
      }

      await apiRequest("/api/site-settings", {
        method: "POST",
        headers: { "x-admin-passcode": adminPasscode },
        body: JSON.stringify(payload),
      });

      experienceForm.reset();
      setExperienceStatus("Saved.");
      await loadSiteSettings();
    } catch (error) {
      setExperienceStatus(error.message || "Save failed.");
    }
  });
}

if (portfolioForm) {
  portfolioForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!isAdmin) {
      setPortfolioStatus("Admin login required.");
      return;
    }

    const adminPasscode = getAdminPasscode();
    if (!adminPasscode) {
      setPortfolioStatus("Log in again to upload.");
      return;
    }

    const title = String(portfolioTitleInput?.value || "").trim();
    const description = String(portfolioDescriptionInput?.value || "").trim();
    const details = String(portfolioDetailsInput?.value || "").trim();
    const files = getChosenFilesFromInput(portfolioFolderInput);
    const isEditing = Boolean(editingPortfolioId);

    if (!title || !description) {
      setPortfolioStatus("Title and description are required.");
      return;
    }
    if (!isEditing && files.length === 0) {
      setPortfolioStatus("Choose a folder with media files.");
      return;
    }
    if (!files.every(isSupportedPortfolioMediaFile)) {
      setPortfolioStatus("Portfolio supports image, video, and audio files.");
      return;
    }

    try {
      setPortfolioStatus(isEditing ? "Saving portfolio changes..." : "Uploading portfolio project...");
      const payload = { title, description, details };
      if (files.length > 0) {
        const media = [];
        for (const file of files) {
          const dataUrl = await fileToDataUrl(file);
          media.push({
            type: file.type,
            dataUrl,
            name: String(file.webkitRelativePath || file.name || ""),
          });
        }
        payload.media = media;
      }

      if (isEditing) {
        await savePortfolioEditWithFallback(editingPortfolioId, payload, adminPasscode);
      } else {
        await apiRequest("/api/portfolio", {
          method: "POST",
          headers: { "x-admin-passcode": adminPasscode },
          body: JSON.stringify(payload),
        });
      }

      resetPortfolioEditMode();
      setPortfolioStatus(isEditing ? "Portfolio project updated." : "Portfolio project published.");
      await loadData();
    } catch (error) {
      setPortfolioStatus(error.message || "Portfolio save failed.");
    }
  });
}

if (portfolioCancelEditBtn) {
  portfolioCancelEditBtn.addEventListener("click", () => {
    resetPortfolioEditMode();
    setPortfolioStatus("Portfolio edit canceled.");
  });
}

if (uploadForm) {
  uploadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!isAdmin) {
      setUploadStatus("Admin login required.");
      return;
    }

    const adminPasscode = getAdminPasscode();
    if (!adminPasscode) {
      setUploadStatus("Log in again to upload.");
      return;
    }

    const formData = new FormData(uploadForm);
    const name = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const details = String(formData.get("details") || "").trim();
    const year = String(formData.get("year") || "").trim();
    const price = Number(formData.get("price"));
    const buyUrlRaw = String(formData.get("buyUrl") || "").trim();
    const buyUrl = buyUrlRaw || null;
    const status = String(formData.get("status") || "live").toLowerCase();
    const avxColor = String(formData.get("avxColor") || "").toLowerCase();
    const avxItem = String(formData.get("avxItem") || "").toLowerCase();
    const avxSize = String(formData.get("avxSize") || "").toUpperCase();
    const avxSeason = String(formData.get("avxSeason") || "").toLowerCase();
    const avxYear = Number(formData.get("avxYear"));
    const avxId = generateAvxId({ avxColor, avxItem, avxSize, avxSeason, avxYear });
    const archiveSeason = String(formData.get("archiveSeason") || "").toUpperCase();
    const archiveYear = Number(formData.get("archiveYear"));
    const variations = readVariationsFromForm();
    const files = getChosenFiles(formData);

    if (!name || !description || !details || !year || Number.isNaN(price)) {
      setUploadStatus("Fill all required fields.");
      return;
    }
    if (status !== "live" && status !== "archive") {
      setUploadStatus("Status must be live or archive.");
      return;
    }
    if (!avxId) {
      setUploadStatus("AVX ID inputs are invalid.");
      return;
    }
    if (status === "archive") {
      if (!(archiveSeason === "FW" || archiveSeason === "SS") || !Number.isInteger(archiveYear)) {
        setUploadStatus("Archive products need season and year.");
        return;
      }
    }

    if (!editingProductId && files.length === 0) {
      setUploadStatus("Add at least one media file.");
      return;
    }

    if (files.length > 0 && !files.every(isSupportedMediaFile)) {
      setUploadStatus("Only image/video files are supported.");
      return;
    }

    try {
      const isEditing = Boolean(editingProductId);
      setUploadStatus(isEditing ? "Saving changes..." : "Publishing...");
      let media = null;

      if (files.length > 0) {
        media = [];
        for (const file of files) {
          const dataUrl = await fileToDataUrl(file);
          media.push({ type: file.type, dataUrl });
        }
      }

      const payload = {
        name,
        description,
        details,
        year,
        price,
        buyUrl,
        status,
        avxColor,
        avxItem,
        avxSize,
        avxSeason,
        avxYear,
        avxId,
        archiveSeason: status === "archive" ? archiveSeason : null,
        archiveYear: status === "archive" ? archiveYear : null,
        variations,
      };

      if (media) {
        payload.media = media;
      }

      if (isEditing) {
        await apiRequest("/api/products/update", {
          method: "POST",
          headers: { "x-admin-passcode": adminPasscode },
          body: JSON.stringify({ id: editingProductId, ...payload }),
        });
      } else {
        await apiRequest("/api/products", {
          method: "POST",
          headers: { "x-admin-passcode": adminPasscode },
          body: JSON.stringify(payload),
        });
      }

      await loadData();
      resetEditMode();
      setUploadStatus(isEditing ? "Listing updated." : "Published.");
    } catch (error) {
      setUploadStatus(error.message || "Save failed.");
    }
  });
}

if (detailCloseBtn && detailDialog) {
  detailCloseBtn.addEventListener("click", () => detailDialog.close());
}

if (detailPrevBtn) {
  detailPrevBtn.addEventListener("click", () => {
    if (!activeDetailItem) return;
    const total = activeDetailItem.media.length;
    if (total < 2) return;
    activeMediaIndex = (activeMediaIndex - 1 + total) % total;
    renderDetailMedia();
  });
}

if (detailNextBtn) {
  detailNextBtn.addEventListener("click", () => {
    if (!activeDetailItem) return;
    const total = activeDetailItem.media.length;
    if (total < 2) return;
    activeMediaIndex = (activeMediaIndex + 1) % total;
    renderDetailMedia();
  });
}

if (detailBuyBtn) {
  detailBuyBtn.addEventListener("click", async () => {
    if (!activeDetailItem) return;
    const selectedSize = getSelectedSizeForDetail();
    if (selectedSize === null) return;
    await buyProduct(activeDetailItem.id, selectedSize);
  });
}

if (detailAddToCartBtn) {
  detailAddToCartBtn.addEventListener("click", () => {
    if (!activeDetailItem) return;
    const selectedSize = getSelectedSizeForDetail();
    if (selectedSize === null) return;
    addToCart(activeDetailItem.id, selectedSize, 1);
  });
}

if (detailEditBtn) {
  detailEditBtn.addEventListener("click", () => {
    if (!isAdmin || !activeDetailItem) return;
    if (activeDetailType === "portfolio") {
      startEditingPortfolio(activeDetailItem);
    } else {
      startEditingProduct(activeDetailItem);
    }
    detailDialog.close();
  });
}

if (detailSizeSelect) {
  detailSizeSelect.addEventListener("change", () => {
    if (!activeDetailItem || !hasVariations(activeDetailItem) || !detailSizeHint) return;
    const selected = String(detailSizeSelect.value || "").trim();
    if (!selected) {
      detailSizeHint.textContent = "Size is required.";
      return;
    }
    const variation = getVariationBySize(activeDetailItem, selected);
    detailSizeHint.textContent = variation
      ? `${variation.quantity} in stock.`
      : "Selected size is not available.";
  });
}

async function loadData() {
  try {
    const [productData, portfolioData] = await Promise.all([
      apiRequest("/api/products"),
      apiRequest("/api/portfolio"),
    ]);
    uploadedProducts = Array.isArray(productData.products) ? productData.products : [];
    portfolioProjects = Array.isArray(portfolioData.projects) ? portfolioData.projects : [];
    pruneCart();
    renderHeroCarousel();
    renderProducts();
    renderHomeProducts();
    renderPortfolio();
    renderArchiveIndex();
    if (cartDialog && cartDialog.open) {
      renderCart();
    }
  } catch (error) {
    uploadedProducts = [];
    portfolioProjects = [];
    renderHeroCarousel(error.message || "Unable to load media.");
    renderProducts(error.message || "Unable to load products.");
    renderHomeProducts(error.message || "Unable to load products.");
    renderPortfolio(error.message || "Unable to load portfolio.");
    renderArchiveIndex(error.message || "Unable to load archive.");
  }
}

function renderHeroCarousel(errorMessage = "") {
  if (!heroTrack) return;

  heroTrack.innerHTML = "";

  if (errorMessage) {
    const fallback = document.createElement("div");
    fallback.className = "hero-item";
    fallback.innerHTML = `<p class="meta" style="padding:10px;">${escapeHtml(errorMessage)}</p>`;
    heroTrack.appendChild(fallback);
    return;
  }

  const bannerMedia = getBannerMediaSources();
  if (bannerMedia.length > 0) {
    const looped = bannerMedia.concat(bannerMedia);
    for (const src of looped) {
      const banner = document.createElement("article");
      banner.className = "hero-item hero-item-banner";
      banner.innerHTML = `<img src="${escapeAttr(src)}" alt="Banner" loading="eager" />`;
      heroTrack.appendChild(banner);
    }
    return;
  }

  const mediaItems = [];
  for (const product of getLiveProducts()) {
    const first = product.media && product.media[0] ? product.media[0] : null;
    if (first) mediaItems.push({ media: first, name: product.name });
  }

  if (mediaItems.length === 0) {
    const fallback = document.createElement("div");
    fallback.className = "hero-item";
    fallback.innerHTML = `<p class="meta" style="padding:10px;">No live media yet.</p>`;
    heroTrack.appendChild(fallback);
    return;
  }

  // Duplicate slides so the slow animation appears continuous.
  const loopItems = mediaItems.concat(mediaItems);
  for (const item of loopItems) {
    const slide = document.createElement("article");
    slide.className = "hero-item";
    slide.innerHTML = buildHeroMediaHtml(item.media, item.name);
    heroTrack.appendChild(slide);
  }
}

function buildHeroMediaHtml(mediaItem, name) {
  const dataUrl = escapeAttr(mediaItem.dataUrl || "");
  const label = escapeAttr(name || "Media");

  if (String(mediaItem.type || "").startsWith("video/")) {
    return `<video src="${dataUrl}" autoplay muted loop playsinline></video>`;
  }

  return `<img src="${dataUrl}" alt="${label}" loading="lazy" />`;
}

function renderProducts(errorMessage = "") {
  if (!productGrid) return;

  productGrid.innerHTML = "";
  const liveProducts = getLiveProducts();

  if (errorMessage) {
    const error = document.createElement("p");
    error.className = "meta";
    error.textContent = errorMessage;
    productGrid.appendChild(error);
    return;
  }

  if (liveProducts.length === 0) {
    const empty = document.createElement("p");
    empty.className = "meta";
    empty.textContent = "No live products yet.";
    productGrid.appendChild(empty);
    return;
  }

  for (const product of liveProducts) {
    const card = document.createElement("article");
    card.className = "product-card";

    const firstMedia = product.media && product.media[0] ? product.media[0] : null;
    const mediaHtml = firstMedia ? buildMediaHtml(firstMedia, product.name, true) : "";
    const statusLabel = isLiveProduct(product) ? "LIVE" : "ARCHIVE";
    const avxText = `${product.avxId || product.code || "AVX"} • ${statusLabel}`;

    card.innerHTML = `
      <button class="product-link" type="button" aria-label="${escapeHtml(product.code)} ${escapeHtml(product.name)}">
        <div class="product-image">${mediaHtml}</div>
        <p class="product-name">${escapeHtml(avxText)}</p>
      </button>
      <div class="product-actions">
        <button class="menu-btn product-cart-btn" type="button">Add to Cart</button>
        <button class="buy-btn product-buy-btn" type="button">Buy</button>
      </div>
    `;

    const openBtn = card.querySelector(".product-link");
    const cartBtn = card.querySelector(".product-cart-btn");
    const buyBtn = card.querySelector(".product-buy-btn");

    openBtn.addEventListener("click", () => openDetail(product.id));
    cartBtn.addEventListener("click", () => {
      if (hasVariations(product)) {
        openDetail(product.id);
        if (detailSizeHint) detailSizeHint.textContent = "Select a size before adding to cart.";
        return;
      }
      addToCart(product.id, "default", 1);
    });
    buyBtn.addEventListener("click", async () => {
      if (hasVariations(product)) {
        openDetail(product.id);
        if (detailSizeHint) detailSizeHint.textContent = "Select a size before buying.";
        return;
      }
      await buyProduct(product.id, "default");
    });

    productGrid.appendChild(card);
  }
}

function renderHomeProducts(errorMessage = "") {
  if (!homeProductsGrid) return;

  homeProductsGrid.innerHTML = "";
  const liveProducts = getLiveProducts();

  if (errorMessage) {
    const error = document.createElement("p");
    error.className = "meta";
    error.textContent = errorMessage;
    homeProductsGrid.appendChild(error);
    return;
  }

  if (liveProducts.length === 0) {
    const empty = document.createElement("p");
    empty.className = "meta";
    empty.textContent = "No live products yet.";
    homeProductsGrid.appendChild(empty);
    return;
  }

  for (const product of liveProducts) {
    const card = document.createElement("article");
    card.className = "product-card";

    const firstMedia = product.media && product.media[0] ? product.media[0] : null;
    const mediaHtml = firstMedia ? buildMediaHtml(firstMedia, product.name, true) : "";
    const statusLabel = isLiveProduct(product) ? "LIVE" : "ARCHIVE";
    const avxText = `${product.avxId || product.code || "AVX"} • ${statusLabel}`;

    card.innerHTML = `
      <button class="product-link" type="button" aria-label="${escapeHtml(product.code)} ${escapeHtml(product.name)}">
        <div class="product-image">${mediaHtml}</div>
        <p class="product-name">${escapeHtml(avxText)}</p>
      </button>
      <div class="product-actions">
        <button class="menu-btn product-cart-btn" type="button">Add to Cart</button>
        <button class="buy-btn product-buy-btn" type="button">Buy</button>
      </div>
    `;

    const openBtn = card.querySelector(".product-link");
    const cartBtn = card.querySelector(".product-cart-btn");
    const buyBtn = card.querySelector(".product-buy-btn");

    openBtn.addEventListener("click", () => openDetail(product.id));
    cartBtn.addEventListener("click", () => {
      if (hasVariations(product)) {
        openDetail(product.id);
        if (detailSizeHint) detailSizeHint.textContent = "Select a size before adding to cart.";
        return;
      }
      addToCart(product.id, "default", 1);
    });
    buyBtn.addEventListener("click", async () => {
      if (hasVariations(product)) {
        openDetail(product.id);
        if (detailSizeHint) detailSizeHint.textContent = "Select a size before buying.";
        return;
      }
      await buyProduct(product.id, "default");
    });

    homeProductsGrid.appendChild(card);
  }
}

function renderPortfolio(errorMessage = "") {
  if (!portfolioGrid) return;

  portfolioGrid.innerHTML = "";
  if (errorMessage) {
    const error = document.createElement("p");
    error.className = "meta";
    error.textContent = errorMessage;
    portfolioGrid.appendChild(error);
    return;
  }

  if (portfolioProjects.length === 0) {
    const empty = document.createElement("p");
    empty.className = "meta";
    empty.textContent = "No portfolio projects yet.";
    portfolioGrid.appendChild(empty);
    return;
  }

  for (const project of portfolioProjects) {
    const card = document.createElement("article");
    card.className = "product-card";

    const firstMedia = project.media && project.media[0] ? project.media[0] : null;
    const mediaHtml = firstMedia ? buildMediaHtml(firstMedia, project.title, true) : "";
    const projectLabel = String(project.title || "Portfolio Project");

    card.innerHTML = `
      <button class="product-link" type="button" aria-label="${escapeHtml(projectLabel)}">
        <div class="product-image">${mediaHtml}</div>
        <p class="product-name">${escapeHtml(projectLabel)}</p>
      </button>
    `;

    card.querySelector(".product-link").addEventListener("click", () => openPortfolioDetail(project.id));
    portfolioGrid.appendChild(card);
  }
}

function openDetail(itemId) {
  const item = uploadedProducts.find((entry) => entry.id === itemId);
  if (!item || !detailDialog) return;

  activeDetailType = "product";
  activeDetailItem = item;
  activeMediaIndex = 0;

  detailTitle.textContent = `${item.code} - ${item.name}`;
  detailMeta.textContent = `${item.year} • ${item.media.length} media item${item.media.length === 1 ? "" : "s"}`;
  detailDescription.textContent = item.description || "";
  detailFullText.textContent = item.details || "";
  detailPrice.textContent = formatUsd(item.price);
  if (detailEditBtn) detailEditBtn.hidden = !isAdmin;
  const live = isLiveProduct(item);
  if (detailBuyBtn) detailBuyBtn.hidden = !live;
  if (detailAddToCartBtn) detailAddToCartBtn.hidden = !live;
  syncDetailSizeUi(item);
  if (detailViewer) detailViewer.hidden = false;
  if (detailPortfolioMediaGrid) detailPortfolioMediaGrid.hidden = true;

  renderDetailMedia();
  detailDialog.showModal();
}

function openPortfolioDetail(projectId) {
  const project = portfolioProjects.find((entry) => entry.id === projectId);
  if (!project || !detailDialog) return;

  activeDetailType = "portfolio";
  activeDetailItem = project;
  activeMediaIndex = 0;

  detailTitle.textContent = project.title || "Portfolio Project";
  detailMeta.textContent = `${project.media.length} media item${project.media.length === 1 ? "" : "s"}`;
  detailDescription.textContent = project.description || "";
  detailFullText.textContent = project.details || "";
  detailPrice.textContent = "";
  if (detailEditBtn) detailEditBtn.hidden = !isAdmin;
  if (detailBuyBtn) detailBuyBtn.hidden = true;
  if (detailAddToCartBtn) detailAddToCartBtn.hidden = true;
  if (detailSizeRow) detailSizeRow.hidden = true;
  if (detailViewer) detailViewer.hidden = false;
  if (detailPortfolioMediaGrid) detailPortfolioMediaGrid.hidden = false;

  renderDetailMedia();
  detailDialog.showModal();
}

function renderArchiveIndex(errorMessage = "") {
  if (!archiveIndex) return;

  archiveIndex.innerHTML = "";
  if (errorMessage) {
    const error = document.createElement("p");
    error.className = "meta";
    error.textContent = errorMessage;
    archiveIndex.appendChild(error);
    return;
  }

  const products = getArchiveLayoutProducts();
  if (products.length === 0) {
    const empty = document.createElement("p");
    empty.className = "meta";
    empty.textContent = "No products yet.";
    archiveIndex.appendChild(empty);
    return;
  }

  for (const product of products) {
    const card = document.createElement("article");
    card.className = "archive-item";
    const firstMedia = product.media && product.media[0] ? product.media[0] : null;
    const mediaHtml = firstMedia ? buildMediaHtml(firstMedia, product.name, true) : "";
    const statusLabel = isLiveProduct(product) ? "LIVE" : "ARCHIVE";
    const avxText = `${product.avxId || product.code || "AVX"} • ${statusLabel}`;
    card.innerHTML = `
      <button class="product-link" type="button" aria-label="${escapeHtml(product.code)} ${escapeHtml(product.name)}">
        <div class="product-image">${mediaHtml}</div>
        <p class="product-name">${escapeHtml(avxText)}</p>
      </button>
    `;
    card.querySelector(".product-link").addEventListener("click", () => openDetail(product.id));
    archiveIndex.appendChild(card);
  }
}

function renderDetailMedia() {
  if (!activeDetailItem) return;

  if (activeDetailType === "portfolio") {
    if (detailMediaFrame) {
      const mediaItem = activeDetailItem.media[activeMediaIndex];
      detailMediaFrame.innerHTML = mediaItem
        ? buildMediaHtml(mediaItem, activeDetailItem.title || "Portfolio media", false)
        : "";
    }
    if (detailPrevBtn && detailNextBtn) {
      const disableNav = activeDetailItem.media.length < 2;
      detailPrevBtn.disabled = disableNav;
      detailNextBtn.disabled = disableNav;
    }
    renderPortfolioDetailMediaGrid();
    return;
  }
  if (!detailMediaFrame) return;

  const mediaItem = activeDetailItem.media[activeMediaIndex];
  detailMediaFrame.innerHTML = mediaItem
    ? buildMediaHtml(mediaItem, activeDetailItem.name, false)
    : "";

  const disableNav = activeDetailItem.media.length < 2;
  detailPrevBtn.disabled = disableNav;
  detailNextBtn.disabled = disableNav;
}

function renderPortfolioDetailMediaGrid() {
  if (!detailPortfolioMediaGrid || !activeDetailItem) return;
  detailPortfolioMediaGrid.innerHTML = "";

  const mediaItems = Array.isArray(activeDetailItem.media) ? activeDetailItem.media : [];
  if (mediaItems.length === 0) {
    const empty = document.createElement("p");
    empty.className = "meta";
    empty.textContent = "No media in this project.";
    detailPortfolioMediaGrid.appendChild(empty);
    return;
  }

  for (const mediaItem of mediaItems) {
    const tile = document.createElement("article");
    tile.className = "detail-portfolio-tile";
    if (mediaItems[activeMediaIndex] === mediaItem) {
      tile.classList.add("active");
    }
    tile.innerHTML = `
      <button class="detail-portfolio-tile-btn" type="button" aria-label="View media item">
        ${buildMediaHtml(mediaItem, activeDetailItem.title || "Portfolio media", true)}
      </button>
    `;
    const btn = tile.querySelector(".detail-portfolio-tile-btn");
    btn.addEventListener("click", () => {
      activeMediaIndex = mediaItems.indexOf(mediaItem);
      renderDetailMedia();
    });
    detailPortfolioMediaGrid.appendChild(tile);
  }
}

async function buyProduct(productId, size) {
  const product = uploadedProducts.find((entry) => entry.id === productId);
  if (!product) return;
  if (!isLiveProduct(product)) return;

  const orderSize = size || "default";
  if (product.buyUrl) {
    const checkoutUrl = new URL(product.buyUrl, window.location.origin);
    if (orderSize !== "default") {
      checkoutUrl.searchParams.set("size", orderSize);
    }
    window.open(checkoutUrl.toString(), "_blank", "noreferrer");
    return;
  }

  try {
    await apiRequest("/api/orders", {
      method: "POST",
      body: JSON.stringify({ productId, size: orderSize, quantity: 1 }),
    });
  } catch (error) {
    alert(error.message || "Could not place order.");
  }
}

function buildMediaHtml(mediaItem, name, lazy) {
  const dataUrl = escapeAttr(mediaItem.dataUrl || "");
  const label = escapeAttr(name || "Media");

  if (String(mediaItem.type || "").startsWith("video/")) {
    return `<video src="${dataUrl}" controls playsinline></video>`;
  }
  if (String(mediaItem.type || "").startsWith("audio/")) {
    return `<div class="meta">Audio File</div><audio src="${dataUrl}" controls></audio>`;
  }

  return `<img src="${dataUrl}" alt="${label}" ${lazy ? "loading=\"lazy\"" : ""} />`;
}

function isLiveProduct(product) {
  return String(product?.status || "live").toLowerCase() === "live";
}

function isArchiveProduct(product) {
  return String(product?.status || "").toLowerCase() === "archive";
}

function getLiveProducts() {
  return uploadedProducts.filter((product) => isLiveProduct(product));
}

function getArchiveProducts() {
  const seasonRank = { FW: 2, SS: 1 };
  return uploadedProducts
    .filter((product) => isArchiveProduct(product))
    .sort((a, b) => {
      const yearA = Number(a.archiveYear || 0);
      const yearB = Number(b.archiveYear || 0);
      if (yearA !== yearB) return yearB - yearA;
      const seasonA = seasonRank[String(a.archiveSeason || "").toUpperCase()] || 0;
      const seasonB = seasonRank[String(b.archiveSeason || "").toUpperCase()] || 0;
      return seasonB - seasonA;
    });
}

function getArchiveLayoutProducts() {
  return [...uploadedProducts]
    .sort((a, b) => getArchiveSortValue(a) - getArchiveSortValue(b))
    .slice(0, 250);
}

function getArchiveSortValue(product) {
  const seasonRank = { SS: 0, FW: 1 };
  const season = String(product.archiveSeason || "").toUpperCase();
  const year = Number(product.archiveYear);
  if (Number.isInteger(year) && (season === "SS" || season === "FW")) {
    return year * 10 + seasonRank[season];
  }
  const fallbackYear = Number(product.year);
  if (Number.isInteger(fallbackYear)) return fallbackYear * 10 + 9;
  const createdAt = Date.parse(product.createdAt || "");
  if (!Number.isNaN(createdAt)) return createdAt;
  return Number.MAX_SAFE_INTEGER;
}

function getArchiveDateLabel(product) {
  const formatted = formatArchiveLabel(product.archiveSeason, product.archiveYear);
  if (formatted !== "archive") return formatted.toLowerCase();
  const y = Number(product.year);
  return Number.isInteger(y) ? String(y) : "undated";
}

function loadArchiveZoom() {
  const value = Number(localStorage.getItem(ARCHIVE_ZOOM_KEY) || "100");
  if (!Number.isFinite(value)) return 100;
  return Math.min(220, Math.max(40, Math.round(value)));
}

function setArchiveZoom(value, persist = true) {
  archiveZoom = Math.min(220, Math.max(40, Math.round(value)));
  if (archiveIndex) {
    archiveIndex.style.setProperty("--archive-cell-size", `${archiveZoom}px`);
  }
  if (persist) {
    localStorage.setItem(ARCHIVE_ZOOM_KEY, String(archiveZoom));
  }
}

function setupArchivePinchZoom() {
  if (!archiveIndex) return;

  // Trackpad pinch in Chrome surfaces as wheel with ctrlKey.
  archiveIndex.addEventListener("wheel", (event) => {
    if (!event.ctrlKey) return;
    event.preventDefault();
    applyArchiveZoomDelta(-event.deltaY / 120);
  }, { passive: false });

  // Touchscreen pinch zoom.
  archiveIndex.addEventListener("touchstart", (event) => {
    if (event.touches.length !== 2) return;
    archiveTouchDistance = getTouchDistance(event.touches);
  }, { passive: true });

  archiveIndex.addEventListener("touchmove", (event) => {
    if (event.touches.length !== 2) return;
    if (archiveTouchDistance === null) {
      archiveTouchDistance = getTouchDistance(event.touches);
      return;
    }
    const nextDistance = getTouchDistance(event.touches);
    if (!nextDistance || !archiveTouchDistance) return;
    const scale = nextDistance / archiveTouchDistance;
    const delta = (scale - 1) * 50;
    applyArchiveZoomDelta(delta);
    archiveTouchDistance = nextDistance;
  }, { passive: true });

  archiveIndex.addEventListener("touchend", () => {
    archiveTouchDistance = null;
  }, { passive: true });
}

function getTouchDistance(touches) {
  if (!touches || touches.length < 2) return null;
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function applyArchiveZoomDelta(deltaUnits) {
  const sensitivity = Math.max(0, Math.min(100, ARCHIVE_ZOOM_SENSITIVITY)) / 100;
  const scaledDelta = deltaUnits * 18 * sensitivity;
  setArchiveZoom(archiveZoom + scaledDelta);
}

function formatArchiveLabel(season, year) {
  const normalizedSeason = String(season || "").toUpperCase();
  const y = Number(year);
  if ((normalizedSeason !== "FW" && normalizedSeason !== "SS") || !Number.isInteger(y)) {
    return "archive";
  }
  return `${normalizedSeason}/${String(y).slice(-2)}`;
}

function getVariations(product) {
  return Array.isArray(product?.variations) ? product.variations : [];
}

function hasVariations(product) {
  return getVariations(product).length > 0;
}

function getVariationBySize(product, size) {
  const variations = getVariations(product);
  return variations.find((variation) => String(variation.size) === String(size)) || null;
}

function syncDetailSizeUi(product) {
  if (!detailSizeRow || !detailSizeSelect || !detailSizeHint) return;

  const variations = getVariations(product);
  if (variations.length === 0) {
    detailSizeRow.hidden = true;
    detailSizeSelect.innerHTML = "";
    detailSizeHint.textContent = "";
    return;
  }

  detailSizeRow.hidden = false;
  detailSizeSelect.innerHTML = `<option value="">Choose size</option>`;

  for (const variation of variations) {
    const option = document.createElement("option");
    option.value = String(variation.size);
    option.textContent = `${variation.size} (${variation.quantity} available)`;
    detailSizeSelect.appendChild(option);
  }

  detailSizeHint.textContent = "Size is required.";
}

function getSelectedSizeForDetail() {
  if (!activeDetailItem) return null;
  if (!hasVariations(activeDetailItem)) return "default";

  const selected = String(detailSizeSelect?.value || "").trim();
  if (!selected) {
    if (detailSizeHint) detailSizeHint.textContent = "Please select a size.";
    return null;
  }

  const variation = getVariationBySize(activeDetailItem, selected);
  if (!variation) {
    if (detailSizeHint) detailSizeHint.textContent = "Selected size is not available.";
    return null;
  }

  if (Number(variation.quantity) <= 0) {
    if (detailSizeHint) detailSizeHint.textContent = "Selected size is sold out.";
    return null;
  }

  if (detailSizeHint) detailSizeHint.textContent = `${variation.quantity} in stock.`;
  return selected;
}

function loadCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => ({
        productId: String(item.productId || ""),
        size: String(item.size || ""),
        quantity: Number(item.quantity || 0),
      }))
      .filter((item) => item.productId && item.size && Number.isInteger(item.quantity) && item.quantity > 0);
  } catch {
    return [];
  }
}

function persistCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
}

function getCartCount() {
  return cartItems.reduce((sum, item) => sum + item.quantity, 0);
}

function updateBagUi() {
  if (!bagEl) return;
  bagEl.textContent = `BAG (${getCartCount()})`;
}

function addToCart(productId, size, quantity) {
  const product = uploadedProducts.find((entry) => entry.id === productId);
  if (!product) return;
  if (!isLiveProduct(product)) return;

  const cartSize = size || "default";
  if (hasVariations(product)) {
    const variation = getVariationBySize(product, cartSize);
    if (!variation) {
      if (cartStatus) cartStatus.textContent = "Select a valid size.";
      return;
    }
    const alreadyInCart = cartItems
      .filter((item) => item.productId === productId && item.size === cartSize)
      .reduce((sum, item) => sum + item.quantity, 0);
    if (alreadyInCart + quantity > Number(variation.quantity)) {
      if (cartStatus) cartStatus.textContent = "Not enough stock for selected size.";
      return;
    }
  }

  const found = cartItems.find((item) => item.productId === productId && item.size === cartSize);
  if (found) {
    found.quantity += quantity;
  } else {
    cartItems.push({ productId, size: cartSize, quantity });
  }

  persistCart();
  updateBagUi();
  if (cartStatus) cartStatus.textContent = `${product.name} added to cart.`;
}

function setCartQuantity(productId, size, quantity) {
  let nextQty = Math.max(0, Math.floor(quantity));
  const index = cartItems.findIndex((item) => item.productId === productId && item.size === size);
  if (index === -1) return;

  const product = uploadedProducts.find((entry) => entry.id === productId);
  if (product && hasVariations(product)) {
    const variation = getVariationBySize(product, size);
    if (variation) {
      nextQty = Math.min(nextQty, Number(variation.quantity));
    }
  }

  if (nextQty === 0) {
    cartItems.splice(index, 1);
  } else {
    cartItems[index].quantity = nextQty;
  }

  persistCart();
  updateBagUi();
  renderCart();
}

function pruneCart() {
  const validIds = new Set(uploadedProducts.map((entry) => entry.id));
  const before = cartItems.length;
  cartItems = cartItems.filter((item) => {
    if (!validIds.has(item.productId)) return false;
    const product = uploadedProducts.find((entry) => entry.id === item.productId);
    if (!product) return false;
    if (!isLiveProduct(product)) return false;
    if (!hasVariations(product)) return item.size === "default";
    return getVariationBySize(product, item.size) !== null;
  });
  if (cartItems.length !== before) {
    persistCart();
    updateBagUi();
  }
}

function getCartSubtotal() {
  return cartItems.reduce((sum, item) => {
    const product = uploadedProducts.find((entry) => entry.id === item.productId);
    if (!product) return sum;
    return sum + Number(product.price || 0) * item.quantity;
  }, 0);
}

function openCartDialog() {
  renderCart();
  if (cartStatus) cartStatus.textContent = "";
  if (cartDialog) cartDialog.showModal();
}

function renderCart() {
  if (!cartItemsEl || !cartEmptyEl || !cartSubtotalEl || !cartCheckoutBtn) return;

  cartItemsEl.innerHTML = "";
  if (cartItems.length === 0) {
    cartEmptyEl.hidden = false;
    cartSubtotalEl.textContent = "";
    cartCheckoutBtn.disabled = true;
    return;
  }

  cartEmptyEl.hidden = true;
  cartCheckoutBtn.disabled = false;

  for (const item of cartItems) {
    const product = uploadedProducts.find((entry) => entry.id === item.productId);
    if (!product) continue;

    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div class="cart-item-main">
        <p class="product-name">${escapeHtml(product.code)} - ${escapeHtml(product.name)}</p>
        <p class="meta">Size: ${escapeHtml(item.size)}</p>
        <p class="meta">${escapeHtml(formatUsd(product.price))} each</p>
      </div>
      <div class="cart-item-controls">
        <button class="menu-btn cart-dec-btn" type="button" aria-label="Decrease quantity">-</button>
        <span>${item.quantity}</span>
        <button class="menu-btn cart-inc-btn" type="button" aria-label="Increase quantity">+</button>
        <button class="menu-btn cart-remove-btn" type="button">Remove</button>
      </div>
    `;

    row.querySelector(".cart-dec-btn").addEventListener("click", () => {
      setCartQuantity(item.productId, item.size, item.quantity - 1);
    });
    row.querySelector(".cart-inc-btn").addEventListener("click", () => {
      setCartQuantity(item.productId, item.size, item.quantity + 1);
    });
    row.querySelector(".cart-remove-btn").addEventListener("click", () => {
      setCartQuantity(item.productId, item.size, 0);
    });

    cartItemsEl.appendChild(row);
  }

  cartSubtotalEl.textContent = `Subtotal: ${formatUsd(getCartSubtotal())}`;
}

async function checkoutCart() {
  if (cartItems.length === 0) {
    if (cartStatus) cartStatus.textContent = "Cart is empty.";
    return;
  }

  if (cartStatus) cartStatus.textContent = "Processing checkout...";

  try {
    for (const item of cartItems) {
      const product = uploadedProducts.find((entry) => entry.id === item.productId);
      if (!product) continue;

      if (product.buyUrl) {
        const checkoutUrl = new URL(product.buyUrl, window.location.origin);
        if (item.size !== "default") checkoutUrl.searchParams.set("size", item.size);
        checkoutUrl.searchParams.set("quantity", String(item.quantity));
        window.open(checkoutUrl.toString(), "_blank", "noreferrer");
        continue;
      }

      await apiRequest("/api/orders", {
        method: "POST",
        body: JSON.stringify({ productId: item.productId, size: item.size, quantity: item.quantity }),
      });
    }

    cartItems = [];
    persistCart();
    updateBagUi();
    renderCart();
    if (cartStatus) cartStatus.textContent = "Checkout complete.";
  } catch (error) {
    if (cartStatus) cartStatus.textContent = error.message || "Checkout failed.";
  }
}

function updateAdminUi() {
  if (isAdmin && !getAdminPasscode()) {
    isAdmin = false;
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }

  if (adminLoginBtn) adminLoginBtn.hidden = isAdmin;
  if (adminLogoutBtn) adminLogoutBtn.hidden = !isAdmin;
  if (uploadToggleBtn) uploadToggleBtn.hidden = !isAdmin;
  if (detailEditBtn) detailEditBtn.hidden = !isAdmin;
  if (experienceForm) experienceForm.hidden = !isAdmin;
  if (portfolioForm) portfolioForm.hidden = !isAdmin;

  if (!isAdmin) {
    resetEditMode();
    resetPortfolioEditMode();
    closeUploadPanel();
    setUploadStatus("");
    setPortfolioStatus("");
  }
}

function setExperienceStatus(message) {
  if (experienceStatus) experienceStatus.textContent = message;
}

function setPortfolioStatus(message) {
  if (portfolioStatus) portfolioStatus.textContent = message;
}

function startEditingPortfolio(project) {
  editingPortfolioId = project.id;

  if (portfolioPanelTitle) portfolioPanelTitle.textContent = "Edit Portfolio Project";
  if (portfolioSubmitBtn) portfolioSubmitBtn.textContent = "Save Portfolio Changes";
  if (portfolioCancelEditBtn) portfolioCancelEditBtn.hidden = false;
  if (portfolioFolderInput) portfolioFolderInput.required = false;

  if (portfolioTitleInput) portfolioTitleInput.value = project.title || "";
  if (portfolioDescriptionInput) portfolioDescriptionInput.value = project.description || "";
  if (portfolioDetailsInput) portfolioDetailsInput.value = project.details || "";

  window.location.hash = "#upload";
  setPortfolioStatus("Leave media folder empty to keep existing media.");
}

function resetPortfolioEditMode() {
  editingPortfolioId = null;
  if (portfolioForm) portfolioForm.reset();
  if (portfolioPanelTitle) portfolioPanelTitle.textContent = "Portfolio Upload";
  if (portfolioSubmitBtn) portfolioSubmitBtn.textContent = "Publish Portfolio Project";
  if (portfolioCancelEditBtn) portfolioCancelEditBtn.hidden = true;
  if (portfolioFolderInput) portfolioFolderInput.required = true;
}

function closeUploadPanel() {
  if (window.location.hash === "#upload") {
    window.location.hash = "#home";
  }
}

function startEditingProduct(product) {
  editingProductId = product.id;

  if (uploadPanelTitle) uploadPanelTitle.textContent = "Edit Listing";
  if (uploadSubmitBtn) uploadSubmitBtn.textContent = "Save Changes";
  if (uploadCancelEditBtn) uploadCancelEditBtn.hidden = false;
  if (mediaInput) mediaInput.required = false;

  if (titleInput) titleInput.value = product.name || "";
  if (descriptionInput) descriptionInput.value = product.description || "";
  if (detailsInput) detailsInput.value = product.details || "";
  if (yearInput) yearInput.value = product.year || "";
  if (priceInput) priceInput.value = String(product.price ?? "");
  if (buyUrlInput) buyUrlInput.value = product.buyUrl || "";
  if (avxColorInput) avxColorInput.value = String(product.avxColor || "blk").toLowerCase();
  if (avxItemInput) avxItemInput.value = String(product.avxItem || "ts").toLowerCase();
  if (avxSizeInput) avxSizeInput.value = String(product.avxSize || "M").toUpperCase();
  if (avxSeasonInput) avxSeasonInput.value = String(product.avxSeason || "fw").toLowerCase();
  if (avxYearInput) avxYearInput.value = String(normalizeTwoDigitYear(product.avxYear) ?? 26);
  syncAvxId();
  if (statusInput) statusInput.value = String(product.status || "live").toLowerCase();
  if (archiveSeasonInput) archiveSeasonInput.value = String(product.archiveSeason || "FW").toUpperCase();
  if (archiveYearInput) archiveYearInput.value = String(product.archiveYear || product.year || "2026");
  syncArchiveMetaVisibility(statusInput?.value || "live");
  setVariationsInForm(product.variations || []);

  window.location.hash = "#upload";

  setUploadStatus("Leave media empty to keep current media.");
}

function resetEditMode() {
  editingProductId = null;
  if (uploadForm) uploadForm.reset();
  setVariationsInForm([]);
  if (uploadPanelTitle) uploadPanelTitle.textContent = "Add New Work";
  if (uploadSubmitBtn) uploadSubmitBtn.textContent = "Publish";
  if (uploadCancelEditBtn) uploadCancelEditBtn.hidden = true;
  if (mediaInput) mediaInput.required = true;
  if (statusInput) statusInput.value = "live";
  if (avxColorInput) avxColorInput.value = "blk";
  if (avxItemInput) avxItemInput.value = "ts";
  if (avxSizeInput) avxSizeInput.value = "M";
  if (avxSeasonInput) avxSeasonInput.value = "fw";
  if (avxYearInput) avxYearInput.value = "26";
  syncAvxId();
  if (archiveSeasonInput) archiveSeasonInput.value = "FW";
  if (archiveYearInput) archiveYearInput.value = "2026";
  syncArchiveMetaVisibility("live");
}

function syncArchiveMetaVisibility(statusValue) {
  const isArchive = String(statusValue || "").toLowerCase() === "archive";
  if (archiveMetaFields) archiveMetaFields.hidden = !isArchive;
  if (archiveSeasonInput) archiveSeasonInput.required = isArchive;
  if (archiveYearInput) archiveYearInput.required = isArchive;
}

function syncAvxId() {
  if (!avxIdInput) return;
  const avxId = generateAvxId({
    avxColor: avxColorInput?.value,
    avxItem: avxItemInput?.value,
    avxSize: avxSizeInput?.value,
    avxSeason: avxSeasonInput?.value,
    avxYear: avxYearInput?.value,
  });
  avxIdInput.value = avxId || "";
}

function normalizeTwoDigitYear(value) {
  const year = Number(value);
  if (!Number.isInteger(year) || year < 0 || year > 99) return null;
  return year;
}

function generateAvxId(input) {
  const validColors = new Set(["blk", "wht", "grn", "gry", "pnk"]);
  const validItems = new Set(["ts", "hd", "sw", "sp", "trkp"]);
  const validSizes = new Set(["S", "M", "L", "XL"]);
  const validSeasons = new Set(["fw", "ss"]);

  const color = String(input.avxColor || "").toLowerCase();
  const item = String(input.avxItem || "").toLowerCase();
  const size = String(input.avxSize || "").toUpperCase();
  const season = String(input.avxSeason || "").toLowerCase();
  const year = normalizeTwoDigitYear(input.avxYear);

  if (!validColors.has(color) || !validItems.has(item) || !validSizes.has(size) || !validSeasons.has(season) || year === null) {
    return "";
  }

  return `${color.toUpperCase()}${item.toUpperCase()}${size}${season.toUpperCase()}${String(year).padStart(2, "0")}`;
}

function addVariantRow(size = "", quantity = 0) {
  if (!variantRows) return;

  const row = document.createElement("div");
  row.className = "variant-row";
  row.innerHTML = `
    <input class="variant-size" type="text" placeholder="Size (S, M, L)" value="${escapeAttr(size)}" />
    <input class="variant-qty" type="number" min="0" step="1" value="${Number(quantity) || 0}" />
    <button type="button" class="menu-btn variant-remove-btn">Remove</button>
  `;

  row.querySelector(".variant-remove-btn").addEventListener("click", () => {
    row.remove();
    ensureAtLeastOneVariantRow();
  });

  variantRows.appendChild(row);
}

function ensureAtLeastOneVariantRow() {
  if (!variantRows) return;
  if (variantRows.children.length === 0) {
    addVariantRow("", 0);
  }
}

function setVariationsInForm(variations) {
  if (!variantRows) return;
  variantRows.innerHTML = "";

  if (Array.isArray(variations) && variations.length > 0) {
    for (const variant of variations) {
      addVariantRow(String(variant.size || ""), Number(variant.quantity || 0));
    }
    return;
  }

  addVariantRow("", 0);
}

function readVariationsFromForm() {
  if (!variantRows) return [];

  const rows = Array.from(variantRows.querySelectorAll(".variant-row"));
  const variations = [];

  for (const row of rows) {
    const sizeInput = row.querySelector(".variant-size");
    const qtyInput = row.querySelector(".variant-qty");
    const size = String(sizeInput?.value || "").trim();
    const quantity = Number(qtyInput?.value || 0);

    if (!size) continue;
    if (!Number.isInteger(quantity) || quantity < 0) continue;

    variations.push({ size, quantity });
  }

  return variations;
}

function setUploadStatus(message) {
  if (uploadStatus) uploadStatus.textContent = message;
}

function getChosenFiles(formData) {
  const result = [];
  for (const value of formData.getAll("media")) {
    if (value instanceof File && value.size > 0) {
      result.push(value);
    }
  }
  return result;
}

function getChosenFilesFromInput(inputEl) {
  if (!inputEl || !inputEl.files) return [];
  return Array.from(inputEl.files).filter((file) => file instanceof File && file.size > 0);
}

function isSupportedMediaFile(file) {
  return file.type.startsWith("image/") || file.type.startsWith("video/");
}

function isSupportedPortfolioMediaFile(file) {
  const type = String(file.type || "");
  return type.startsWith("image/") || type.startsWith("video/") || type.startsWith("audio/");
}

function isMp3File(file) {
  const type = String(file.type || "").toLowerCase();
  const name = String(file.name || "").toLowerCase();
  return type === "audio/mpeg" || type === "audio/mp3" || name.endsWith(".mp3");
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function sanitizeFileName(name) {
  return String(name || "file")
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "file";
}

async function uploadExperienceFileToStorage(file, folder) {
  requireSupabase();
  const bucket = SUPABASE_MEDIA_BUCKET;
  if (!bucket) throw makeApiError(500, "Supabase media bucket is not configured.");

  const extension = sanitizeFileName(file.name || "upload");
  const path = `${String(folder || "experience")}/${Date.now()}-${Math.random().toString(16).slice(2)}-${extension}`;
  const { error: uploadError } = await supabaseClient.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type || undefined });

  if (uploadError) throw makeApiError(500, uploadError.message || "Failed to upload media.");

  const { data } = supabaseClient.storage.from(bucket).getPublicUrl(path);
  if (!data?.publicUrl) throw makeApiError(500, "Failed to generate public URL.");
  return data.publicUrl;
}

function formatUsd(value) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

async function apiRequest(path, options = {}) {
  if (SUPABASE_ENABLED) {
    return supabaseApiRequest(path, options);
  }
  return httpApiRequest(path, options);
}

async function httpApiRequest(path, options = {}) {
  const target = path.startsWith("http") ? path : `${API_BASE}${path}`;
  let response;
  try {
    response = await fetch(target, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch {
    throw new Error("Cannot reach server. Check that backend is running.");
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = payload && payload.error
      ? payload.error
      : `Request failed (${response.status}${response.statusText ? ` ${response.statusText}` : ""})`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return payload;
}

function parseRequestJsonBody(options) {
  if (!options || options.body === undefined || options.body === null || options.body === "") return {};
  if (typeof options.body === "string") {
    try {
      return JSON.parse(options.body);
    } catch {
      throw makeApiError(400, "Invalid JSON payload.");
    }
  }
  if (typeof options.body === "object") return options.body;
  return {};
}

function makeApiError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function requireSupabase() {
  if (!supabaseClient) throw makeApiError(500, "Supabase client is not configured.");
}

function normalizeMethod(method) {
  return String(method || "GET").toUpperCase();
}

function randomId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

async function fetchSiteSettingsData() {
  requireSupabase();
  const { data, error } = await supabaseClient
    .from("app_site_settings")
    .select("id,data")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw makeApiError(500, error.message || "Failed to load site settings.");
  return data && data.data && typeof data.data === "object" ? data.data : {};
}

async function saveSiteSettingsData(settingsData) {
  requireSupabase();
  const { error } = await supabaseClient
    .from("app_site_settings")
    .upsert({ id: 1, data: settingsData }, { onConflict: "id" });
  if (error) throw makeApiError(500, error.message || "Failed to save site settings.");
}

async function assertSupabaseAdmin() {
  requireSupabase();
  const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
  if (sessionError) throw makeApiError(500, sessionError.message || "Failed to read session.");
  const userId = sessionData?.session?.user?.id || "";
  if (!userId) throw makeApiError(401, "Unauthorized.");

  const { data: adminRow, error: adminError } = await supabaseClient
    .from("app_admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (adminError) throw makeApiError(500, adminError.message || "Failed to verify admin access.");
  if (!adminRow) throw makeApiError(403, "Admin access required.");
}

function materializeRow(row) {
  const data = row && row.data && typeof row.data === "object" ? row.data : {};
  return {
    ...data,
    id: String(data.id || row.id || ""),
    createdAt: String(data.createdAt || row.created_at || ""),
    updatedAt: data.updatedAt ? String(data.updatedAt) : (row.updated_at ? String(row.updated_at) : undefined),
  };
}

function productIdFromPath(path) {
  const match = String(path || "").match(/^\/api\/products\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : "";
}

function portfolioIdFromPath(path) {
  const match = String(path || "").match(/^\/api\/portfolio\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : "";
}

function makeProductCodeFromCount(count) {
  const base = 220 + Number(count || 0) + 1;
  return `AVELI-${String(base).padStart(3, "0")}`;
}

async function loadAllProductsFromSupabase() {
  requireSupabase();
  const { data, error } = await supabaseClient
    .from("app_products")
    .select("id,data,created_at,updated_at")
    .order("created_at", { ascending: false });
  if (error) throw makeApiError(500, error.message || "Failed to load products.");
  return Array.isArray(data) ? data.map(materializeRow) : [];
}

async function loadAllPortfolioFromSupabase() {
  requireSupabase();
  const { data, error } = await supabaseClient
    .from("app_portfolio")
    .select("id,data,created_at,updated_at")
    .order("created_at", { ascending: false });
  if (error) throw makeApiError(500, error.message || "Failed to load portfolio.");
  return Array.isArray(data) ? data.map(materializeRow) : [];
}

async function supabaseApiRequest(path, options = {}) {
  requireSupabase();
  const method = normalizeMethod(options.method);
  const headers = options.headers || {};
  const body = parseRequestJsonBody(options);

  if (path === "/api/health" && method === "GET") {
    return { ok: true };
  }

  if (path === "/api/admin/login" && method === "POST") {
    const passcode = String(body.passcode || "").trim();
    if (!SUPABASE_ADMIN_EMAIL) {
      throw makeApiError(500, "SUPABASE_ADMIN_EMAIL is not configured.");
    }
    if (!passcode) throw makeApiError(401, "Wrong passcode.");
    const { error: loginError } = await supabaseClient.auth.signInWithPassword({
      email: SUPABASE_ADMIN_EMAIL,
      password: passcode,
    });
    if (loginError) throw makeApiError(401, "Wrong passcode.");
    await assertSupabaseAdmin();
    return { ok: true };
  }

  if (path === "/api/admin/logout" && method === "POST") {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw makeApiError(500, error.message || "Logout failed.");
    return { ok: true };
  }

  if (path === "/api/site-settings" && method === "GET") {
    const settings = await fetchSiteSettingsData();
    return {
      landingGifDataUrl: String(settings.landingGifDataUrl || ""),
      bannerMediaDataUrls: Array.isArray(settings.bannerMediaDataUrls) ? settings.bannerMediaDataUrls : [],
      bannerGifDataUrl: String(settings.bannerGifDataUrl || ""),
      experienceAudioDataUrl: String(settings.experienceAudioDataUrl || ""),
      updatedAt: settings.updatedAt || null,
    };
  }

  if (path === "/api/site-settings" && method === "POST") {
    await assertSupabaseAdmin();
    const current = await fetchSiteSettingsData();
    const next = { ...current };
    if (body.landingGifDataUrl !== undefined) next.landingGifDataUrl = String(body.landingGifDataUrl || "");
    if (body.bannerGifDataUrl !== undefined) next.bannerGifDataUrl = String(body.bannerGifDataUrl || "");
    if (body.bannerMediaDataUrls !== undefined) {
      if (!Array.isArray(body.bannerMediaDataUrls)) throw makeApiError(400, "Banner media must be an array.");
      next.bannerMediaDataUrls = body.bannerMediaDataUrls.map((value) => String(value || "")).filter(Boolean);
      next.bannerGifDataUrl = next.bannerMediaDataUrls[0] || next.bannerGifDataUrl || "";
    }
    if (body.experienceAudioDataUrl !== undefined) next.experienceAudioDataUrl = String(body.experienceAudioDataUrl || "");
    next.updatedAt = new Date().toISOString();
    await saveSiteSettingsData(next);
    return {
      landingGifDataUrl: String(next.landingGifDataUrl || ""),
      bannerMediaDataUrls: Array.isArray(next.bannerMediaDataUrls) ? next.bannerMediaDataUrls : [],
      bannerGifDataUrl: String(next.bannerGifDataUrl || ""),
      experienceAudioDataUrl: String(next.experienceAudioDataUrl || ""),
      updatedAt: next.updatedAt,
    };
  }

  if (path === "/api/products" && method === "GET") {
    return { products: await loadAllProductsFromSupabase() };
  }

  if (path === "/api/products" && method === "POST") {
    await assertSupabaseAdmin();
    const existing = await loadAllProductsFromSupabase();
    const now = new Date().toISOString();
    const product = {
      id: randomId(),
      code: makeProductCodeFromCount(existing.length),
      name: String(body.name || "").trim(),
      description: String(body.description || "").trim(),
      details: String(body.details || "").trim(),
      year: String(body.year || "").trim(),
      price: Number(body.price || 0),
      buyUrl: body.buyUrl ? String(body.buyUrl).trim() : null,
      status: String(body.status || "live").toLowerCase(),
      avxColor: String(body.avxColor || "").toLowerCase(),
      avxItem: String(body.avxItem || "").toLowerCase(),
      avxSize: String(body.avxSize || "").toUpperCase(),
      avxSeason: String(body.avxSeason || "").toLowerCase(),
      avxYear: Number(body.avxYear ?? 0),
      avxId: String(body.avxId || ""),
      archiveSeason: body.archiveSeason ? String(body.archiveSeason) : null,
      archiveYear: body.archiveYear == null ? null : Number(body.archiveYear),
      variations: Array.isArray(body.variations) ? body.variations : [],
      media: Array.isArray(body.media) ? body.media : [],
      createdAt: now,
    };
    if (!product.name || !product.description || !product.details || !product.year || Number.isNaN(product.price)) {
      throw makeApiError(400, "Missing required fields.");
    }
    if (!Array.isArray(product.media) || product.media.length === 0) {
      throw makeApiError(400, "At least one media item is required.");
    }
    const { error } = await supabaseClient.from("app_products").insert({ id: product.id, data: product, created_at: now });
    if (error) throw makeApiError(500, error.message || "Failed to create product.");
    return { product };
  }

  if ((path === "/api/products/update" && method === "POST") || (productIdFromPath(path) && method === "PUT")) {
    await assertSupabaseAdmin();
    const productId = path === "/api/products/update" ? String(body.id || "") : productIdFromPath(path);
    if (!productId) throw makeApiError(400, "Missing product id.");
    const { data: row, error: loadError } = await supabaseClient
      .from("app_products")
      .select("id,data,created_at,updated_at")
      .eq("id", productId)
      .maybeSingle();
    if (loadError) throw makeApiError(500, loadError.message || "Failed to load product.");
    if (!row) throw makeApiError(404, "Product not found.");
    const existing = materializeRow(row);
    const updated = {
      ...existing,
      ...body,
      id: productId,
      price: Number(body.price ?? existing.price),
      media: Array.isArray(body.media) && body.media.length > 0 ? body.media : existing.media,
      updatedAt: new Date().toISOString(),
    };
    const { error } = await supabaseClient
      .from("app_products")
      .update({ data: updated, updated_at: updated.updatedAt })
      .eq("id", productId);
    if (error) throw makeApiError(500, error.message || "Failed to update product.");
    return { product: updated };
  }

  if (path === "/api/portfolio" && method === "GET") {
    return { projects: await loadAllPortfolioFromSupabase() };
  }

  if (path === "/api/portfolio" && method === "POST") {
    await assertSupabaseAdmin();
    const now = new Date().toISOString();
    const project = {
      id: randomId(),
      title: String(body.title || "").trim(),
      description: String(body.description || "").trim(),
      details: String(body.details || "").trim(),
      media: Array.isArray(body.media) ? body.media : [],
      createdAt: now,
    };
    if (!project.title || !project.description || project.media.length === 0) {
      throw makeApiError(400, "Title, description, and at least one media item are required.");
    }
    const { error } = await supabaseClient.from("app_portfolio").insert({ id: project.id, data: project, created_at: now });
    if (error) throw makeApiError(500, error.message || "Failed to create portfolio project.");
    return { project };
  }

  if ((path === "/api/portfolio/update" && method === "POST") || (portfolioIdFromPath(path) && method === "PUT")) {
    await assertSupabaseAdmin();
    const projectId = path === "/api/portfolio/update" ? String(body.id || "") : portfolioIdFromPath(path);
    if (!projectId) throw makeApiError(400, "Missing project id.");
    const { data: row, error: loadError } = await supabaseClient
      .from("app_portfolio")
      .select("id,data,created_at,updated_at")
      .eq("id", projectId)
      .maybeSingle();
    if (loadError) throw makeApiError(500, loadError.message || "Failed to load portfolio project.");
    if (!row) throw makeApiError(404, "Portfolio project not found.");
    const existing = materializeRow(row);
    const updated = {
      ...existing,
      ...body,
      id: projectId,
      media: Array.isArray(body.media) && body.media.length > 0 ? body.media : existing.media,
      updatedAt: new Date().toISOString(),
    };
    const { error } = await supabaseClient
      .from("app_portfolio")
      .update({ data: updated, updated_at: updated.updatedAt })
      .eq("id", projectId);
    if (error) throw makeApiError(500, error.message || "Failed to update portfolio project.");
    return { project: updated };
  }

  if (path === "/api/orders" && method === "POST") {
    const productId = String(body.productId || "");
    const size = String(body.size || "default");
    const quantity = Number(body.quantity || 1);
    if (!productId || !Number.isInteger(quantity) || quantity < 1) {
      throw makeApiError(400, "Invalid order payload.");
    }
    const { data: row, error: loadError } = await supabaseClient
      .from("app_products")
      .select("id,data")
      .eq("id", productId)
      .maybeSingle();
    if (loadError) throw makeApiError(500, loadError.message || "Failed to load product.");
    if (!row) throw makeApiError(404, "Product not found.");
    const product = materializeRow(row);
    if (String(product.status || "live").toLowerCase() !== "live") {
      throw makeApiError(400, "Archived products are not purchasable.");
    }

    const variations = Array.isArray(product.variations) ? [...product.variations] : [];
    if (variations.length > 0) {
      const idx = variations.findIndex((entry) => String(entry.size) === size);
      if (idx === -1) throw makeApiError(400, "Please choose a valid size.");
      if (Number(variations[idx].quantity) < quantity) {
        throw makeApiError(400, "Selected size does not have enough stock.");
      }
      variations[idx] = { ...variations[idx], quantity: Number(variations[idx].quantity) - quantity };
      const updatedProduct = { ...product, variations, updatedAt: new Date().toISOString() };
      const { error: updateError } = await supabaseClient
        .from("app_products")
        .update({ data: updatedProduct, updated_at: updatedProduct.updatedAt })
        .eq("id", productId);
      if (updateError) throw makeApiError(500, updateError.message || "Failed to update stock.");
    }

    const order = {
      id: randomId(),
      productId,
      size,
      quantity,
      unitPrice: Number(product.price || 0),
      totalPrice: Number(product.price || 0) * quantity,
      createdAt: new Date().toISOString(),
    };
    const { error } = await supabaseClient.from("app_orders").insert({ id: order.id, data: order, created_at: order.createdAt });
    if (error) throw makeApiError(500, error.message || "Failed to create order.");
    return { order };
  }

  throw makeApiError(405, "Method Not Allowed");
}

async function savePortfolioEditWithFallback(projectId, payload, adminPasscode) {
  try {
    return await apiRequest("/api/portfolio/update", {
      method: "POST",
      headers: { "x-admin-passcode": adminPasscode },
      body: JSON.stringify({ id: projectId, ...payload }),
    });
  } catch (error) {
    if (error?.status !== 404 && error?.status !== 405) throw error;
    return apiRequest(`/api/portfolio/${encodeURIComponent(projectId)}`, {
      method: "PUT",
      headers: { "x-admin-passcode": adminPasscode },
      body: JSON.stringify(payload),
    });
  }
}

function resolveApiBase() {
  if (window.location.protocol === "http:" || window.location.protocol === "https:") {
    return window.location.origin;
  }
  return localStorage.getItem("api_base_url") || "http://localhost:3000";
}

function syncRouteFromHash() {
  let route = String(window.location.hash || "#home").toLowerCase();
  if (!["#home", "#portfolio", "#live", "#archive", "#upload"].includes(route)) {
    route = "#home";
  }
  const wantsUpload = route === "#upload";
  if (wantsUpload && !isAdmin) {
    window.location.hash = "#home";
    return;
  }

  const isHome = route === "#home";
  const isPortfolio = route === "#portfolio";
  const isLive = route === "#live";
  const isArchive = route === "#archive";
  const isUpload = route === "#upload";

  if (homePage) homePage.hidden = !isHome;
  if (portfolioPage) portfolioPage.hidden = !isPortfolio;
  if (livePage) livePage.hidden = !isLive;
  if (archivePage) archivePage.hidden = !isArchive;
  if (uploadPage) uploadPage.hidden = !isUpload;

  for (const link of routeLinks) {
    link.setAttribute("aria-current", link.getAttribute("href") === route ? "page" : "false");
  }

  if (isArchive) {
    setArchiveZoom(archiveZoom, false);
  }
}

function initLanding() {
  if (!landingScreen || !enterBtn) return;
  landingScreen.classList.remove("hidden");

  const configuredGif = String(siteSettings?.landingGifDataUrl || "").trim();
  if (configuredGif) {
    applyLandingMedia("gif", configuredGif);
    applySiteBackgroundGif(configuredGif);
  } else {
    const mediaType = String(landingScreen.dataset.mediaType || "").toLowerCase();
    const mediaSrc = String(landingScreen.dataset.mediaSrc || "").trim();
    applyLandingMedia(mediaType, mediaSrc);
    applySiteBackgroundGif(getFallbackLandingGif());
  }
  tryPlayExperienceAudio();

  // Many browsers block autoplay with sound; retry on first user interaction on landing.
  const onFirstLandingInteraction = () => {
    tryPlayExperienceAudio();
    landingScreen.removeEventListener("pointerdown", onFirstLandingInteraction);
    landingScreen.removeEventListener("keydown", onFirstLandingInteraction);
  };
  landingScreen.addEventListener("pointerdown", onFirstLandingInteraction, { once: true });
  landingScreen.addEventListener("keydown", onFirstLandingInteraction, { once: true });

  enterBtn.addEventListener("click", () => {
    landingScreen.classList.add("hidden");
    tryPlayExperienceAudio();
  });
}

async function initializeExperience() {
  await loadSiteSettings();
  initLanding();
}

function applyLandingMedia(mediaType, mediaSrc) {
  if (mediaType === "gif" && mediaSrc && landingGif) {
    landingGif.src = mediaSrc;
    landingGif.hidden = false;
    if (landingVideo) {
      landingVideo.hidden = true;
      landingVideo.removeAttribute("src");
    }
    return;
  }

  if (mediaSrc && landingVideo) {
    landingVideo.src = mediaSrc;
    landingVideo.hidden = false;
    landingVideo.play().catch(() => {});
    if (landingGif) {
      landingGif.hidden = true;
      landingGif.removeAttribute("src");
    }
  }
}

async function loadSiteSettings() {
  try {
    const data = await apiRequest("/api/site-settings");
    siteSettings = data || {};
    applySiteSettings();
  } catch {
    siteSettings = null;
    applySiteSettings();
  }
}

function applySiteSettings() {
  const gif = String(siteSettings?.landingGifDataUrl || "").trim();
  const mp3 = String(siteSettings?.experienceAudioDataUrl || "").trim();
  const fallbackGif = getFallbackLandingGif();
  const effectiveGif = gif || fallbackGif;

  if (effectiveGif) {
    applyLandingMedia("gif", effectiveGif);
    applySiteBackgroundGif(effectiveGif);
  } else {
    applySiteBackgroundGif("");
  }
  if (experienceAudio) {
    experienceAudio.src = mp3 || "";
  }
  tryPlayExperienceAudio();
  renderHeroCarousel();
}

function getBannerMediaSources() {
  const direct = Array.isArray(siteSettings?.bannerMediaDataUrls)
    ? siteSettings.bannerMediaDataUrls
    : [];
  const normalizedDirect = direct
    .map((value) => String(value || "").trim())
    .filter((value) => value.startsWith("data:image/"));
  if (normalizedDirect.length > 0) return normalizedDirect;

  const legacy = String(siteSettings?.bannerGifDataUrl || "").trim();
  if (legacy.startsWith("data:image/")) return [legacy];
  return [];
}

function getFallbackLandingGif() {
  if (!landingScreen) return "";
  const mediaType = String(landingScreen.dataset.mediaType || "").toLowerCase();
  const mediaSrc = String(landingScreen.dataset.mediaSrc || "").trim();
  return mediaType === "gif" ? mediaSrc : "";
}

function applySiteBackgroundGif(src) {
  if (!siteBgGif) return;
  if (!src) {
    siteBgGif.hidden = true;
    siteBgGif.removeAttribute("src");
    return;
  }
  siteBgGif.src = src;
  siteBgGif.hidden = false;
}

function tryPlayExperienceAudio() {
  if (!experienceAudio?.src) return;
  experienceAudio.play().catch(() => {});
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}
