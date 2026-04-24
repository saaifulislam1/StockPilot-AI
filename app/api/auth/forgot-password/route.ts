import { requestPasswordReset } from "@/lib/auth-flow";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase() ?? "";

    if (!email) {
      return Response.json(
        { ok: false, error: "Email is required." },
        { status: 400 },
      );
    }

    await requestPasswordReset({ email });

    return Response.json({
      ok: true,
      message:
        "If the account exists, a password reset email has been sent.",
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to start password reset.",
      },
      { status: 500 },
    );
  }
}
