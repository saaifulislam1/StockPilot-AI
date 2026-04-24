import { revalidatePath, revalidateTag } from "next/cache";

export function savedResearchesTag(userId: string) {
  return `saved-researches:${userId}`;
}

export function savedResearchTag(userId: string, id: string) {
  return `saved-research:${userId}:${id}`;
}

export function revalidateSavedResearches(userId: string) {
  revalidateTag(savedResearchesTag(userId), "max");
  revalidatePath("/saved-products");
}

export function revalidateSavedResearch(userId: string, id: string) {
  revalidateTag(savedResearchTag(userId, id), "max");
  revalidatePath(`/saved-products/${id}`);
}

export function revalidateResearchWrite(userId: string, id: string) {
  revalidateSavedResearches(userId);
  revalidateSavedResearch(userId, id);
}
