import { NextRequest, NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/shopify";
import { CART_QUERY } from "@/lib/shopifyQueries";
import { mapCart, RawCart } from "@/lib/shopifyMappers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cartId = String(body?.cartId || "").trim();

    if (!cartId) {
      return NextResponse.json({ error: "Missing cartId." }, { status: 400 });
    }

    const data = await shopifyFetch<{ cart: RawCart | null }>(CART_QUERY, { cartId });
    if (!data.cart) {
      return NextResponse.json({ error: "Cart not found." }, { status: 404 });
    }

    return NextResponse.json({ cart: mapCart(data.cart) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load cart." }, { status: 500 });
  }
}
