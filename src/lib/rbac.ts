export function canViewPurchaserOnlyDoc(
  user: any,
  prop: { purchasedCustomerId?: string | null }
) {
  if (!user) return false;
  if (user.role === "admin" || user.role === "owner") return true;
  return (
    user.role === "customer" &&
    !!prop?.purchasedCustomerId &&
    user.id === prop.purchasedCustomerId
  );
}
