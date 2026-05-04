import { describe, expect, it } from "vitest";

const runLiveRecaptchaTest = process.env.RUN_LIVE_RECAPTCHA_TEST === "true";
const liveRecaptchaTest = runLiveRecaptchaTest ? it : it.skip;

describe("reCAPTCHA secret configuration", () => {
  liveRecaptchaTest(
    "accepts the configured secret key at Google's verification endpoint",
    async () => {
      const secret = process.env.RECAPTCHA_SECRET_KEY;

      expect(secret).toBeTruthy();

      let response: Response;

      try {
        response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            secret: secret ?? "",
            response: "floralink-secret-validation-probe",
          }),
        });
      } catch (error) {
        throw new Error(
          "Live reCAPTCHA verification could not reach Google's siteverify endpoint. Ensure external network access is available and rerun with RUN_LIVE_RECAPTCHA_TEST=true.",
          { cause: error },
        );
      }

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
    },
    15000,
  );
});
