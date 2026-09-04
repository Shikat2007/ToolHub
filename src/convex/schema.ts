import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // ── Tool Hub tables ────────────────────────────────────────

    /** Every tool invocation is logged here for admin analytics. */
    toolUsage: defineTable({
      userId: v.id("users"),
      toolId: v.string(),
      toolName: v.string(),
      inputSize: v.optional(v.number()), // bytes ingested
      outputSize: v.optional(v.number()), // bytes produced
      metadata: v.optional(v.string()), // JSON string for extra info
      createdAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_tool", ["toolId"])
      .index("by_createdAt", ["createdAt"]),

    /** Per-IP rate-limit counters, auto-cleaned. */
    rateLimitLog: defineTable({
      ip: v.string(),
      windowStart: v.number(),
      count: v.number(),
    }).index("by_ip_window", ["ip", "windowStart"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
