import { PageLoadingState } from "@/components/research/ui";

export default function Loading() {
  return (
    <PageLoadingState
      title="Loading new research"
      body="Preparing the input workspace so you can start a new product analysis."
    />
  );
}
