import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import {
  authenticateCustomerAccount,
  registerCustomerAccount,
  resetCustomerAccountPassword,
} from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { verifyRecaptchaToken } from "./_core/recaptcha";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const emailSchema = z.string().trim().max(320).email();
const fullNameSchema = z
  .string()
  .trim()
  .min(2)
  .max(160)
  .regex(/^[\p{L}][\p{L}\s'.-]*$/u, "Full name contains unsupported characters");
const phoneSchema = z
  .string()
  .trim()
  .min(7)
  .max(32)
  .regex(/^\+?[0-9()\-\s]+$/, "Phone number contains unsupported characters")
  .refine(value => {
    const digits = value.replace(/\D/g, "").length;
    return digits >= 7 && digits <= 15;
  }, "Phone number must contain between 7 and 15 digits");
const passwordSchema = z
  .string()
  .max(128)
  .min(8)
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/\d/, "Password must contain a number")
  .regex(/[^A-Za-z0-9]/, "Password must contain a special character")
  .refine(value => !/(password|123456|qwerty|welcome)/i.test(value), {
    message: "Password is too common",
  });
const captchaTokenSchema = z.string().trim().min(1).max(4096);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    register: publicProcedure
      .input(
        z.object({
          fullName: fullNameSchema,
          email: emailSchema,
          phone: phoneSchema,
          password: passwordSchema,
          captchaToken: captchaTokenSchema,
        }),
      )
      .mutation(async ({ ctx, input }) => {
        await verifyRecaptchaToken(input.captchaToken, ctx.req.ip);
        const result = await registerCustomerAccount({
          fullName: input.fullName,
          email: input.email,
          phone: input.phone,
          password: input.password,
        });
        if (!result.success) {
          return result;
        }

        return {
          success: true as const,
          account: result.account,
        };
      }),
    login: publicProcedure
      .input(
        z.object({
          email: emailSchema,
          password: z.string().max(128).min(1),
          captchaToken: captchaTokenSchema,
        }),
      )
      .mutation(async ({ ctx, input }) => {
        await verifyRecaptchaToken(input.captchaToken, ctx.req.ip);
        const result = await authenticateCustomerAccount({
          email: input.email,
          password: input.password,
        });
        if (!result.success) {
          return result;
        }

        return {
          success: true as const,
          account: result.account,
        };
      }),
    resetPassword: publicProcedure
      .input(
        z.object({
          email: emailSchema,
          newPassword: passwordSchema,
          captchaToken: captchaTokenSchema,
        }),
      )
      .mutation(async ({ ctx, input }) => {
        await verifyRecaptchaToken(input.captchaToken, ctx.req.ip);
        const result = await resetCustomerAccountPassword({
          email: input.email,
          newPassword: input.newPassword,
        });
        if (!result.success) {
          return result;
        }

        return {
          success: true as const,
          account: result.account,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
