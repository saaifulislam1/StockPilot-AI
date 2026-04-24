import { revalidatePath, revalidateTag } from "next/cache";

export const SAVED_RESEARCHES_TAG = "saved-researches";

export function savedResearchTag(id: string) {
  return `saved-research:${id}`;
}

export function revalidateSavedResearches() {
  revalidateTag(SAVED_RESEARCHES_TAG, "max");
  revalidatePath("/saved-products");
}

export function revalidateSavedResearch(id: string) {
  revalidateTag(savedResearchTag(id), "max");
  revalidatePath(`/saved-products/${id}`);
}

export function revalidateResearchWrite(id: string) {
  revalidateSavedResearches();
  revalidateSavedResearch(id);
}
