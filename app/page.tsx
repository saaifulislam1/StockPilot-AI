import { ProductResearchDashboard } from "@/components/product-research-dashboard";
import { loadResearchDataset } from "@/lib/research-store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const dataset = await loadResearchDataset();

  return <ProductResearchDashboard initialDataset={dataset} />;
}
