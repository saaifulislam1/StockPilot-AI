import { ResearchEditor } from "@/components/research/research-editor";
import { loadResearchDataset } from "@/lib/research-store";

export default async function NewResearchPage() {
  const dataset = await loadResearchDataset();

  return <ResearchEditor initialDataset={dataset} mode="create" />;
}
