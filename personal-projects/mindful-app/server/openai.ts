import OpenAI from "openai";
import { storage } from "./storage";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
});

export interface AIResponse {
  content: string;
  shouldEndConversation: boolean;
}

export interface ConversationSummary {
  title: string;
  summary: string;
  tags: string[];
}

// Pricing for GPT-4o (as of 2024)
const GPT4O_INPUT_COST_PER_1K = 0.0025;
const GPT4O_OUTPUT_COST_PER_1K = 0.01;

async function trackUsage(userId: string, endpoint: string, inputTokens: number, outputTokens: number) {
  const totalTokens = inputTokens + outputTokens;
  const inputCost = (inputTokens / 1000) * GPT4O_INPUT_COST_PER_1K;
  const outputCost = (outputTokens / 1000) * GPT4O_OUTPUT_COST_PER_1K;
  const totalCost = inputCost + outputCost;
  // Convert to cents to avoid floating point issues
  const totalCostCents = Math.round(totalCost * 100);
  
  await storage.createOpenaiUsage({
    userId,
    endpoint,
    model: "gpt-4o",
    inputTokens,
    outputTokens,
    totalTokens,
    estimatedCostCents: totalCostCents
  });
}

export async function generateAIResponse(
  userMessage: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
  userId?: string
): Promise<AIResponse> {
  const messages = [
    {
      role: "system" as const,
      content: `You are Aiden, a supportive AI companion who embodies a blend of a caring friend and a guiding therapist. Your core mission is to be highly empathetic while subtly encouraging accountability and offering new perspectives for personal growth.

CORE PRINCIPLES:

1. EMPATHY FIRST:
   - Always start by acknowledging and validating the user's feelings before anything else
   - Use phrases like "That sounds really tough," "It's completely understandable to feel that way," "I hear you," or "That makes a lot of sense"
   - Show active listening by demonstrating you understand their context and emotions
   - Maintain a warm, caring, non-judgmental tone throughout

2. ENCOURAGE ACCOUNTABILITY (GENTLE NUDGING):
   - After validating feelings, gently shift toward empowering the user
   - Focus on their agency: ask "What's within your control?" or "What small step could you take?"
   - Reflect on actions/reactions: "What was your initial reaction, and what might you do differently next time?"
   - Celebrate small wins and positive actions they share
   - Frame questions that encourage them to consider their role, choices, or next steps

3. OFFER PERSPECTIVE (BROADENING VIEWPOINTS):
   - Help users see situations from different angles without dismissing their current feelings
   - Ask "Have you considered looking at it from another angle?" or "What might someone else perceive?"
   - Encourage long-term vs. short-term thinking about situations
   - Frame challenges as learning opportunities: "What might this experience be teaching you?"
   - Foster self-reflection through curious, open-ended questions rather than giving direct advice

4. CONSTRUCTIVE CHALLENGE (WHEN TO PUSH GENTLY):
   - Identify opportunities: When user shows self-limiting beliefs, makes overly generalized/catastrophic statements, avoids personal responsibility, or resists positive change
   - Question assumptions: "What evidence do you have for that belief?" or "Is there another way to interpret that situation?"
   - Highlight discrepancies: Point out inconsistencies between stated goals/values and current actions/beliefs
   - Explore resistance: When user says "I can't" or "It's impossible," ask "What specifically makes you feel that way?" or "What's the hardest part about trying?"
   - Focus on growth potential: Frame challenges as invitations to expand comfort zones or discover new strengths
   - Maintain support: Always deliver challenges with underlying belief in their capacity for growth, never as accusation or judgment

CONVERSATION FLOW:
- Start with empathy and validation
- Ask insightful questions that invite deeper thought
- Prioritize questions over declarative statements
- Allow space for their responses - don't overwhelm with too many questions at once
- Use approachable, thoughtful language that's neither overly clinical nor too casual

Remember: You're like a wise friend who believes deeply in their potential for growth and positive change.

Always introduce yourself as Aiden when appropriate. Respond with JSON in this format:
{
  "content": "your response message",
  "shouldEndConversation": false
}

Set "shouldEndConversation" to true only if the user explicitly ends the conversation or says goodbye.`
    },
    ...conversationHistory,
    { role: "user" as const, content: userMessage }
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Track usage if userId is provided
    if (userId && response.usage) {
      await trackUsage(userId, "chat", response.usage.prompt_tokens, response.usage.completion_tokens);
    }
    
    return {
      content: result.content || "Hi! Aiden here, your mindful companion. I'm curious - how are you feeling right now?",
      shouldEndConversation: result.shouldEndConversation || false,
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      content: "Hey! Aiden here. I'm having some technical difficulties right now, but I'm still here with you. What's on your mind today?",
      shouldEndConversation: false,
    };
  }
}

export async function generateConversationSummary(
  conversation: Array<{ role: "user" | "ai"; content: string; timestamp: Date }>,
  userName?: string,
  userId?: string
): Promise<ConversationSummary> {
  const conversationText = conversation
    .map(msg => `${msg.role}: ${msg.content}`)
    .join("\n");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Analyze this mindful journaling conversation and create a summary. Focus on:
1. Key themes, emotions, and insights discussed
2. Personal growth moments or realizations
3. Important events or experiences mentioned

${userName ? `When writing the summary, refer to the user by their first name "${userName}" instead of "the user".` : ""}

Respond with JSON in this format:
{
  "title": "A descriptive title for this conversation (max 50 chars)",
  "summary": "A thoughtful summary highlighting key themes and insights (max 200 chars)",
  "tags": ["array", "of", "relevant", "tags", "like", "gratitude", "growth", "challenge"]
}

Keep tags focused on emotional themes, personal growth areas, or life domains.`
        },
        {
          role: "user",
          content: `Please summarize this conversation:\n\n${conversationText}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Track usage if userId is provided
    if (userId && response.usage) {
      await trackUsage(userId, "summary", response.usage.prompt_tokens, response.usage.completion_tokens);
    }
    
    return {
      title: result.title || "Reflection Conversation",
      summary: result.summary || "A meaningful conversation about personal experiences and feelings.",
      tags: result.tags || ["reflection"],
    };
  } catch (error) {
    console.error("OpenAI summary error:", error);
    return {
      title: "Reflection Conversation",
      summary: "A meaningful conversation about personal experiences and feelings.",
      tags: ["reflection"],
    };
  }
}

// Get time-aware prompts based on current hour in user's timezone
function getTimeAwarePrompts(hour: number): string[] {
  if (hour >= 5 && hour < 12) {
    // Morning prompts (5 AM - 11:59 AM)
    return [
      "Hi! Aiden here. Good morning! I'm curious - as you ease into this new day, what's one feeling or thought that's with you right now?",
      "Hey, Aiden checking in. Mornings can bring all kinds of energy. What's alive in you as this day begins, and what might you need to feel more grounded?",
      "Morning! It's Aiden. I'm wondering - what's one intention you'd like to set for today, or perhaps something you're feeling grateful for in this moment?",
      "Hi there! Aiden here. As you welcome this morning, what's one thing you're looking forward to, or maybe something you'd like to approach differently today?",
      "Hey! Aiden checking in. Take a moment to tune in - what's your heart telling you as you step into today?",
      "Good morning! Aiden here. What would you like to nurture in yourself today, and what small step could help you do that?",
    ];
  } else if (hour >= 12 && hour < 17) {
    // Afternoon prompts (12:00 PM - 4:59 PM)
    return [
      "Hi! Aiden here. I'm curious about how you're feeling in this middle part of your day. What's asking for your attention right now?",
      "Hey, Aiden checking in. As you move through your day, what's one small win you've experienced so far that you'd like to acknowledge?",
      "Afternoon pause - it's Aiden. How is your energy holding up? Is there anything you need to release or realign with for the rest of the day?",
      "Hi there! Aiden here. What's one thing that's surprised you about today so far, and what does that tell you about yourself?",
      "Hey! Aiden checking in. As you take this moment to reflect, what's one insight or realization that's emerged for you today?",
      "Hi! Aiden here. What's been the rhythm of your day so far, and what do you think you need for the hours ahead?",
    ];
  } else {
    // Evening/Night prompts (5:00 PM - 4:59 AM)
    return [
      "Hey! Aiden here. As your day winds down, I'm curious - what's one significant moment or feeling that stands out to you from today?",
      "Hi, Aiden checking in. What's something you learned about yourself today, or perhaps a feeling you'd like to acknowledge before you rest?",
      "Evening reflection - it's Aiden. What's one thing you'd like to appreciate about how you showed up today, even if the day felt challenging?",
      "Hi there! Aiden here. As you settle into this quieter time, what from today is asking to be witnessed or understood?",
      "Hey! Aiden checking in. What's one way you grew or stretched yourself today, even in a small way that might not feel significant?",
      "Hi! Aiden here. As you transition into evening, what would you like to release from today, and what feels important to carry forward?",
    ];
  }
}

export async function generateInitialPrompt(userTimezone: string = 'UTC'): Promise<string> {
  try {
    // Get current hour in user's timezone
    const now = new Date();
    const userTime = new Date(now.toLocaleString("en-US", {timeZone: userTimezone}));
    const hour = userTime.getHours();
    
    // Get appropriate prompts for the time of day
    const timeAwarePrompts = getTimeAwarePrompts(hour);
    
    // Select a random prompt from the time-appropriate set
    return timeAwarePrompts[Math.floor(Math.random() * timeAwarePrompts.length)];
  } catch (error) {
    // Fallback to a general reflective prompt if timezone calculation fails
    const fallbackPrompts = [
      "Hi! Aiden here. I'm curious - what's on your mind today, and what aspect of it feels important to explore?",
      "Hey, Aiden checking in. Take a moment to tune in - what's one feeling or thought you'd like to acknowledge right now?",
      "Hi there! I'm Aiden. What's bringing you here to reflect today, and what feels meaningful to share?",
      "Hey! Aiden here. What's one thing that's been with you recently that you'd like to understand better?",
    ];
    
    return fallbackPrompts[Math.floor(Math.random() * fallbackPrompts.length)];
  }
}

export async function analyzeJournalEntries(
  question: string,
  journalData: Array<{
    title: string;
    summary: string;
    date: string;
    conversation: any;
    tags: string[];
  }>,
  userId?: string
): Promise<string> {
  try {
    // Prepare a structured summary of journal data for analysis
    const journalSummary = journalData.map(entry => {
      const entryDate = new Date(entry.date);
      return {
        date: entryDate.toLocaleDateString(),
        title: entry.title,
        summary: entry.summary,
        tags: entry.tags.join(', '),
        // Include a sample of conversation content if available
        conversationSample: Array.isArray(entry.conversation) && entry.conversation.length > 0
          ? entry.conversation.slice(0, 3).map((msg: any) => `${msg.role}: ${msg.content?.substring(0, 100)}...`).join('\n')
          : 'No conversation data'
      };
    });

    const systemPrompt = `You are Aiden, an AI companion who analyzes journal entries to provide thoughtful insights. You have access to a user's journal entries and conversations, and you help them understand patterns, trends, and growth opportunities.

Your analysis should be:
1. Insightful and meaningful, looking for genuine patterns and themes
2. Supportive and encouraging, focusing on growth and positive observations
3. Specific and evidence-based, referencing actual content from the journals
4. Respectful of the personal nature of journal content
5. Written in a warm, caring tone that feels like a thoughtful friend

Analyze the provided journal data and answer the user's question with specific insights based on their actual entries.`;

    const userPrompt = `Please analyze my journal entries and answer this question: "${question}"

My journal data:
${JSON.stringify(journalSummary, null, 2)}

Please provide a thoughtful analysis based on the actual content and patterns you observe in my entries. Be specific and reference details from my journals where appropriate.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    // Track usage if userId is provided
    if (userId && response.usage) {
      await trackUsage(userId, "analysis", response.usage.prompt_tokens, response.usage.completion_tokens);
    }
    
    return response.choices[0].message.content || "I'm having trouble analyzing your journal entries right now. Please try again in a moment.";
  } catch (error) {
    console.error("Error analyzing journal entries:", error);
    return "I'm having some technical difficulties analyzing your journal entries right now. Please try again in a moment.";
  }
}
