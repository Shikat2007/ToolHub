/**
 * Tool usage tracking and admin analytics.
 *
 * Mutations log every tool invocation. Queries power the admin dashboard
 * with real-time stats pulled from the database.
 */

import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";

// ── Mutations ───────────────────────────────────────────────────────────────

/** Log a tool usage event. Called by the client after a successful tool run. */
export const logUsage = mutation({
  args: {
    toolId: v.string(),
    toolName: v.string(),
    inputSize: v.optional(v.number()),
    outputSize: v.optional(v.number()),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db.insert("toolUsage", {
      userId,
      toolId: args.toolId,
      toolName: args.toolName,
      inputSize: args.inputSize,
      outputSize: args.outputSize,
      metadata: args.metadata,
      createdAt: Date.now(),
    });
  },
});

// ── Admin Queries ───────────────────────────────────────────────────────────

/** Total tool usage count. */
export const totalUses = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("toolUsage").collect();
    return all.length;
  },
});

/** Per-tool usage counts. */
export const toolUsageByTool = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("toolUsage").collect();
    const counts: Record<
      string,
      { toolName: string; count: number; lastUsed: number }
    > = {};

    for (const entry of all) {
      if (!counts[entry.toolId]) {
        counts[entry.toolId] = {
          toolName: entry.toolName,
          count: 0,
          lastUsed: entry.createdAt,
        };
      }
      counts[entry.toolId].count++;
      if (entry.createdAt > counts[entry.toolId].lastUsed) {
        counts[entry.toolId].lastUsed = entry.createdAt;
      }
    }

    return Object.entries(counts).map(([toolId, data]) => ({
      toolId,
      ...data,
    }));
  },
});

/** Recent activity log (last 50 entries). */
export const recentActivity = query({
  args: {},
  handler: async (ctx) => {
    const entries = await ctx.db
      .query("toolUsage")
      .order("desc")
      .take(50);

    const enriched = await Promise.all(
      entries.map(async (entry) => {
        const user = await ctx.db.get(entry.userId);
        return {
          _id: entry._id,
          toolId: entry.toolId,
          toolName: entry.toolName,
          inputSize: entry.inputSize,
          outputSize: entry.outputSize,
          metadata: entry.metadata,
          createdAt: entry.createdAt,
          userName: user && "name" in user ? (user.name ?? "Unknown") : "Unknown",
          userEmail: user && "email" in user ? (user.email ?? "") : "",
        };
      }),
    );

    return enriched;
  },
});

/** Weekly usage trend — count of uses per day for the last 7 days. */
export const weeklyTrend = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    const entries = await ctx.db.query("toolUsage").collect();
    const recent = entries.filter((e) => e.createdAt >= sevenDaysAgo);

    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split("T")[0];
      days[key] = 0;
    }

    for (const entry of recent) {
      const key = new Date(entry.createdAt).toISOString().split("T")[0];
      if (key in days) {
        days[key]++;
      }
    }

    return Object.entries(days).map(([date, count]) => ({ date, count }));
  },
});

/** Unique team members who have used tools. */
export const activeTeamMembers = query({
  args: {},
  handler: async (ctx) => {
    const entries = await ctx.db.query("toolUsage").collect();
    const userIds = new Set<string>();
    for (const e of entries) {
      userIds.add(e.userId.toString());
    }

    const members: Array<{
      id: string;
      name: string;
      email: string;
      image: string | undefined;
      role: string;
    }> = [];

    for (const idStr of userIds) {
      const user = await ctx.db.get(idStr as any);
      if (user && "name" in user) {
        members.push({
          id: user._id.toString(),
          name: (user.name as string) ?? "Unknown",
          email: (user.email as string) ?? "",
          image: user.image as string | undefined,
          role: (user.role as string) ?? "member",
        });
      }
    }

    return members;
  },
});

/** Admin-only: list all registered users with their usage count. */
export const adminUserList = query({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    const usageEntries = await ctx.db.query("toolUsage").collect();

    const usageCounts: Record<string, number> = {};
    const lastActiveMap: Record<string, number> = {};
    for (const entry of usageEntries) {
      const uid = entry.userId.toString();
      usageCounts[uid] = (usageCounts[uid] ?? 0) + 1;
      if (!lastActiveMap[uid] || entry.createdAt > lastActiveMap[uid]) {
        lastActiveMap[uid] = entry.createdAt;
      }
    }

    return allUsers
      .filter((u) => "name" in u)
      .map((user) => ({
        id: user._id.toString(),
        name: (user.name as string) ?? "Unknown",
        email: (user.email as string) ?? "",
        image: user.image as string | undefined,
        role: (user.role as string) ?? "member",
        toolsUsed: usageCounts[user._id.toString()] ?? 0,
        lastActive: lastActiveMap[user._id.toString()] ?? null,
      }));
  },
});
