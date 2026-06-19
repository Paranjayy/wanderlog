import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    username: v.string(),
    displayName: v.string(),
    avatar: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        displayName: args.displayName,
        avatar: args.avatar,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      username: args.username,
      displayName: args.displayName,
      avatar: args.avatar,
      isPublic: true,
      travelCount: 0,
      followersCount: 0,
      followingCount: 0,
    });
  },
});

export const upsertFromClerk = mutation({
  args: {
    clerkId: v.string(),
    username: v.string(),
    displayName: v.string(),
    avatar: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        displayName: args.displayName,
        avatar: args.avatar,
        username: args.username,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      username: args.username,
      displayName: args.displayName,
      avatar: args.avatar,
      isPublic: true,
      travelCount: 0,
      followersCount: 0,
      followingCount: 0,
    });
  },
});

export const getCurrentUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

export const getByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
  },
});

export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    bio: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    await ctx.db.patch(userId, updates);
  },
});
