import { resendVerification } from "@/lib/auth-flow";

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

    await resendVerification({ email });

    return Response.json({
      ok: true,
      message:
        "If the account exists and is not verified, a verification email has been sent.",
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to resend verification email.",
      },
      { status: 500 },
    );
  }
}
