import { TRPCError } from "@trpc/server";
import { ENV } from "./env";

type RecaptchaVerificationResponse = {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  score?: number;
  action?: string;
  "error-codes"?: string[];
};

export async function verifyRecaptchaToken(token: string, remoteIp?: string) {
  if (!ENV.recaptchaSecretKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "reCAPTCHA secret key is not configured.",
    });
  }

  const trimmedToken = token.trim();
  if (!trimmedToken) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Missing reCAPTCHA token.",
    });
  }

  const body = new URLSearchParams({
    secret: ENV.recaptchaSecretKey,
    response: trimmedToken,
  });

  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

  let payload: RecaptchaVerificationResponse;

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok) {
      throw new Error(`reCAPTCHA verification failed with status ${response.status}`);
    }

    payload = (await response.json()) as RecaptchaVerificationResponse;
  } catch (error) {
    console.error("[reCAPTCHA] verification request failed", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Unable to verify reCAPTCHA right now.",
    });
  }

  if (!payload.success) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "reCAPTCHA verification failed.",
      cause: payload["error-codes"],
    });
  }
}
