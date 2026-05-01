import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  customerAccounts,
  type CustomerAccount,
  type InsertCustomerAccount,
  type InsertUser,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export type PublicCustomerAccount = Pick<CustomerAccount, "id" | "fullName" | "email" | "phone" | "createdAt" | "updatedAt">;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string) {
  const [salt, expectedHash] = storedHash.split(":");
  if (!salt || !expectedHash) {
    return false;
  }

  const actualHash = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHash, "hex");

  if (actualHash.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(actualHash, expected);
}

function toPublicCustomerAccount(account: CustomerAccount): PublicCustomerAccount {
  return {
    id: account.id,
    fullName: account.fullName,
    email: account.email,
    phone: account.phone,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getCustomerAccountByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const normalizedEmail = normalizeEmail(email);
  const result = await db
    .select()
    .from(customerAccounts)
    .where(eq(customerAccounts.email, normalizedEmail))
    .limit(1);

  return result[0];
}

export async function registerCustomerAccount(input: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const email = normalizeEmail(input.email);
  const existing = await getCustomerAccountByEmail(email);
  if (existing) {
    return { success: false as const, reason: "exists" as const };
  }

  const values: InsertCustomerAccount = {
    fullName: input.fullName.trim(),
    email,
    phone: input.phone.trim(),
    passwordHash: hashPassword(input.password),
    lastPasswordChangedAt: new Date(),
  };

  await db.insert(customerAccounts).values(values);
  const created = await getCustomerAccountByEmail(email);

  if (!created) {
    throw new Error("Account was not created");
  }

  return {
    success: true as const,
    account: toPublicCustomerAccount(created),
  };
}

export async function authenticateCustomerAccount(input: { email: string; password: string }) {
  const existing = await getCustomerAccountByEmail(input.email);
  if (!existing) {
    return { success: false as const, reason: "invalid" as const };
  }

  const valid = verifyPassword(input.password, existing.passwordHash);
  if (!valid) {
    return { success: false as const, reason: "invalid" as const };
  }

  return {
    success: true as const,
    account: toPublicCustomerAccount(existing),
  };
}

export async function resetCustomerAccountPassword(input: { email: string; newPassword: string }) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const existing = await getCustomerAccountByEmail(input.email);
  if (!existing) {
    return { success: false as const, reason: "missing" as const };
  }

  await db
    .update(customerAccounts)
    .set({
      passwordHash: hashPassword(input.newPassword),
      lastPasswordChangedAt: new Date(),
    })
    .where(eq(customerAccounts.id, existing.id));

  const updated = await getCustomerAccountByEmail(input.email);
  if (!updated) {
    throw new Error("Account update failed");
  }

  return {
    success: true as const,
    account: toPublicCustomerAccount(updated),
  };
}
