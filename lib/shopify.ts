import "server-only";

export type ShopifyGraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

export async function shopifyFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const version = process.env.SHOPIFY_API_VERSION || "2025-01";

  if (!domain || !token) {
    throw new Error("Missing Shopify env vars: SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_ACCESS_TOKEN");
  }

  const endpoint = `https://${domain}/api/${version}/graphql.json`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const payload = (await response.json()) as ShopifyGraphqlResponse<T>;
  if (!response.ok) {
    throw new Error(`Shopify request failed (${response.status})`);
  }
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((err) => err.message).join("; "));
  }
  if (!payload.data) {
    throw new Error("Shopify returned no data.");
  }
  return payload.data;
}

export function formatMoney(amount: string, currencyCode: string): string {
  const value = Number(amount || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode || "USD",
  }).format(value);
}
