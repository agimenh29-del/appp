export type RawCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: { amount: string; currencyCode: string } };
  lines: {
    nodes: Array<{
      id: string;
      quantity: number;
      merchandise: {
        id: string;
        title: string;
        price: { amount: string; currencyCode: string };
        product: { title: string; featuredImage?: { url: string; altText?: string | null } | null };
      };
    }>;
  };
};

export function mapCart(cart: RawCart | null) {
  if (!cart) return null;
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    subtotalAmount: cart.cost?.subtotalAmount,
    lines: (cart.lines?.nodes || []).map((line) => ({
      id: line.id,
      quantity: line.quantity,
      merchandiseId: line.merchandise?.id,
      title: line.merchandise?.title,
      productTitle: line.merchandise?.product?.title,
      image: line.merchandise?.product?.featuredImage?.url || null,
      price: line.merchandise?.price,
    })),
  };
}
