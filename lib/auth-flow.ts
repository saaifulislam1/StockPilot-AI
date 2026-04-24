import { createRawToken, hashPassword } from "@/lib/auth-crypto";
import {
  consumeAuthToken,
  createAuthToken,
  getUserByEmail,
  markUserEmailVerified,
  updateUserPassword,
  upsertPendingUser,
} from "@/lib/auth-store";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "@/lib/auth-email";

function futureDate(hoursFromNow: number) {
  return new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
}

export async function registerUser(input: {
  email: string;
  name: string;
  password: string;
}) {
  const passwordHash = await hashPassword(input.password);
  const user = await upsertPendingUser({
    email: input.email,
    name: input.name,
    passwordHash,
  });
  await markUserEmailVerified(user.id);
}

export async function resendVerification(input: { email: string }) {
  const user = await getUserByEmail(input.email);

  if (!user || user.email_verified_at) {
    return;
  }

  const token = createRawToken();
  await createAuthToken({
    userId: user.id,
    email: user.email,
    rawToken: token,
    type: "email_verification",
    expiresAt: futureDate(24),
  });
  await sendVerificationEmail(user.email, token);
}

export async function verifyEmailToken(token: string) {
  const authToken = await consumeAuthToken(token, "email_verification");
  if (!authToken) {
    return false;
  }

  await markUserEmailVerified(authToken.user_id);
  return true;
}

export async function requestPasswordReset(input: { email: string }) {
  const user = await getUserByEmail(input.email);

  if (!user) {
    return;
  }

  const token = createRawToken();
  await createAuthToken({
    userId: user.id,
    email: user.email,
    rawToken: token,
    type: "password_reset",
    expiresAt: futureDate(2),
  });
  await sendPasswordResetEmail(user.email, token);
}

export async function resetPassword(input: {
  token: string;
  password: string;
}) {
  const authToken = await consumeAuthToken(input.token, "password_reset");
  if (!authToken) {
    return false;
  }

  const passwordHash = await hashPassword(input.password);
  await updateUserPassword(authToken.user_id, passwordHash);
  return true;
}
