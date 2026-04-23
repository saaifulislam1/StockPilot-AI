import { PageLoadingState } from "@/components/research/ui";

export default function Loading() {
  return (
    <PageLoadingState
      title="Loading saved products"
      body="Fetching the saved research records and the latest summary details."
    />
  );
}
