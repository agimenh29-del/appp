import { NextRequest, NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/shopify";
import { CART_LINES_UPDATE_MUTATION } from "@/lib/shopifyQueries";
import { mapCart, RawCart } from "@/lib/shopifyMappers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cartId = String(body?.cartId || "").trim();
    const lineId = String(body?.lineId || "").trim();
    const quantity = Number(body?.quantity);

    if (!cartId || !lineId || !Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const data = await shopifyFetch<{
      cartLinesUpdate: { cart: RawCart | null; userErrors: Array<{ message: string }> };
    }>(CART_LINES_UPDATE_MUTATION, {
      cartId,
      lines: [{ id: lineId, quantity }],
    });

    const userError = data.cartLinesUpdate?.userErrors?.[0]?.message;
    if (userError) return NextResponse.json({ error: userError }, { status: 400 });

    return NextResponse.json({ cart: mapCart(data.cartLinesUpdate?.cart || null) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update line." }, { status: 500 });
  }
}
