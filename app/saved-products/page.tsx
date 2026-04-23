import { SavedProductsGrid } from "@/components/saved-products-grid";
import { listSavedResearches } from "@/lib/research-store";

export const dynamic = "force-dynamic";

export default async function SavedProductsPage() {
  const items = await listSavedResearches();

  return <SavedProductsGrid items={items} />;
}
