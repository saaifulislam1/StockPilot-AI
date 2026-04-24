import { registerUser } from "@/lib/auth-flow";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      name?: string;
      password?: string;
    };
    const email = body.email?.trim().toLowerCase() ?? "";
    const name = body.name?.trim() ?? "";
    const password = body.password ?? "";

    if (!name || !email || !password) {
      return Response.json(
        { ok: false, error: "Name, email, and password are required." },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return Response.json(
        { ok: false, error: "Enter a valid email address." },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return Response.json(
        { ok: false, error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    await registerUser({ email, name, password });

    return Response.json({
      ok: true,
      message: "Account created. You can log in now.",
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unable to register account.",
      },
      { status: 500 },
    );
  }
}
