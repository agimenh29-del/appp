const http = require("http");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");

const PORT = Number(process.env.PORT || "3000");
const HOST = process.env.HOST || "127.0.0.1";
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "change-this-passcode";
const MAX_JSON_BODY_BYTES = Number(process.env.MAX_JSON_BODY_BYTES || String(10 * 1024 * 1024 * 1024));
const DATA_DIR = path.join(__dirname, "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const PORTFOLIO_FILE = path.join(DATA_DIR, "portfolio.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const SITE_SETTINGS_FILE = path.join(DATA_DIR, "site-settings.json");
const WWW_DIR = path.join(__dirname, "www");

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
  }
}

start().catch((error) => {
  console.error("Startup failed:", error);
  process.exit(1);
});

async function start() {
  await ensureStorage();

  const server = http.createServer(async (req, res) => {
    try {
      addCorsHeaders(res);

      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }

      const url = new URL(req.url, `http://${req.headers.host}`);

      if (url.pathname === "/api/health" && req.method === "GET") {
        return sendJson(res, 200, { ok: true });
      }

      if (url.pathname === "/api/products" && req.method === "GET") {
        const products = await readJsonFile(PRODUCTS_FILE);
        return sendJson(res, 200, { products });
      }

      if (url.pathname === "/api/portfolio" && req.method === "GET") {
        const projects = await readJsonFile(PORTFOLIO_FILE);
        return sendJson(res, 200, { projects });
      }

      if (url.pathname === "/api/admin/login" && req.method === "POST") {
        const body = await readJsonBody(req);
        if (!isValidPasscode(body.passcode)) {
          return sendJson(res, 401, { error: "Wrong passcode." });
        }
        return sendJson(res, 200, { ok: true });
      }

      if (url.pathname === "/api/site-settings" && req.method === "GET") {
        const settings = await readObjectFile(SITE_SETTINGS_FILE);
        const bannerMediaDataUrls = normalizeBannerMediaDataUrls(
          settings.bannerMediaDataUrls,
          settings.bannerGifDataUrl,
        );
        return sendJson(res, 200, {
          landingGifDataUrl: String(settings.landingGifDataUrl || ""),
          bannerMediaDataUrls,
          bannerGifDataUrl: String(settings.bannerGifDataUrl || ""),
          experienceAudioDataUrl: String(settings.experienceAudioDataUrl || ""),
          updatedAt: settings.updatedAt || null,
        });
      }

      if (url.pathname === "/api/site-settings" && req.method === "POST") {
        if (!isAuthorized(req)) {
          return sendJson(res, 401, { error: "Unauthorized." });
        }

        const body = await readJsonBody(req);
        const settings = await readObjectFile(SITE_SETTINGS_FILE);

        if (body.landingGifDataUrl !== undefined) {
          const gif = String(body.landingGifDataUrl || "");
          if (!gif.startsWith("data:image/gif")) {
            return sendJson(res, 400, { error: "Landing media must be GIF data URL." });
          }
          settings.landingGifDataUrl = gif;
        }

        if (body.bannerGifDataUrl !== undefined) {
          const gif = String(body.bannerGifDataUrl || "");
          if (!gif.startsWith("data:image/")) {
            return sendJson(res, 400, { error: "Banner media must be GIF data URL." });
          }
          settings.bannerGifDataUrl = gif;
          settings.bannerMediaDataUrls = [gif];
        }

        if (body.bannerMediaDataUrls !== undefined) {
          if (!Array.isArray(body.bannerMediaDataUrls)) {
            return sendJson(res, 400, { error: "Banner media must be an array." });
          }
          const normalized = body.bannerMediaDataUrls
            .map((value) => String(value || "").trim())
            .filter((value) => value.length > 0);
          if (normalized.some((value) => !value.startsWith("data:image/"))) {
            return sendJson(res, 400, { error: "Banner files must be image data URLs." });
          }
          settings.bannerMediaDataUrls = normalized;
          settings.bannerGifDataUrl = normalized[0] || "";
        }

        if (body.experienceAudioDataUrl !== undefined) {
          const audio = String(body.experienceAudioDataUrl || "");
          if (!audio.startsWith("data:audio/")) {
            return sendJson(res, 400, { error: "Audio must be MP3 data URL." });
          }
          settings.experienceAudioDataUrl = audio;
        }

        settings.updatedAt = new Date().toISOString();
        await writeObjectFile(SITE_SETTINGS_FILE, settings);

        return sendJson(res, 200, {
          landingGifDataUrl: String(settings.landingGifDataUrl || ""),
          bannerMediaDataUrls: normalizeBannerMediaDataUrls(
            settings.bannerMediaDataUrls,
            settings.bannerGifDataUrl,
          ),
          bannerGifDataUrl: String(settings.bannerGifDataUrl || ""),
          experienceAudioDataUrl: String(settings.experienceAudioDataUrl || ""),
          updatedAt: settings.updatedAt,
        });
      }

      if (url.pathname === "/api/products" && req.method === "POST") {
        if (!isAuthorized(req)) {
          return sendJson(res, 401, { error: "Unauthorized." });
        }

        const body = await readJsonBody(req);
        const validationError = validateProductPayload(body, { requireMedia: true });
        if (validationError) {
          return sendJson(res, 400, { error: validationError });
        }

        const products = await readJsonFile(PRODUCTS_FILE);
        const created = {
          id: randomUUID(),
          code: makeCode(products.length + 1),
          name: String(body.name).trim(),
          description: String(body.description).trim(),
          details: String(body.details).trim(),
          year: String(body.year).trim(),
          price: Number(body.price),
          buyUrl: body.buyUrl ? String(body.buyUrl).trim() : null,
          status: String(body.status || "live").toLowerCase(),
          avxColor: String(body.avxColor || "").toLowerCase(),
          avxItem: String(body.avxItem || "").toLowerCase(),
          avxSize: String(body.avxSize || "").toUpperCase(),
          avxSeason: String(body.avxSeason || "").toLowerCase(),
          avxYear: normalizeAvxYear(body.avxYear),
          avxId: buildAvxId({
            avxColor: body.avxColor,
            avxItem: body.avxItem,
            avxSize: body.avxSize,
            avxSeason: body.avxSeason,
            avxYear: body.avxYear,
          }),
          archiveSeason: normalizeArchiveSeason(body.archiveSeason),
          archiveYear: normalizeArchiveYear(body.archiveYear),
          variations: normalizeVariations(body.variations),
          media: body.media.map((item) => ({
            type: String(item.type),
            dataUrl: String(item.dataUrl),
          })),
          createdAt: new Date().toISOString(),
        };

        products.unshift(created);
        await writeJsonFile(PRODUCTS_FILE, products);
        return sendJson(res, 201, { product: created });
      }

      if (url.pathname === "/api/portfolio" && req.method === "POST") {
        if (!isAuthorized(req)) {
          return sendJson(res, 401, { error: "Unauthorized." });
        }

        const body = await readJsonBody(req);
        const validationError = validatePortfolioPayload(body, { requireMedia: true });
        if (validationError) {
          return sendJson(res, 400, { error: validationError });
        }

        const projects = await readJsonFile(PORTFOLIO_FILE);
        const project = {
          id: randomUUID(),
          title: String(body.title).trim(),
          description: String(body.description).trim(),
          details: String(body.details || "").trim(),
          media: body.media.map((item) => ({
            type: String(item.type),
            dataUrl: String(item.dataUrl),
            name: String(item.name || ""),
          })),
          createdAt: new Date().toISOString(),
        };

        projects.unshift(project);
        await writeJsonFile(PORTFOLIO_FILE, projects);
        return sendJson(res, 201, { project });
      }

      if (url.pathname === "/api/portfolio/update" && req.method === "POST") {
        if (!isAuthorized(req)) {
          return sendJson(res, 401, { error: "Unauthorized." });
        }

        const body = await readJsonBody(req);
        const projectId = String(body.id || "");
        if (!projectId) {
          return sendJson(res, 400, { error: "Missing project id." });
        }

        const validationError = validatePortfolioPayload(body, { requireMedia: false });
        if (validationError) {
          return sendJson(res, 400, { error: validationError });
        }

        const projects = await readJsonFile(PORTFOLIO_FILE);
        const index = projects.findIndex((item) => item.id === projectId);
        if (index === -1) {
          return sendJson(res, 404, { error: "Portfolio project not found." });
        }

        const existing = projects[index];
        const updated = {
          ...existing,
          title: String(body.title).trim(),
          description: String(body.description).trim(),
          details: String(body.details || "").trim(),
          media: Array.isArray(body.media) && body.media.length > 0
            ? body.media.map((item) => ({
              type: String(item.type),
              dataUrl: String(item.dataUrl),
              name: String(item.name || ""),
            }))
            : existing.media,
          updatedAt: new Date().toISOString(),
        };

        projects[index] = updated;
        await writeJsonFile(PORTFOLIO_FILE, projects);
        return sendJson(res, 200, { project: updated });
      }

      const portfolioId = getPortfolioIdFromPath(url.pathname);
      if (portfolioId && req.method === "PUT") {
        if (!isAuthorized(req)) {
          return sendJson(res, 401, { error: "Unauthorized." });
        }

        const body = await readJsonBody(req);
        const mergedBody = { ...body, id: portfolioId };
        const validationError = validatePortfolioPayload(mergedBody, { requireMedia: false });
        if (validationError) {
          return sendJson(res, 400, { error: validationError });
        }

        const projects = await readJsonFile(PORTFOLIO_FILE);
        const index = projects.findIndex((item) => item.id === portfolioId);
        if (index === -1) {
          return sendJson(res, 404, { error: "Portfolio project not found." });
        }

        const existing = projects[index];
        const updated = {
          ...existing,
          title: String(mergedBody.title).trim(),
          description: String(mergedBody.description).trim(),
          details: String(mergedBody.details || "").trim(),
          media: Array.isArray(mergedBody.media) && mergedBody.media.length > 0
            ? mergedBody.media.map((item) => ({
              type: String(item.type),
              dataUrl: String(item.dataUrl),
              name: String(item.name || ""),
            }))
            : existing.media,
          updatedAt: new Date().toISOString(),
        };

        projects[index] = updated;
        await writeJsonFile(PORTFOLIO_FILE, projects);
        return sendJson(res, 200, { project: updated });
      }

      const productId = getProductIdFromPath(url.pathname);
      if (productId && req.method === "PUT") {
        if (!isAuthorized(req)) {
          return sendJson(res, 401, { error: "Unauthorized." });
        }

        const body = await readJsonBody(req);
        const validationError = validateProductPayload(body, { requireMedia: false });
        if (validationError) {
          return sendJson(res, 400, { error: validationError });
        }

        const products = await readJsonFile(PRODUCTS_FILE);
        const index = products.findIndex((item) => item.id === productId);
        if (index === -1) {
          return sendJson(res, 404, { error: "Product not found." });
        }

        const existing = products[index];
        const updated = {
          ...existing,
          name: String(body.name).trim(),
          description: String(body.description).trim(),
          details: String(body.details).trim(),
          year: String(body.year).trim(),
          price: Number(body.price),
          buyUrl: body.buyUrl ? String(body.buyUrl).trim() : null,
          status: String(body.status || existing.status || "live").toLowerCase(),
          avxColor: String(body.avxColor || existing.avxColor || "").toLowerCase(),
          avxItem: String(body.avxItem || existing.avxItem || "").toLowerCase(),
          avxSize: String(body.avxSize || existing.avxSize || "").toUpperCase(),
          avxSeason: String(body.avxSeason || existing.avxSeason || "").toLowerCase(),
          avxYear: normalizeAvxYear(body.avxYear ?? existing.avxYear),
          avxId: buildAvxId({
            avxColor: body.avxColor ?? existing.avxColor,
            avxItem: body.avxItem ?? existing.avxItem,
            avxSize: body.avxSize ?? existing.avxSize,
            avxSeason: body.avxSeason ?? existing.avxSeason,
            avxYear: body.avxYear ?? existing.avxYear,
          }),
          archiveSeason: body.archiveSeason === undefined
            ? normalizeArchiveSeason(existing.archiveSeason)
            : normalizeArchiveSeason(body.archiveSeason),
          archiveYear: body.archiveYear === undefined
            ? normalizeArchiveYear(existing.archiveYear)
            : normalizeArchiveYear(body.archiveYear),
          variations: body.variations === undefined
            ? (Array.isArray(existing.variations) ? existing.variations : [])
            : normalizeVariations(body.variations),
          media: Array.isArray(body.media) && body.media.length > 0
            ? body.media.map((item) => ({
              type: String(item.type),
              dataUrl: String(item.dataUrl),
            }))
            : existing.media,
          updatedAt: new Date().toISOString(),
        };

        products[index] = updated;
        await writeJsonFile(PRODUCTS_FILE, products);
        return sendJson(res, 200, { product: updated });
      }

      if (url.pathname === "/api/products/update" && req.method === "POST") {
        if (!isAuthorized(req)) {
          return sendJson(res, 401, { error: "Unauthorized." });
        }

        const body = await readJsonBody(req);
        const targetId = String(body.id || "");
        if (!targetId) {
          return sendJson(res, 400, { error: "Missing product id." });
        }

        const validationError = validateProductPayload(body, { requireMedia: false });
        if (validationError) {
          return sendJson(res, 400, { error: validationError });
        }

        const products = await readJsonFile(PRODUCTS_FILE);
        const index = products.findIndex((item) => item.id === targetId);
        if (index === -1) {
          return sendJson(res, 404, { error: "Product not found." });
        }

        const existing = products[index];
        const updated = {
          ...existing,
          name: String(body.name).trim(),
          description: String(body.description).trim(),
          details: String(body.details).trim(),
          year: String(body.year).trim(),
          price: Number(body.price),
          buyUrl: body.buyUrl ? String(body.buyUrl).trim() : null,
          status: String(body.status || existing.status || "live").toLowerCase(),
          avxColor: String(body.avxColor || existing.avxColor || "").toLowerCase(),
          avxItem: String(body.avxItem || existing.avxItem || "").toLowerCase(),
          avxSize: String(body.avxSize || existing.avxSize || "").toUpperCase(),
          avxSeason: String(body.avxSeason || existing.avxSeason || "").toLowerCase(),
          avxYear: normalizeAvxYear(body.avxYear ?? existing.avxYear),
          avxId: buildAvxId({
            avxColor: body.avxColor ?? existing.avxColor,
            avxItem: body.avxItem ?? existing.avxItem,
            avxSize: body.avxSize ?? existing.avxSize,
            avxSeason: body.avxSeason ?? existing.avxSeason,
            avxYear: body.avxYear ?? existing.avxYear,
          }),
          archiveSeason: body.archiveSeason === undefined
            ? normalizeArchiveSeason(existing.archiveSeason)
            : normalizeArchiveSeason(body.archiveSeason),
          archiveYear: body.archiveYear === undefined
            ? normalizeArchiveYear(existing.archiveYear)
            : normalizeArchiveYear(body.archiveYear),
          variations: body.variations === undefined
            ? (Array.isArray(existing.variations) ? existing.variations : [])
            : normalizeVariations(body.variations),
          media: Array.isArray(body.media) && body.media.length > 0
            ? body.media.map((item) => ({
              type: String(item.type),
              dataUrl: String(item.dataUrl),
            }))
            : existing.media,
          updatedAt: new Date().toISOString(),
        };

        products[index] = updated;
        await writeJsonFile(PRODUCTS_FILE, products);
        return sendJson(res, 200, { product: updated });
      }

      if (url.pathname === "/api/orders" && req.method === "POST") {
        const body = await readJsonBody(req);
        const productId = String(body.productId || "");
        const size = String(body.size || "default");
        const quantity = Number(body.quantity || 1);

        if (!productId || !Number.isInteger(quantity) || quantity < 1) {
          return sendJson(res, 400, { error: "Invalid order payload." });
        }

        const products = await readJsonFile(PRODUCTS_FILE);
        const product = products.find((item) => item.id === productId);
        if (!product) {
          return sendJson(res, 404, { error: "Product not found." });
        }
        if (String(product.status || "live").toLowerCase() !== "live") {
          return sendJson(res, 400, { error: "Archived products are not purchasable." });
        }

        const variations = Array.isArray(product.variations) ? product.variations : [];
        let selectedVariationIndex = -1;
        if (variations.length > 0) {
          selectedVariationIndex = variations.findIndex((entry) => String(entry.size) === size);
          const selectedVariation = selectedVariationIndex === -1 ? null : variations[selectedVariationIndex];
          if (!selectedVariation) {
            return sendJson(res, 400, { error: "Please choose a valid size." });
          }
          if (!Number.isInteger(Number(selectedVariation.quantity)) || Number(selectedVariation.quantity) < quantity) {
            return sendJson(res, 400, { error: "Selected size does not have enough stock." });
          }
        }

        const orders = await readJsonFile(ORDERS_FILE);
        const order = {
          id: randomUUID(),
          productId,
          size,
          quantity,
          unitPrice: Number(product.price),
          totalPrice: Number(product.price) * quantity,
          createdAt: new Date().toISOString(),
        };

        orders.unshift(order);
        if (selectedVariationIndex !== -1) {
          const productIndex = products.findIndex((item) => item.id === productId);
          const currentQty = Number(products[productIndex].variations[selectedVariationIndex].quantity);
          products[productIndex].variations[selectedVariationIndex].quantity = currentQty - quantity;
          await writeJsonFile(PRODUCTS_FILE, products);
        }
        await writeJsonFile(ORDERS_FILE, orders);

        return sendJson(res, 201, { order });
      }

      return serveStatic(req, res, url.pathname);
    } catch (error) {
      console.error(error);
      if (error instanceof HttpError) {
        return sendJson(res, error.statusCode, { error: error.message });
      }
      return sendJson(res, 500, { error: "Server error." });
    }
  });

  server.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
    if (ADMIN_PASSCODE === "change-this-passcode") {
      console.log("Set ADMIN_PASSCODE env var before production use.");
    }
  });
}

function addCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,x-admin-passcode");
}

function isValidPasscode(value) {
  return String(value || "").trim() === ADMIN_PASSCODE;
}

function isAuthorized(req) {
  return isValidPasscode(req.headers["x-admin-passcode"]);
}

function validateProductPayload(payload, options = { requireMedia: true }) {
  if (!payload || typeof payload !== "object") return "Invalid payload.";
  if (!payload.name || !payload.description || !payload.details || !payload.year) {
    return "Missing required fields.";
  }
  if (Number.isNaN(Number(payload.price))) {
    return "Price is required.";
  }
  const avxId = buildAvxId(payload);
  if (!avxId) {
    return "AVX ID fields are invalid.";
  }
  const status = String(payload.status || "live").toLowerCase();
  if (status !== "live" && status !== "archive") {
    return "Status must be live or archive.";
  }
  if (status === "archive") {
    const season = normalizeArchiveSeason(payload.archiveSeason);
    const year = normalizeArchiveYear(payload.archiveYear);
    if (!season || !year) {
      return "Archive products need archive season and archive year.";
    }
  }
  if (payload.media === undefined && options.requireMedia) {
    return "At least one media item is required.";
  }
  if (payload.media !== undefined) {
    if (!Array.isArray(payload.media) || payload.media.length === 0) {
      return "At least one media item is required.";
    }
    for (const media of payload.media) {
      const type = String(media.type || "");
      const dataUrl = String(media.dataUrl || "");
      if (!type.startsWith("image/") && !type.startsWith("video/")) {
        return "Only image/video media is supported.";
      }
      if (!dataUrl.startsWith("data:")) {
        return "Invalid media format.";
      }
    }
  }
  if (payload.variations !== undefined) {
    if (!Array.isArray(payload.variations)) {
      return "Variations must be an array.";
    }
    for (const variation of payload.variations) {
      const size = String(variation?.size || "").trim();
      const quantity = Number(variation?.quantity);
      if (!size) {
        return "Each variation must include a size.";
      }
      if (!Number.isInteger(quantity) || quantity < 0) {
        return "Variation quantity must be a whole number >= 0.";
      }
    }
  }
  return null;
}

function validatePortfolioPayload(payload, options = { requireMedia: true }) {
  if (!payload || typeof payload !== "object") return "Invalid payload.";
  if (!payload.title || !payload.description) {
    return "Title and description are required.";
  }

  if (payload.media === undefined && options.requireMedia) {
    return "At least one media item is required.";
  }
  if (payload.media !== undefined) {
    if (!Array.isArray(payload.media) || payload.media.length === 0) {
      return "At least one media item is required.";
    }
    for (const media of payload.media) {
      const type = String(media.type || "");
      const dataUrl = String(media.dataUrl || "");
      if (!type.startsWith("image/") && !type.startsWith("video/") && !type.startsWith("audio/")) {
        return "Portfolio supports image, video, or audio files.";
      }
      if (!dataUrl.startsWith("data:")) {
        return "Invalid media format.";
      }
    }
  }
  return null;
}

function normalizeArchiveSeason(value) {
  const season = String(value || "").toUpperCase();
  return season === "FW" || season === "SS" ? season : null;
}

function normalizeArchiveYear(value) {
  const year = Number(value);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) return null;
  return year;
}

function normalizeAvxYear(value) {
  const year = Number(value);
  if (!Number.isInteger(year) || year < 0 || year > 99) return null;
  return year;
}

function buildAvxId(input) {
  const validColors = new Set(["blk", "wht", "grn", "gry", "pnk"]);
  const validItems = new Set(["ts", "hd", "sw", "sp", "trkp"]);
  const validSizes = new Set(["S", "M", "L", "XL"]);
  const validSeasons = new Set(["fw", "ss"]);

  const color = String(input.avxColor || "").toLowerCase();
  const item = String(input.avxItem || "").toLowerCase();
  const size = String(input.avxSize || "").toUpperCase();
  const season = String(input.avxSeason || "").toLowerCase();
  const year = normalizeAvxYear(input.avxYear);

  if (!validColors.has(color) || !validItems.has(item) || !validSizes.has(size) || !validSeasons.has(season) || year === null) {
    return "";
  }
  return `${color.toUpperCase()}${item.toUpperCase()}${size}${season.toUpperCase()}${String(year).padStart(2, "0")}`;
}

function normalizeBannerMediaDataUrls(bannerMediaDataUrls, bannerGifDataUrl) {
  const fromArray = Array.isArray(bannerMediaDataUrls)
    ? bannerMediaDataUrls
      .map((value) => String(value || "").trim())
      .filter((value) => value.startsWith("data:image/"))
    : [];
  if (fromArray.length > 0) return fromArray;

  const legacy = String(bannerGifDataUrl || "").trim();
  if (legacy.startsWith("data:image/")) return [legacy];
  return [];
}

function normalizeVariations(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((variation) => ({
      size: String(variation?.size || "").trim(),
      quantity: Number(variation?.quantity),
    }))
    .filter((variation) => variation.size && Number.isInteger(variation.quantity) && variation.quantity >= 0);
}

function getProductIdFromPath(pathname) {
  const match = pathname.match(/^\/api\/products\/([^/]+)$/);
  return match ? match[1] : null;
}

function getPortfolioIdFromPath(pathname) {
  const match = pathname.match(/^\/api\/portfolio\/([^/]+)$/);
  return match ? match[1] : null;
}

function makeCode(index) {
  const base = 220 + index;
  return `AVELI-${String(base).padStart(3, "0")}`;
}

async function ensureStorage() {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  await ensureJsonFile(PRODUCTS_FILE);
  await ensureJsonFile(PORTFOLIO_FILE);
  await ensureJsonFile(ORDERS_FILE);
  await ensureObjectFile(SITE_SETTINGS_FILE);
}

async function ensureJsonFile(filePath) {
  try {
    await fsp.access(filePath);
  } catch {
    await writeJsonFile(filePath, []);
  }
}

async function ensureObjectFile(filePath) {
  try {
    await fsp.access(filePath);
  } catch {
    await writeObjectFile(filePath, {});
  }
}

async function readJsonFile(filePath) {
  try {
    const raw = await fsp.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error && error.name === "SyntaxError") {
      await writeJsonFile(filePath, []);
      return [];
    }
    throw error;
  }
}

async function writeJsonFile(filePath, value) {
  const json = JSON.stringify(value, null, 2);
  await fsp.writeFile(filePath, json, "utf8");
}

async function readObjectFile(filePath) {
  try {
    const raw = await fsp.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    if (error && error.name === "SyntaxError") {
      await writeObjectFile(filePath, {});
      return {};
    }
    throw error;
  }
}

async function writeObjectFile(filePath, value) {
  const json = JSON.stringify(value, null, 2);
  await fsp.writeFile(filePath, json, "utf8");
}

async function readJsonBody(req) {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of req) {
    bytes += chunk.length;
    if (bytes > MAX_JSON_BODY_BYTES) {
      const limitMb = Math.max(1, Math.floor(MAX_JSON_BODY_BYTES / (1024 * 1024)));
      throw new HttpError(413, `Upload too large (max ${limitMb}MB). Try fewer/smaller files.`);
    }
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpError(400, "Invalid JSON payload.");
  }
}

function sendJson(res, statusCode, payload) {
  const json = JSON.stringify(payload);
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(json);
}

function serveStatic(req, res, pathname) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Method Not Allowed");
    return;
  }

  const safePath = sanitizePath(pathname);
  const filePath = safePath ? path.join(WWW_DIR, safePath) : path.join(WWW_DIR, "index.html");

  if (!filePath.startsWith(WWW_DIR)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  const resolved = fs.existsSync(filePath) && fs.statSync(filePath).isFile()
    ? filePath
    : path.join(WWW_DIR, "index.html");

  const ext = path.extname(resolved).toLowerCase();
  const contentType = contentTypeForExtension(ext);

  res.writeHead(200, { "Content-Type": contentType });
  fs.createReadStream(resolved).pipe(res);
}

function sanitizePath(pathname) {
  if (!pathname || pathname === "/") return "";
  return pathname.replace(/^\/+/, "");
}

function contentTypeForExtension(ext) {
  switch (ext) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
      return "application/javascript; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}
