import {
  users,
  journalEntries,
  taDoneItems,
  gratitudeItems,
  goals,
  openaiUsage,
  type User,
  type UpsertUser,
  type UpdateUser,
  type JournalEntry,
  type InsertJournalEntry,
  type TaDoneItem,
  type InsertTaDoneItem,
  type GratitudeItem,
  type InsertGratitudeItem,
  type Goal,
  type InsertGoal,
  type OpenaiUsage,
  type InsertOpenaiUsage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lt, sum } from "drizzle-orm";

export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: UpdateUser): Promise<User>;
  
  // Journal operations
  createJournalEntry(userId: string, entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(entryId: number, userId: string, updates: Partial<JournalEntry>): Promise<JournalEntry>;
  getJournalEntries(userId: string): Promise<JournalEntry[]>;
  getJournalEntry(id: number, userId: string): Promise<JournalEntry | undefined>;
  getTodaysActiveConversation(userId: string): Promise<JournalEntry | undefined>;
  
  // Ta-Done operations
  createTaDoneItem(userId: string, item: InsertTaDoneItem): Promise<TaDoneItem>;
  getTaDoneItems(userId: string): Promise<TaDoneItem[]>;
  
  // Gratitude operations
  createGratitudeItem(userId: string, item: InsertGratitudeItem): Promise<GratitudeItem>;
  getGratitudeItems(userId: string): Promise<GratitudeItem[]>;
  
  // Goal operations
  createGoal(userId: string, goal: InsertGoal): Promise<Goal>;
  getGoals(userId: string): Promise<Goal[]>;
  updateGoal(id: number, updates: Partial<InsertGoal>, userId?: string): Promise<Goal>;
  deleteGoal(id: number, userId: string): Promise<void>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  getUserUsageStats(userId: string): Promise<{ totalCostDollars: string; totalTokens: number; requestCount: number }>;
  getAllUsageStats(): Promise<Array<{ userId: string; email: string; firstName: string; totalCostDollars: string; totalTokens: number; requestCount: number }>>;
  setUserAdmin(userId: string, isAdmin: boolean): Promise<User>;
  deleteUser(userId: string): Promise<void>;
  
  // OpenAI usage tracking
  createOpenaiUsage(usage: InsertOpenaiUsage): Promise<OpenaiUsage>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: UpdateUser): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Journal operations
  async createJournalEntry(userId: string, entry: InsertJournalEntry): Promise<JournalEntry> {
    const [journalEntry] = await db
      .insert(journalEntries)
      .values({
        ...entry,
        userId,
      })
      .returning();
    return journalEntry;
  }

  async getJournalEntries(userId: string): Promise<JournalEntry[]> {
    return await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.createdAt));
  }

  async getJournalEntry(id: number, userId: string): Promise<JournalEntry | undefined> {
    const [entry] = await db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));
    return entry;
  }

  async updateJournalEntry(entryId: number, userId: string, updates: Partial<JournalEntry>): Promise<JournalEntry> {
    const [entry] = await db
      .update(journalEntries)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)))
      .returning();
    return entry;
  }

  async deleteJournalEntry(id: number, userId: string): Promise<void> {
    await db
      .delete(journalEntries)
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));
  }

  async getTodaysActiveConversation(userId: string): Promise<JournalEntry | undefined> {
    // Get user's timezone
    const user = await this.getUser(userId);
    const userTimezone = user?.timezone || 'America/New_York';
    
    // Get all incomplete entries and filter by calendar day
    const incompleteEntries = await db
      .select()
      .from(journalEntries)
      .where(
        and(
          eq(journalEntries.userId, userId),
          eq(journalEntries.isComplete, false)
        )
      )
      .orderBy(desc(journalEntries.createdAt));
    
    console.log(`Found ${incompleteEntries.length} incomplete entries for user ${userId}`);
    
    // Filter for today's entries by comparing calendar dates in user's timezone
    const now = new Date();
    const todayInUserTz = new Intl.DateTimeFormat('en-CA', { timeZone: userTimezone }).format(now);
    
    for (const entry of incompleteEntries) {
      if (entry.createdAt) {
        const entryDateInUserTz = new Intl.DateTimeFormat('en-CA', { timeZone: userTimezone }).format(entry.createdAt);
        console.log(`Entry ${entry.id}: created ${entryDateInUserTz}, today is ${todayInUserTz}`);
        
        if (entryDateInUserTz === todayInUserTz) {
          console.log(`Found today's entry: ID ${entry.id}`);
          return entry;
        }
      }
    }
    
    console.log('No conversation found for today, will start fresh');
    return undefined;
  }

  // Ta-Done operations
  async createTaDoneItem(userId: string, item: InsertTaDoneItem): Promise<TaDoneItem> {
    const [taDoneItem] = await db
      .insert(taDoneItems)
      .values({
        ...item,
        userId,
      })
      .returning();
    return taDoneItem;
  }

  async getTaDoneItems(userId: string): Promise<TaDoneItem[]> {
    return await db
      .select()
      .from(taDoneItems)
      .where(eq(taDoneItems.userId, userId))
      .orderBy(desc(taDoneItems.createdAt));
  }

  async deleteTaDoneItem(id: number, userId: string): Promise<void> {
    await db
      .delete(taDoneItems)
      .where(and(eq(taDoneItems.id, id), eq(taDoneItems.userId, userId)));
  }

  // Gratitude operations
  async createGratitudeItem(userId: string, item: InsertGratitudeItem): Promise<GratitudeItem> {
    const [gratitudeItem] = await db
      .insert(gratitudeItems)
      .values({
        ...item,
        userId,
      })
      .returning();
    return gratitudeItem;
  }

  async getGratitudeItems(userId: string): Promise<GratitudeItem[]> {
    return await db
      .select()
      .from(gratitudeItems)
      .where(eq(gratitudeItems.userId, userId))
      .orderBy(desc(gratitudeItems.createdAt));
  }

  async deleteGratitudeItem(id: number, userId: string): Promise<void> {
    await db
      .delete(gratitudeItems)
      .where(and(eq(gratitudeItems.id, id), eq(gratitudeItems.userId, userId)));
  }

  // Goal operations
  async createGoal(userId: string, goal: InsertGoal): Promise<Goal> {
    const [newGoal] = await db
      .insert(goals)
      .values({
        ...goal,
        userId,
      })
      .returning();
    return newGoal;
  }

  async getGoals(userId: string): Promise<Goal[]> {
    return await db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(desc(goals.createdAt));
  }

  async updateGoal(id: number, updates: Partial<InsertGoal>, userId?: string): Promise<Goal> {
    const updateData: any = {
      ...updates,
      updatedAt: new Date(),
    };
    
    // Convert date strings to Date objects if present and not null
    if (updates.completedAt && updates.completedAt !== null) {
      updateData.completedAt = typeof updates.completedAt === 'string' 
        ? new Date(updates.completedAt) 
        : updates.completedAt;
    } else if (updates.completedAt === null) {
      updateData.completedAt = null;
    }
    
    if (updates.startDate && typeof updates.startDate === 'string') {
      updateData.startDate = new Date(updates.startDate);
    }
    
    if (updates.targetDate && typeof updates.targetDate === 'string') {
      updateData.targetDate = new Date(updates.targetDate);
    }
    
    const whereCondition = userId 
      ? and(eq(goals.id, id), eq(goals.userId, userId))
      : eq(goals.id, id);
    
    const [updatedGoal] = await db
      .update(goals)
      .set(updateData)
      .where(whereCondition)
      .returning();
    
    if (!updatedGoal) {
      throw new Error("Goal not found or you don't have permission to update it");
    }
    
    return updatedGoal;
  }

  async deleteGoal(id: number, userId: string): Promise<void> {
    await db
      .delete(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, userId)));
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  async getUserUsageStats(userId: string): Promise<{ totalCostDollars: string; totalTokens: number; requestCount: number }> {
    const costResult = await db
      .select({
        totalCostCents: sum(openaiUsage.estimatedCostCents),
        totalTokens: sum(openaiUsage.totalTokens),
      })
      .from(openaiUsage)
      .where(eq(openaiUsage.userId, userId));
      
    const countResult = await db
      .select()
      .from(openaiUsage)
      .where(eq(openaiUsage.userId, userId));
    
    const totalCostCents = parseInt(costResult[0]?.totalCostCents?.toString() || "0");
    const totalCostDollars = (totalCostCents / 100).toFixed(4);
    
    return {
      totalCostDollars,
      totalTokens: parseInt(costResult[0]?.totalTokens?.toString() || "0"),
      requestCount: countResult.length
    };
  }

  async getAllUsageStats(): Promise<Array<{ userId: string; email: string; firstName: string; totalCostDollars: string; totalTokens: number; requestCount: number }>> {
    const allUsers = await db.select().from(users);
    const results = [];
    
    for (const user of allUsers) {
      const usageStats = await this.getUserUsageStats(user.id);
      results.push({
        userId: user.id,
        email: user.email || "",
        firstName: user.firstName || "",
        totalCostDollars: usageStats.totalCostDollars,
        totalTokens: usageStats.totalTokens,
        requestCount: usageStats.requestCount
      });
    }
    
    return results;
  }

  async setUserAdmin(userId: string, isAdmin: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isAdmin, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    // Delete all user-related data in correct order (foreign key constraints)
    await db.delete(openaiUsage).where(eq(openaiUsage.userId, userId));
    await db.delete(journalEntries).where(eq(journalEntries.userId, userId));
    await db.delete(gratitudeItems).where(eq(gratitudeItems.userId, userId));
    await db.delete(goals).where(eq(goals.userId, userId));
    await db.delete(taDoneItems).where(eq(taDoneItems.userId, userId));
    
    // Finally delete the user
    await db.delete(users).where(eq(users.id, userId));
  }

  // OpenAI usage tracking
  async createOpenaiUsage(usage: InsertOpenaiUsage): Promise<OpenaiUsage> {
    const [newUsage] = await db
      .insert(openaiUsage)
      .values(usage)
      .returning();
    return newUsage;
  }
}

export const storage = new DatabaseStorage();
