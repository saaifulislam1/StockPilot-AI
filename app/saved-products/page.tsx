import { SavedProductsGrid } from "@/components/saved-products-grid";
import { listSavedResearches } from "@/lib/research-store";

export default async function SavedProductsPage() {
  const items = await listSavedResearches();

  return <SavedProductsGrid items={items} />;
}
