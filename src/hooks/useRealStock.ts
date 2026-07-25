import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Real stock per catalog product:
 *   initial (inventory.quantity_sqm) + sum(inventory_movements.quantity)
 * grouped by product_id.
 */
export function useRealStock() {
  const { data: inventory = [] } = useQuery({
    queryKey: ["inventory-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inventory").select("*");
      if (error) throw error;
      return (data as any[]) || [];
    },
  });

  const { data: movements = [] } = useQuery({
    queryKey: ["inventory-movements-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_movements" as any)
        .select("id, product_id, inventory_id, quantity, movement_type, created_at, note, reference_sale_id, reference_site_id");
      if (error) throw error;
      return (data as any[]) || [];
    },
  });

  // stock aggregated by product_id (real stock)
  const stockByProduct = new Map<string, number>();
  // min stock aggregated by product_id (max of related inventory rows' min_stock)
  const minByProduct = new Map<string, number>();
  // inventory rows by product_id
  const inventoryByProduct = new Map<string, any[]>();

  for (const inv of inventory) {
    if (!inv.product_id) continue;
    stockByProduct.set(inv.product_id, (stockByProduct.get(inv.product_id) || 0) + Number(inv.quantity_sqm || 0));
    const min = Number(inv.min_stock ?? inv.low_stock_threshold ?? 0);
    if (min > 0) minByProduct.set(inv.product_id, Math.max(min, minByProduct.get(inv.product_id) || 0));
    if (!inventoryByProduct.has(inv.product_id)) inventoryByProduct.set(inv.product_id, []);
    inventoryByProduct.get(inv.product_id)!.push(inv);
  }
  for (const m of movements) {
    if (!m.product_id) continue;
    stockByProduct.set(m.product_id, (stockByProduct.get(m.product_id) || 0) + Number(m.quantity || 0));
  }

  const movementsByInventoryId = new Map<string, any[]>();
  const movementsByProductId = new Map<string, any[]>();
  for (const m of movements) {
    if (m.inventory_id) {
      if (!movementsByInventoryId.has(m.inventory_id)) movementsByInventoryId.set(m.inventory_id, []);
      movementsByInventoryId.get(m.inventory_id)!.push(m);
    }
    if (m.product_id) {
      if (!movementsByProductId.has(m.product_id)) movementsByProductId.set(m.product_id, []);
      movementsByProductId.get(m.product_id)!.push(m);
    }
  }

  const getRealStock = (productId?: string | null) =>
    productId ? stockByProduct.get(productId) ?? 0 : 0;
  const getMinStock = (productId?: string | null) =>
    productId ? minByProduct.get(productId) ?? 0 : 0;
  const isLowStock = (productId?: string | null) => {
    const min = getMinStock(productId);
    return min > 0 && getRealStock(productId) < min;
  };
  const countLowStock = (products: { id: string }[]) =>
    products.filter((p) => isLowStock(p.id)).length;

  return {
    inventory,
    movements,
    stockByProduct,
    minByProduct,
    inventoryByProduct,
    movementsByInventoryId,
    movementsByProductId,
    getRealStock,
    getMinStock,
    isLowStock,
    countLowStock,
  };
}
