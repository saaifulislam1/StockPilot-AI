import { SavedProductsGrid } from "@/components/saved-products-grid";
import { requireUser } from "@/lib/auth";
import { listSavedResearches } from "@/lib/research-store";

export default async function SavedProductsPage() {
  const { userId } = await requireUser("/saved-products");
  const items = await listSavedResearches(userId);

  return <SavedProductsGrid items={items} />;
}
