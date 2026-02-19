import { NextRequest, NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/shopify";
import { CART_CREATE_MUTATION, CART_LINES_ADD_MUTATION } from "@/lib/shopifyQueries";
import { mapCart, RawCart } from "@/lib/shopifyMappers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const merchandiseId = String(body?.merchandiseId || "").trim();
    const quantity = Number(body?.quantity || 1);
    let cartId = String(body?.cartId || "").trim();

    if (!merchandiseId || !Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    if (!cartId) {
      const created = await shopifyFetch<{
        cartCreate: { cart: RawCart | null; userErrors: Array<{ message: string }> };
      }>(CART_CREATE_MUTATION);
      const createError = created.cartCreate?.userErrors?.[0]?.message;
      if (createError) return NextResponse.json({ error: createError }, { status: 400 });
      cartId = created.cartCreate?.cart?.id || "";
    }

    const data = await shopifyFetch<{
      cartLinesAdd: { cart: RawCart | null; userErrors: Array<{ message: string }> };
    }>(CART_LINES_ADD_MUTATION, {
      cartId,
      lines: [{ merchandiseId, quantity }],
    });

    const userError = data.cartLinesAdd?.userErrors?.[0]?.message;
    if (userError) return NextResponse.json({ error: userError }, { status: 400 });

    return NextResponse.json({ cart: mapCart(data.cartLinesAdd?.cart || null) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to add line." }, { status: 500 });
  }
}
