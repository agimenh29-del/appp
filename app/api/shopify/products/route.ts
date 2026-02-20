import { NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/shopify";
import { PRODUCTS_QUERY } from "@/lib/shopifyQueries";

export async function POST() {
  const hasConfig = Boolean(
    process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  );
  if (!hasConfig) {
    return NextResponse.json({
      products: [],
      warning: "Shopify is not configured yet. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN.",
    });
  }

  try {
    const data = await shopifyFetch<{
      products: {
        nodes: Array<{
          id: string;
          handle: string;
          title: string;
          featuredImage: { url: string; altText?: string | null } | null;
          priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
        }>;
      };
    }>(PRODUCTS_QUERY, { first: 60 });

    const products = (data.products?.nodes || []).map((product) => ({
      id: product.id,
      handle: product.handle,
      title: product.title,
      featuredImage: product.featuredImage,
      price: product.priceRange?.minVariantPrice,
    }));

    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load products." }, { status: 500 });
  }
}
