import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertJournalEntrySchema,
  insertTaDoneItemSchema,
  insertGratitudeItemSchema,
  insertGoalSchema,
  type ChatMessage,
  type Conversation,
} from "@shared/schema";
import { 
  generateAIResponse, 
  generateConversationSummary, 
  generateInitialPrompt 
} from "./openai";
import { v4 as uuidv4 } from "uuid";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.patch('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { customProfileImageUrl, timezone, displayName } = req.body;

      const updates: any = {};

      if (customProfileImageUrl !== undefined) {
        if (customProfileImageUrl && customProfileImageUrl.trim() !== "") {
          // Validate that it's a proper data URL or HTTP(S) URL
          const isDataUrl = customProfileImageUrl.startsWith('data:image/');
          const isHttpUrl = customProfileImageUrl.startsWith('http://') || customProfileImageUrl.startsWith('https://');
          
          if (!isDataUrl && !isHttpUrl) {
            return res.status(400).json({ message: "Invalid image URL format" });
          }
        }
        updates.customProfileImageUrl = customProfileImageUrl;
      }

      if (timezone !== undefined) {
        // Validate timezone format (basic check)
        if (typeof timezone !== 'string' || timezone.length === 0) {
          return res.status(400).json({ message: "Invalid timezone format" });
        }
        updates.timezone = timezone;
      }

      if (displayName !== undefined) {
        if (displayName && typeof displayName === 'string' && displayName.trim().length > 50) {
          return res.status(400).json({ message: "Display name must be 50 characters or less" });
        }
        updates.displayName = displayName ? displayName.trim() : null;
      }

      if (req.body.textSize !== undefined) {
        const validSizes = ['small', 'medium', 'large'];
        if (!validSizes.includes(req.body.textSize)) {
          return res.status(400).json({ message: "Invalid text size. Must be small, medium, or large" });
        }
        updates.textSize = req.body.textSize;
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No valid updates provided" });
      }

      const updatedUser = await storage.updateUser(userId, updates);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  // Delete current user account
  app.delete('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Delete all user data
      await storage.deleteUser(userId);
      
      // Clear the session
      req.logout((err: any) => {
        if (err) {
          console.error("Error during logout:", err);
        }
      });
      
      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      console.error("Error deleting user account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Journal routes
  app.get('/api/journal/entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entries = await storage.getJournalEntries(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  // Get today's active conversation (incomplete)
  app.get('/api/journal/today', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const todayEntry = await storage.getTodaysActiveConversation(userId);
      res.json(todayEntry);
    } catch (error) {
      console.error("Error fetching today's conversation:", error);
      res.status(500).json({ message: "Failed to fetch today's conversation" });
    }
  });

  // Continue an existing conversation
  app.post('/api/journal/continue/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entryId = parseInt(req.params.id);
      const { conversation } = req.body;

      if (!conversation || !Array.isArray(conversation)) {
        return res.status(400).json({ message: "Conversation is required" });
      }

      // Generate updated summary for the conversation
      const user = await storage.getUser(userId);
      const summary = await generateConversationSummary(conversation, user?.firstName || undefined);
      
      // Update the existing journal entry and keep it active
      const entry = await storage.updateJournalEntry(entryId, userId, {
        conversation: conversation,
        summary: summary.summary,
        tags: summary.tags,
        isComplete: false, // Ensure conversation stays active
        updatedAt: new Date(),
      });

      res.json(entry);
    } catch (error) {
      console.error("Error updating conversation:", error);
      res.status(500).json({ message: "Failed to update conversation" });
    }
  });

  app.get('/api/journal/entries/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entryId = parseInt(req.params.id);
      const entry = await storage.getJournalEntry(entryId, userId);
      
      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      
      res.json(entry);
    } catch (error) {
      console.error("Error fetching journal entry:", error);
      res.status(500).json({ message: "Failed to fetch journal entry" });
    }
  });

  app.post('/api/journal/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { message, conversationHistory = [], currentEntryId } = req.body;

      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Convert conversation history to OpenAI format
      const aiHistory = conversationHistory.map((msg: ChatMessage) => ({
        role: msg.role === "ai" ? "assistant" : "user",
        content: msg.content,
      }));

      // Generate AI response
      const aiResponse = await generateAIResponse(message, aiHistory, userId);
      
      // Create response message
      const responseMessage: ChatMessage = {
        id: uuidv4(),
        role: "ai",
        content: aiResponse.content,
        timestamp: new Date(),
      };

      // Create user message for storage
      const userMessage: ChatMessage = {
        id: uuidv4(),
        role: "user", 
        content: message,
        timestamp: new Date(),
      };

      let entryId = currentEntryId;

      // If this is the first user message and no entry exists, create a journal entry
      if (!currentEntryId) {
        // Check if there's an active conversation today first
        let todayEntry = await storage.getTodaysActiveConversation(userId);
        
        if (!todayEntry) {
          // Create new journal entry starting with the conversation
          const user = await storage.getUser(userId);
          const userTimezone = user?.timezone || 'UTC';
          const currentDate = new Date().toLocaleDateString('en-US', { 
            month: 'numeric', 
            day: 'numeric', 
            year: 'numeric',
            timeZone: userTimezone
          });
          
          // Build full conversation including AI's initial prompt if it exists
          const fullConversation = [...conversationHistory, userMessage, responseMessage];
          
          todayEntry = await storage.createJournalEntry(userId, {
            title: `Conversation ${currentDate}`,
            summary: "Today's mindful reflection",
            conversation: fullConversation,
            tags: ["daily", "reflection"],
            isComplete: false,
          });
        } else {
          // Update existing entry with new messages and generate summary
          const fullConversation = [...conversationHistory, userMessage, responseMessage];
          const user = await storage.getUser(userId);
          const summary = await generateConversationSummary(fullConversation, user?.firstName || undefined, userId);
          
          todayEntry = await storage.updateJournalEntry(todayEntry.id, userId, {
            conversation: fullConversation,
            summary: summary.summary,
            tags: summary.tags,
            updatedAt: new Date(),
          });
        }
        
        entryId = todayEntry.id;
      } else {
        // Update existing entry (when currentEntryId is provided)
        const fullConversation = [...conversationHistory, userMessage, responseMessage];
        const user = await storage.getUser(userId);
        const summary = await generateConversationSummary(fullConversation, user?.firstName || undefined, userId);
        
        await storage.updateJournalEntry(entryId, userId, {
          conversation: fullConversation,
          summary: summary.summary,
          tags: summary.tags,
          updatedAt: new Date(),
        });
      }

      res.json({
        message: responseMessage,
        shouldEndConversation: aiResponse.shouldEndConversation,
        entryId: entryId,
      });
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  app.post('/api/journal/save', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { conversation, entryId } = req.body;

      if (!conversation || !Array.isArray(conversation)) {
        return res.status(400).json({ message: "Conversation is required" });
      }

      let entry;
      
      if (entryId) {
        // Update existing entry and mark as complete
        entry = await storage.updateJournalEntry(entryId, userId, {
          conversation: conversation,
          isComplete: true,
          updatedAt: new Date(),
        });
      } else {
        // Generate summary for new entry
        const user = await storage.getUser(userId);
        const summary = await generateConversationSummary(conversation, user?.firstName || undefined, userId);
        
        // Create new journal entry
        entry = await storage.createJournalEntry(userId, {
          title: summary.title,
          summary: summary.summary,
          conversation: conversation,
          tags: summary.tags,
          isComplete: true,
        });
      }

      res.json(entry);
    } catch (error) {
      console.error("Error saving journal entry:", error);
      res.status(500).json({ message: "Failed to save journal entry" });
    }
  });

  // Start or continue today's conversation
  app.post('/api/journal/start-today', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Check if there's already an active conversation today
      let todayEntry = await storage.getTodaysActiveConversation(userId);
      
      if (!todayEntry) {
        // Get user to use their timezone for prompt generation
        const user = await storage.getUser(userId);
        const userTimezone = user?.timezone || 'UTC';
        
        // Create a new entry for today
        const initialPrompt = await generateInitialPrompt(userTimezone);
        const initialMessage: ChatMessage = {
          id: uuidv4(),
          role: "ai",
          content: initialPrompt,
          timestamp: new Date(),
        };

        const currentDate = new Date().toLocaleDateString('en-US', { 
          month: 'numeric', 
          day: 'numeric', 
          year: 'numeric',
          timeZone: userTimezone
        });
        
        todayEntry = await storage.createJournalEntry(userId, {
          title: `Conversation ${currentDate}`,
          summary: "Today's mindful reflection",
          conversation: [initialMessage],
          tags: ["daily", "reflection"],
          isComplete: false,
        });
      }

      res.json(todayEntry);
    } catch (error) {
      console.error("Error starting today's conversation:", error);
      res.status(500).json({ message: "Failed to start today's conversation" });
    }
  });

  app.get('/api/journal/prompt', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const userTimezone = user?.timezone || 'UTC';
      
      const prompt = await generateInitialPrompt(userTimezone);
      res.json({ prompt });
    } catch (error) {
      console.error("Error generating prompt:", error);
      res.status(500).json({ message: "Failed to generate prompt" });
    }
  });

  // Get specific journal entry
  app.get('/api/journal/entry/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entryId = parseInt(req.params.id);
      
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }
      
      const entry = await storage.getJournalEntry(entryId, userId);
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      
      res.json(entry);
    } catch (error) {
      console.error("Error fetching journal entry:", error);
      res.status(500).json({ message: "Failed to fetch journal entry" });
    }
  });

  // Delete journal entry
  app.delete('/api/journal/entries/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entryId = parseInt(req.params.id);
      
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }
      
      await storage.deleteJournalEntry(entryId, userId);
      res.json({ message: "Entry deleted successfully" });
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      res.status(500).json({ message: "Failed to delete journal entry" });
    }
  });

  // Ta-Done routes
  app.get('/api/tadone', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const items = await storage.getTaDoneItems(userId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching ta-done items:", error);
      res.status(500).json({ message: "Failed to fetch ta-done items" });
    }
  });

  app.post('/api/tadone', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertTaDoneItemSchema.parse(req.body);
      
      const item = await storage.createTaDoneItem(userId, validatedData);
      res.json(item);
    } catch (error) {
      console.error("Error creating ta-done item:", error);
      res.status(400).json({ message: "Failed to create ta-done item" });
    }
  });

  // Gratitude routes
  app.get('/api/gratitude', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const items = await storage.getGratitudeItems(userId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching gratitude items:", error);
      res.status(500).json({ message: "Failed to fetch gratitude items" });
    }
  });

  app.post('/api/gratitude', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertGratitudeItemSchema.parse(req.body);
      
      const item = await storage.createGratitudeItem(userId, validatedData);
      res.json(item);
    } catch (error) {
      console.error("Error creating gratitude item:", error);
      res.status(400).json({ message: "Failed to create gratitude item" });
    }
  });

  // Goal routes
  app.get('/api/goals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goals = await storage.getGoals(userId);
      res.json(goals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.post('/api/goals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertGoalSchema.parse(req.body);
      
      const goal = await storage.createGoal(userId, validatedData);
      res.json(goal);
    } catch (error) {
      console.error("Error creating goal:", error);
      res.status(400).json({ message: "Failed to create goal" });
    }
  });

  app.patch('/api/goals/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goalId = parseInt(req.params.id);
      
      if (isNaN(goalId)) {
        return res.status(400).json({ message: "Invalid goal ID" });
      }
      
      const validatedData = insertGoalSchema.partial().parse(req.body);
      
      const goal = await storage.updateGoal(goalId, validatedData, userId);
      res.json(goal);
    } catch (error: any) {
      console.error("Error updating goal:", error);
      if (error?.message?.includes("not found") || error?.message?.includes("permission")) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Failed to update goal" });
      }
    }
  });

  app.delete('/api/goals/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goalId = parseInt(req.params.id);
      
      if (isNaN(goalId)) {
        return res.status(400).json({ message: "Invalid goal ID" });
      }
      
      await storage.deleteGoal(goalId, userId);
      res.json({ message: "Goal deleted successfully" });
    } catch (error) {
      console.error("Error deleting goal:", error);
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });

  // Journal analysis endpoint
  app.post('/api/journal/analyze', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { question } = req.body;
      
      if (!question || typeof question !== 'string' || question.trim().length === 0) {
        return res.status(400).json({ message: "Question is required" });
      }

      // Fetch user's journal entries
      const entries = await storage.getJournalEntries(userId);
      
      if (entries.length === 0) {
        return res.json({ 
          answer: "I don't see any journal entries yet. Start journaling with me to get insights about your thoughts and patterns!",
          hasData: false 
        });
      }

      // Prepare journal data for analysis
      const journalData = entries.map(entry => ({
        title: entry.title,
        summary: entry.summary || "",
        date: entry.createdAt?.toISOString() || new Date().toISOString(),
        conversation: entry.conversation,
        tags: entry.tags || []
      }));

      // Call OpenAI to analyze the journal entries
      const { analyzeJournalEntries } = await import('./openai');
      const analysis = await analyzeJournalEntries(question.trim(), journalData, userId);
      
      res.json({ 
        answer: analysis,
        hasData: true,
        entriesAnalyzed: entries.length 
      });
    } catch (error) {
      console.error("Error analyzing journal entries:", error);
      res.status(500).json({ message: "Failed to analyze journal entries" });
    }
  });

  // Ta-Done delete endpoint
  app.delete('/api/tadone/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemId = parseInt(req.params.id);
      
      if (isNaN(itemId)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }
      
      await storage.deleteTaDoneItem(itemId, userId);
      res.json({ message: "Ta-Done item deleted successfully" });
    } catch (error) {
      console.error("Error deleting ta-done item:", error);
      res.status(500).json({ message: "Failed to delete ta-done item" });
    }
  });

  // Gratitude delete endpoint
  app.delete('/api/gratitude/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemId = parseInt(req.params.id);
      
      if (isNaN(itemId)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }
      
      await storage.deleteGratitudeItem(itemId, userId);
      res.json({ message: "Gratitude item deleted successfully" });
    } catch (error) {
      console.error("Error deleting gratitude item:", error);
      res.status(500).json({ message: "Failed to delete gratitude item" });
    }
  });

  // Admin middleware
  const isAdmin = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      next();
    } catch (error) {
      console.error("Error checking admin status:", error);
      res.status(500).json({ message: "Failed to verify admin status" });
    }
  };

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/usage-stats', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const stats = await storage.getAllUsageStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching usage stats:", error);
      res.status(500).json({ message: "Failed to fetch usage statistics" });
    }
  });

  app.patch('/api/admin/users/:userId/admin', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { isAdmin: makeAdmin } = req.body;
      
      if (typeof makeAdmin !== 'boolean') {
        return res.status(400).json({ message: "isAdmin must be a boolean" });
      }
      
      const user = await storage.setUserAdmin(userId, makeAdmin);
      res.json(user);
    } catch (error) {
      console.error("Error updating user admin status:", error);
      res.status(500).json({ message: "Failed to update admin status" });
    }
  });



  // Delete user account (admin only)
  app.delete('/api/admin/users/:userId', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.claims.sub;
      
      // Prevent admin from deleting their own account
      if (userId === currentUserId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      await storage.deleteUser(userId);
      res.json({ message: "User account deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user account" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
