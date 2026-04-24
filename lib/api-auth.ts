import { auth } from "@/lib/auth";

export async function requireApiUser() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return {
      userId: null,
      response: Response.json({ ok: false, error: "Unauthorized" }, { status: 401 }),
    };
  }

  return {
    userId,
    response: null,
  };
}
