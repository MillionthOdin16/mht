import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Daily Entry Schema
export const dailyEntries = pgTable("daily_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: date("date").notNull(),
  mood: integer("mood").notNull(), // 1-10 scale
  energy: integer("energy").notNull(), // 1-10 scale
  sleep: integer("sleep").notNull(), // 1-10 scale
  medications: jsonb("medications").$type<string[]>().notNull().default(sql`'[]'`), // Array of medication names
  siTracking: jsonb("si_tracking").$type<{
    present: boolean;
    intensity?: number;
    thoughts?: string;
  }>().notNull().default(sql`'{"present":false}'`),
  diary: text("diary").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Social Interactions Schema
export const socialInteractions = pgTable("social_interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entryId: varchar("entry_id").references(() => dailyEntries.id, { onDelete: "cascade" }).notNull(),
  type: text("type").notNull(), // e.g., "friend", "family", "colleague"
  quality: integer("quality").notNull(), // 1-10 scale
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Activities Schema
export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entryId: varchar("entry_id").references(() => dailyEntries.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  duration: integer("duration").notNull().default(0), // in minutes
  enjoyment: integer("enjoyment").notNull().default(5), // 1-10 scale
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Triggers Schema
export const triggers = pgTable("triggers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entryId: varchar("entry_id").references(() => dailyEntries.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  severity: integer("severity").notNull(), // 1-10 scale
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Medications List Schema
export const medications = pgTable("medications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  isActive: integer("is_active").notNull().default(1), // 0 or 1
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert Schemas
export const insertDailyEntrySchema = createInsertSchema(dailyEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSocialInteractionSchema = createInsertSchema(socialInteractions).omit({
  id: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertTriggerSchema = createInsertSchema(triggers).omit({
  id: true,
  createdAt: true,
});

export const insertMedicationSchema = createInsertSchema(medications).omit({
  id: true,
  createdAt: true,
});

// Types
export type DailyEntry = typeof dailyEntries.$inferSelect;
export type InsertDailyEntry = z.infer<typeof insertDailyEntrySchema>;

export type SocialInteraction = typeof socialInteractions.$inferSelect;
export type InsertSocialInteraction = z.infer<typeof insertSocialInteractionSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Trigger = typeof triggers.$inferSelect;
export type InsertTrigger = z.infer<typeof insertTriggerSchema>;

export type Medication = typeof medications.$inferSelect;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;

// Combined Entry with modules
export type CompleteEntry = DailyEntry & {
  socialInteractions: SocialInteraction[];
  activities: Activity[];
  triggers: Trigger[];
};
