import { describe, expect, it } from "vitest";
import {
  getForgotFieldErrors,
  getLoginFieldErrors,
  getRegisterFieldErrors,
  isFullNameValid,
  isPhoneValid,
  normalizeEmail,
  normalizeFullName,
} from "../client/src/lib/authValidation";

describe("shared auth validation helpers", () => {
  it("normalizes email and full name consistently", () => {
    expect(normalizeEmail("  USER@Example.COM ")).toBe("user@example.com");
    expect(normalizeFullName("  Reem   Alshareef  ")).toBe("Reem Alshareef");
  });

  it("accepts valid full names and rejects invalid ones", () => {
    expect(isFullNameValid("Reem Alshareef")).toBe(true);
    expect(isFullNameValid("12")).toBe(false);
  });

  it("accepts valid phone numbers and rejects invalid ones", () => {
    expect(isPhoneValid("+966 50 123 4567")).toBe(true);
    expect(isPhoneValid("abc123")).toBe(false);
  });

  it("returns field-level registration errors for invalid input", () => {
    expect(
      getRegisterFieldErrors({
        fullName: "1",
        email: "bad-email",
        phone: "abc123",
        password: "weak",
        confirmPassword: "different",
        captchaToken: "",
      })
    ).toEqual({
      fullName: "Use at least 2 letters and only letters, spaces, apostrophes, periods, or hyphens.",
      email: "Enter a valid email address.",
      phone: "Enter 7 to 15 digits using numbers, spaces, parentheses, hyphens, and an optional leading +.",
      password: "Password must satisfy all listed security rules.",
      confirmPassword: "Passwords do not match.",
      captcha: "Please complete the reCAPTCHA verification.",
    });
  });

  it("returns login validation errors for empty password and missing reCAPTCHA token", () => {
    expect(
      getLoginFieldErrors({
        email: "user@example.com",
        password: "",
        captchaToken: "",
      })
    ).toEqual({
      email: "",
      password: "Password is required.",
      captcha: "Please complete the reCAPTCHA verification before signing in.",
    });
  });

  it("returns forgot-password validation errors for invalid email, weak passwords, and missing reCAPTCHA token", () => {
    expect(
      getForgotFieldErrors({
        email: "missing-at-symbol",
        newPassword: "weakpass",
        confirmPassword: "mismatch",
        captchaToken: "",
      })
    ).toEqual({
      email: "Enter a valid email address.",
      newPassword: "Password must satisfy all listed security rules.",
      confirmPassword: "Passwords do not match.",
      captcha: "Please complete the reCAPTCHA verification before saving the new password.",
    });
  });
});
