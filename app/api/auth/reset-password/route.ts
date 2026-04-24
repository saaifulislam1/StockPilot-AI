import { resetPassword } from "@/lib/auth-flow";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      token?: string;
      password?: string;
    };
    const token = body.token?.trim() ?? "";
    const password = body.password ?? "";

    if (!token || !password) {
      return Response.json(
        { ok: false, error: "Token and password are required." },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return Response.json(
        { ok: false, error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    const didReset = await resetPassword({ token, password });
    if (!didReset) {
      return Response.json(
        { ok: false, error: "This reset link is invalid or expired." },
        { status: 400 },
      );
    }

    return Response.json({
      ok: true,
      message: "Password updated. You can sign in now.",
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unable to reset password.",
      },
      { status: 500 },
    );
  }
}
