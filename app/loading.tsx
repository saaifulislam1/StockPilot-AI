import { PageLoadingState } from "@/components/research/ui";

export default function Loading() {
  return (
    <PageLoadingState
      title="Loading workspace"
      body="Preparing the current page and pulling the latest research data."
    />
  );
}
