import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  displayName: varchar("display_name"), // Custom display name that user can set
  profileImageUrl: varchar("profile_image_url"),
  customProfileImageUrl: varchar("custom_profile_image_url"), // User-uploaded profile picture
  timezone: varchar("timezone").default("UTC"),
  textSize: varchar("text_size").default("small"), // small, medium, large
  isAdmin: boolean("is_admin").default(false), // Admin flag
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Journal entries (AI conversations)
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  summary: text("summary"),
  conversation: jsonb("conversation").notNull(), // Array of messages
  tags: text("tags").array(),
  isComplete: boolean("is_complete").default(false), // Whether the conversation is finished
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ta-Done items (accomplishments)
export const taDoneItems = pgTable("ta_done_items", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  description: text("description").notNull(),
  goalId: integer("goal_id").references(() => goals.id), // Optional link to a goal
  createdAt: timestamp("created_at").defaultNow(),
});

// Gratitude entries
export const gratitudeItems = pgTable("gratitude_items", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Goals and intentions
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // health, career, relationships, personal, financial
  status: varchar("status").notNull().default("in_progress"), // in_progress, completed, archived
  progress: integer("progress").default(0), // 0-100
  startDate: timestamp("start_date").defaultNow(),
  targetDate: timestamp("target_date"),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// OpenAI usage tracking
export const openaiUsage = pgTable("openai_usage", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  endpoint: varchar("endpoint").notNull(), // chat, analysis, etc.
  model: varchar("model").notNull(), // gpt-4o, etc.
  inputTokens: integer("input_tokens").notNull(),
  outputTokens: integer("output_tokens").notNull(),
  totalTokens: integer("total_tokens").notNull(),
  estimatedCostCents: integer("estimated_cost_cents").notNull(), // stored as cents to avoid floating point issues
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  journalEntries: many(journalEntries),
  taDoneItems: many(taDoneItems),
  gratitudeItems: many(gratitudeItems),
  goals: many(goals),
  openaiUsage: many(openaiUsage),
}));

export const openaiUsageRelations = relations(openaiUsage, ({ one }) => ({
  user: one(users, {
    fields: [openaiUsage.userId],
    references: [users.id],
  }),
}));

export const goalsRelations = relations(goals, ({ one, many }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id],
  }),
  taDoneItems: many(taDoneItems),
}));

export const journalEntriesRelations = relations(journalEntries, ({ one }) => ({
  user: one(users, {
    fields: [journalEntries.userId],
    references: [users.id],
  }),
}));

export const taDoneItemsRelations = relations(taDoneItems, ({ one }) => ({
  user: one(users, {
    fields: [taDoneItems.userId],
    references: [users.id],
  }),
  goal: one(goals, {
    fields: [taDoneItems.goalId],
    references: [goals.id],
  }),
}));

export const gratitudeItemsRelations = relations(gratitudeItems, ({ one }) => ({
  user: one(users, {
    fields: [gratitudeItems.userId],
    references: [users.id],
  }),
}));



// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertTaDoneItemSchema = createInsertSchema(taDoneItems).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertGratitudeItemSchema = createInsertSchema(gratitudeItems).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  // Allow completedAt to be a string that will be converted to Date
  completedAt: z.union([z.date(), z.string(), z.null()]).optional(),
  startDate: z.union([z.date(), z.string()]).optional(),
  targetDate: z.union([z.date(), z.string()]).optional(),
});

export const insertOpenaiUsageSchema = createInsertSchema(openaiUsage).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type UpdateUser = Partial<Omit<UpsertUser, 'id' | 'createdAt'>>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type TaDoneItem = typeof taDoneItems.$inferSelect;
export type InsertTaDoneItem = z.infer<typeof insertTaDoneItemSchema>;
export type GratitudeItem = typeof gratitudeItems.$inferSelect;
export type InsertGratitudeItem = z.infer<typeof insertGratitudeItemSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type OpenaiUsage = typeof openaiUsage.$inferSelect;
export type InsertOpenaiUsage = z.infer<typeof insertOpenaiUsageSchema>;

// Message types for chat conversations
export type ChatMessage = {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
};

export type Conversation = ChatMessage[];
