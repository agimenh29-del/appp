import { NextRequest, NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/shopify";
import { CART_LINES_REMOVE_MUTATION } from "@/lib/shopifyQueries";
import { mapCart, RawCart } from "@/lib/shopifyMappers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cartId = String(body?.cartId || "").trim();
    const lineId = String(body?.lineId || "").trim();

    if (!cartId || !lineId) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const data = await shopifyFetch<{
      cartLinesRemove: { cart: RawCart | null; userErrors: Array<{ message: string }> };
    }>(CART_LINES_REMOVE_MUTATION, {
      cartId,
      lineIds: [lineId],
    });

    const userError = data.cartLinesRemove?.userErrors?.[0]?.message;
    if (userError) return NextResponse.json({ error: userError }, { status: 400 });

    return NextResponse.json({ cart: mapCart(data.cartLinesRemove?.cart || null) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to remove line." }, { status: 500 });
  }
}
