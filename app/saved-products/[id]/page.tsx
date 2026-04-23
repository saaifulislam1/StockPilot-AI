import { notFound } from "next/navigation";

import { ResearchEditor } from "@/components/research/research-editor";
import { getSavedResearchById } from "@/lib/research-store";

export default async function SavedProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dataset = await getSavedResearchById(id);

  if (!dataset) {
    notFound();
  }

  return <ResearchEditor initialDataset={dataset} mode="detail" researchId={id} />;
}
