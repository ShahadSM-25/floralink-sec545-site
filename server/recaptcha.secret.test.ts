import { describe, expect, it } from "vitest";

describe("reCAPTCHA secret configuration", () => {
  it("accepts the configured secret key at Google's verification endpoint", async () => {
    const secret = process.env.RECAPTCHA_SECRET_KEY;

    expect(secret).toBeTruthy();

    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: secret ?? "",
        response: "manus-secret-validation-probe",
      }),
    });

    expect(response.ok).toBe(true);

    const payload = (await response.json()) as {
      success?: boolean;
      [key: string]: unknown;
      "error-codes"?: string[];
    };

    expect(Array.isArray(payload["error-codes"])).toBe(true);
    expect(payload["error-codes"]).not.toContain("invalid-input-secret");
    expect(payload["error-codes"]).not.toContain("missing-input-secret");
    expect(payload["error-codes"]).toContain("invalid-input-response");
  }, 15000);
});
