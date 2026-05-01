import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  registerCustomerAccount: vi.fn(),
  authenticateCustomerAccount: vi.fn(),
  resetCustomerAccountPassword: vi.fn(),
}));

const recaptchaMocks = vi.hoisted(() => ({
  verifyRecaptchaToken: vi.fn(),
}));

vi.mock("./db", () => ({
  registerCustomerAccount: dbMocks.registerCustomerAccount,
  authenticateCustomerAccount: dbMocks.authenticateCustomerAccount,
  resetCustomerAccountPassword: dbMocks.resetCustomerAccountPassword,
}));

vi.mock("./_core/recaptcha", () => ({
  verifyRecaptchaToken: recaptchaMocks.verifyRecaptchaToken,
}));

import { appRouter } from "./routers";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
      ip: "127.0.0.1",
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("auth credential routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    recaptchaMocks.verifyRecaptchaToken.mockResolvedValue(undefined);
  });

  it("registers a new account through the database layer", async () => {
    dbMocks.registerCustomerAccount.mockResolvedValue({
      success: true,
      account: {
        id: 7,
        fullName: "Sara Test",
        email: "sara.test@example.com",
        phone: "+966551112233",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.auth.register({
      fullName: "Sara Test",
      email: "sara.test@example.com",
      phone: "+966551112233",
      password: "Bloom@2028",
      captchaToken: "captcha-token",
    });

    expect(recaptchaMocks.verifyRecaptchaToken).toHaveBeenCalledWith("captcha-token", "127.0.0.1");
    expect(dbMocks.registerCustomerAccount).toHaveBeenCalledWith({
      fullName: "Sara Test",
      email: "sara.test@example.com",
      phone: "+966551112233",
      password: "Bloom@2028",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.account.email).toBe("sara.test@example.com");
    }
  });

  it("returns exists when the email has already been registered", async () => {
    dbMocks.registerCustomerAccount.mockResolvedValue({
      success: false,
      reason: "exists",
    });

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.auth.register({
      fullName: "Sara Test",
      email: "sara.test@example.com",
      phone: "+966551112233",
      password: "Bloom@2028",
      captchaToken: "captcha-token",
    });

    expect(result).toEqual({
      success: false,
      reason: "exists",
    });
  });

  it("rejects registration when the full name contains unsupported characters", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.auth.register({
        fullName: "12",
        email: "sara.test@example.com",
        phone: "+966551112233",
        password: "Bloom@2028",
        captchaToken: "captcha-token",
      })
    ).rejects.toThrow();

    expect(dbMocks.registerCustomerAccount).not.toHaveBeenCalled();
  });

  it("rejects registration when the phone number format is invalid", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.auth.register({
        fullName: "Sara Test",
        email: "sara.test@example.com",
        phone: "abc123",
        password: "Bloom@2028",
        captchaToken: "captcha-token",
      })
    ).rejects.toThrow();

    expect(dbMocks.registerCustomerAccount).not.toHaveBeenCalled();
  });

  it("rejects registration when the email exceeds the maximum length", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const email = `${"a".repeat(321)}@example.com`;

    await expect(
      caller.auth.register({
        fullName: "Sara Test",
        email,
        phone: "+966551112233",
        password: "Bloom@2028",
        captchaToken: "captcha-token",
      })
    ).rejects.toThrow();

    expect(dbMocks.registerCustomerAccount).not.toHaveBeenCalled();
  });

  it("rejects registration when the captcha token is missing", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.auth.register({
        fullName: "Sara Test",
        email: "sara.test@example.com",
        phone: "+966551112233",
        password: "Bloom@2028",
        captchaToken: "",
      })
    ).rejects.toThrow();

    expect(recaptchaMocks.verifyRecaptchaToken).not.toHaveBeenCalled();
    expect(dbMocks.registerCustomerAccount).not.toHaveBeenCalled();
  });

  it("authenticates a valid account through the database layer", async () => {
    dbMocks.authenticateCustomerAccount.mockResolvedValue({
      success: true,
      account: {
        id: 7,
        fullName: "Sara Test",
        email: "sara.test@example.com",
        phone: "+966551112233",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.auth.login({
      email: "sara.test@example.com",
      password: "Bloom@2028",
      captchaToken: "captcha-token",
    });

    expect(recaptchaMocks.verifyRecaptchaToken).toHaveBeenCalledWith("captcha-token", "127.0.0.1");
    expect(dbMocks.authenticateCustomerAccount).toHaveBeenCalledWith({
      email: "sara.test@example.com",
      password: "Bloom@2028",
    });
    expect(result.success).toBe(true);
  });

  it("returns invalid when login credentials do not match", async () => {
    dbMocks.authenticateCustomerAccount.mockResolvedValue({
      success: false,
      reason: "invalid",
    });

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.auth.login({
      email: "sara.test@example.com",
      password: "Wrong@2028",
      captchaToken: "captcha-token",
    });

    expect(result).toEqual({
      success: false,
      reason: "invalid",
    });
  });

  it("rejects login when the email format is invalid", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.auth.login({
        email: "not-an-email",
        password: "Bloom@2028",
        captchaToken: "captcha-token",
      })
    ).rejects.toThrow();

    expect(dbMocks.authenticateCustomerAccount).not.toHaveBeenCalled();
  });

  it("rejects login when the password exceeds the maximum length", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.auth.login({
        email: "sara.test@example.com",
        password: `A${"b".repeat(127)}1!`,
        captchaToken: "captcha-token",
      })
    ).rejects.toThrow();

    expect(dbMocks.authenticateCustomerAccount).not.toHaveBeenCalled();
  });

  it("rejects login when the captcha token is missing", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.auth.login({
        email: "sara.test@example.com",
        password: "Bloom@2028",
        captchaToken: "",
      })
    ).rejects.toThrow();

    expect(recaptchaMocks.verifyRecaptchaToken).not.toHaveBeenCalled();
    expect(dbMocks.authenticateCustomerAccount).not.toHaveBeenCalled();
  });

  it("updates the password through the database layer", async () => {
    dbMocks.resetCustomerAccountPassword.mockResolvedValue({
      success: true,
      account: {
        id: 7,
        fullName: "Sara Test",
        email: "sara.test@example.com",
        phone: "+966551112233",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.auth.resetPassword({
      email: "sara.test@example.com",
      newPassword: "Bloom@2029",
      captchaToken: "captcha-token",
    });

    expect(recaptchaMocks.verifyRecaptchaToken).toHaveBeenCalledWith("captcha-token", "127.0.0.1");
    expect(dbMocks.resetCustomerAccountPassword).toHaveBeenCalledWith({
      email: "sara.test@example.com",
      newPassword: "Bloom@2029",
    });
    expect(result.success).toBe(true);
  });

  it("returns missing when a password reset email is not found", async () => {
    dbMocks.resetCustomerAccountPassword.mockResolvedValue({
      success: false,
      reason: "missing",
    });

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.auth.resetPassword({
      email: "missing@example.com",
      newPassword: "Bloom@2029",
      captchaToken: "captcha-token",
    });

    expect(result).toEqual({
      success: false,
      reason: "missing",
    });
  });

  it("rejects password reset when the replacement password is weak", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.auth.resetPassword({
        email: "sara.test@example.com",
        newPassword: "weakpass",
        captchaToken: "captcha-token",
      })
    ).rejects.toThrow();

    expect(dbMocks.resetCustomerAccountPassword).not.toHaveBeenCalled();
  });

  it("rejects password reset when the replacement password exceeds the maximum length", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.auth.resetPassword({
        email: "sara.test@example.com",
        newPassword: `A${"b".repeat(127)}1!`,
        captchaToken: "captcha-token",
      })
    ).rejects.toThrow();

    expect(dbMocks.resetCustomerAccountPassword).not.toHaveBeenCalled();
  });

  it("rejects password reset when the captcha token is missing", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.auth.resetPassword({
        email: "sara.test@example.com",
        newPassword: "Bloom@2029",
        captchaToken: "",
      })
    ).rejects.toThrow();

    expect(recaptchaMocks.verifyRecaptchaToken).not.toHaveBeenCalled();
    expect(dbMocks.resetCustomerAccountPassword).not.toHaveBeenCalled();
  });
});
