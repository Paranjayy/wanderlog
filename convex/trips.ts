import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("trips", {
      userId: args.userId,
      name: args.name,
      description: args.description,
      startDate: args.startDate,
      endDate: args.endDate,
      placeIds: [],
      isCollaborative: false,
      collaborators: [],
      isPublic: true,
      createdAt: Date.now(),
    });
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("trips")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) return null;
    const user = await ctx.db.get(trip.userId);
    
    const places = [];
    for (const placeId of trip.placeIds) {
      const place = await ctx.db.get(placeId);
      if (place) places.push(place);
    }
    
    return { ...trip, user, places };
  },
});

export const addPlace = mutation({
  args: {
    tripId: v.id("trips"),
    placeId: v.id("places"),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) return;
    
    await ctx.db.patch(args.tripId, {
      placeIds: [...trip.placeIds, args.placeId],
    });
  },
});

export const removePlace = mutation({
  args: {
    tripId: v.id("trips"),
    placeId: v.id("places"),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) return;
    
    await ctx.db.patch(args.tripId, {
      placeIds: trip.placeIds.filter((id) => id !== args.placeId),
    });
  },
});

export const remove = mutation({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.tripId);
  },
});
