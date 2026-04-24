import { notFound } from "next/navigation";

import { ResearchEditor } from "@/components/research/research-editor";
import { requireUser } from "@/lib/auth";
import { getSavedResearchById } from "@/lib/research-store";

export default async function SavedProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await requireUser(`/saved-products/${id}`);
  const dataset = await getSavedResearchById(userId, id);

  if (!dataset) {
    notFound();
  }

  return <ResearchEditor initialDataset={dataset} mode="detail" researchId={id} />;
}
