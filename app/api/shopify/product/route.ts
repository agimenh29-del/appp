import { NextRequest, NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/shopify";
import { PRODUCT_BY_HANDLE_QUERY } from "@/lib/shopifyQueries";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const handle = String(body?.handle || "").trim();
    if (!handle) {
      return NextResponse.json({ error: "Missing handle." }, { status: 400 });
    }

    const data = await shopifyFetch<{
      product: {
        id: string;
        handle: string;
        title: string;
        description: string;
        images: { nodes: Array<{ url: string; altText?: string | null }> };
        variants: {
          nodes: Array<{
            id: string;
            title: string;
            selectedOptions: Array<{ name: string; value: string }>;
            price: { amount: string; currencyCode: string };
          }>;
        };
      } | null;
    }>(PRODUCT_BY_HANDLE_QUERY, { handle });

    if (!data.product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({
      product: {
        id: data.product.id,
        handle: data.product.handle,
        title: data.product.title,
        description: data.product.description,
        images: data.product.images?.nodes || [],
        variants: data.product.variants?.nodes || [],
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load product." }, { status: 500 });
  }
}
