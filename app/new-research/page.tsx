import { ResearchEditor } from "@/components/research/research-editor";
import { requireUser } from "@/lib/auth";
import { loadResearchDataset } from "@/lib/research-store";

export default async function NewResearchPage() {
  await requireUser("/new-research");
  const dataset = await loadResearchDataset();

  return <ResearchEditor initialDataset={dataset} mode="create" />;
}
