# AVELI Storefront (Next.js + Shopify Headless)

This project now runs as a Next.js App Router storefront and uses Shopify Storefront API for products, cart, and checkout.

## Environment Variables

Set these locally in `.env.local` and in Vercel Project Settings -> Environment Variables:

- `SHOPIFY_STORE_DOMAIN` (example: `your-store.myshopify.com`)
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
- `SHOPIFY_API_VERSION` (optional, default: `2025-01`)

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy to Vercel

1. Push to GitHub.
2. Import the repo in Vercel.
3. Add environment variables above.
4. Deploy.

## Shopify Setup

1. In Shopify admin, create products and variants (for sizes use variant options such as `Size`).
2. Create Storefront API access token:
   - Shopify Admin -> Settings -> Apps and sales channels -> Develop apps
   - Create app (or use existing)
   - Configure Storefront API scopes (read products, write carts / unauthenticated checkout)
   - Install app and copy Storefront access token
3. Add token/domain to env vars.

## API Routes

Server-side routes (Vercel/Next):

- `POST /api/shopify/products`
- `POST /api/shopify/product` `{ handle }`
- `POST /api/shopify/cart/create`
- `POST /api/shopify/cart/add` `{ cartId?, merchandiseId, quantity }`
- `POST /api/shopify/cart/update` `{ cartId, lineId, quantity }`
- `POST /api/shopify/cart/remove` `{ cartId, lineId }`
- `POST /api/shopify/cart/get` `{ cartId }`

## Notes

- Commerce no longer uses `server.js`, `products.json`, or `orders.json`.
- Checkout redirects to Shopify `checkoutUrl` from the active cart.
- Supabase can still be used separately for non-commerce content (for example portfolio content) if needed.
