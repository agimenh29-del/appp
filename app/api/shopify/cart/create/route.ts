import { NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/shopify";
import { CART_CREATE_MUTATION } from "@/lib/shopifyQueries";
import { mapCart, RawCart } from "@/lib/shopifyMappers";

export async function POST() {
  try {
    const data = await shopifyFetch<{
      cartCreate: {
        cart: RawCart | null;
        userErrors: Array<{ message: string }>;
      };
    }>(CART_CREATE_MUTATION);

    const userError = data.cartCreate?.userErrors?.[0]?.message;
    if (userError) {
      return NextResponse.json({ error: userError }, { status: 400 });
    }

    return NextResponse.json({ cart: mapCart(data.cartCreate?.cart || null) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create cart." }, { status: 500 });
  }
}
