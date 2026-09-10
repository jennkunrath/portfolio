import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Send, User, RefreshCw, Mic, MicOff, Edit3, Check, X } from "lucide-react";
import AidenOrb from "./AidenOrb";
import type { ChatMessage, JournalEntry } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { v4 as uuidv4 } from "uuid";

interface ChatInterfaceProps {
  continueEntryId?: number | null;
  onEntryLoaded?: () => void;
  onViewEntry?: (entry: JournalEntry) => void;
}

export default function ChatInterface({ continueEntryId, onEntryLoaded, onViewEntry }: ChatInterfaceProps = {}) {
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentEntryId, setCurrentEntryId] = useState<number | null>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const [hasMountedOnce, setHasMountedOnce] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'en-US';
        
        recognitionInstance.onstart = () => {
          setIsRecording(true);
        };
        
        recognitionInstance.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setCurrentMessage(prevMessage => prevMessage + (prevMessage ? ' ' : '') + transcript);
        };
        
        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          toast({
            title: "Voice Input Error",
            description: "There was an issue with voice recognition. Please try again.",
            variant: "destructive",
          });
        };
        
        recognitionInstance.onend = () => {
          setIsRecording(false);
        };
        
        setRecognition(recognitionInstance);
      }
    }
  }, [toast]);

  // Fetch recent journal entries
  const { data: journalEntries = [], isLoading: entriesLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal/entries"],
    retry: false,
  });

  // Check for today's active conversation first (unless we're continuing a specific entry)
  const { data: todayEntry, isLoading: todayLoading, refetch: refetchToday } = useQuery<JournalEntry | null>({
    queryKey: ["/api/journal/today"],
    retry: false,
    enabled: !continueEntryId, // Only fetch today's entry if not continuing a specific one
    staleTime: 0, // Always consider data stale to ensure fresh fetch
    gcTime: 0, // Don't cache for too long (renamed from cacheTime in v5)
  });

  // Fetch specific entry if continuing
  const { data: continuingEntry, isLoading: continuingLoading } = useQuery<JournalEntry | null>({
    queryKey: ["/api/journal/entry", continueEntryId],
    retry: false,
    enabled: !!continueEntryId,
  });

  // Get initial AI prompt (fallback)
  const { data: promptData, refetch: refetchPrompt } = useQuery<{ prompt: string }>({
    queryKey: ["/api/journal/prompt"],
    retry: false,
    enabled: !todayEntry && !todayLoading, // Only fetch if no today entry
  });

  // Send message to AI
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, conversationHistory }: { 
      message: string; 
      conversationHistory: ChatMessage[] 
    }) => {
      const response = await apiRequest("POST", "/api/journal/chat", {
        message,
        conversationHistory,
        currentEntryId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      console.log("AI response received:", data.message.content.substring(0, 50) + "...");
      setIsTyping(false);
      
      // Set the entry ID if it was just created
      if (data.entryId && !currentEntryId) {
        setCurrentEntryId(data.entryId);
      }
      
      // Update conversation state with the new AI message
      setConversation(prev => {
        console.log("Adding AI message to conversation of length:", prev.length);
        
        // Check if message already exists to prevent duplicates
        const messageExists = prev.some(msg => msg.id === data.message.id);
        if (messageExists) {
          console.log("Message already exists, skipping duplicate:", data.message.id);
          return prev;
        }
        
        const updatedConversation = [...prev, data.message];
        
        // Auto-save conversation updates if we have an active entry
        const activeEntryId = data.entryId || currentEntryId;
        if (activeEntryId) {
          updateConversationMutation.mutate({
            entryId: activeEntryId,
            conversation: updatedConversation
          });
        }
        
        return updatedConversation;
      });
    },
    onError: (error) => {
      setIsTyping(false);
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update ongoing conversation
  const updateConversationMutation = useMutation({
    mutationFn: async ({ entryId, conversation }: { entryId: number; conversation: ChatMessage[] }) => {
      const response = await apiRequest("POST", `/api/journal/continue/${entryId}`, {
        conversation,
      });
      return response.json();
    },
    onSuccess: () => {
      // Only invalidate journal entries list, not the active conversation data to prevent UI resets
      queryClient.invalidateQueries({ queryKey: ["/api/journal/entries"] });
      // Don't invalidate today or current entry queries during active conversation to prevent state resets
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  // Save conversation as journal entry
  const saveConversationMutation = useMutation({
    mutationFn: async ({ conversation, entryId }: { conversation: ChatMessage[]; entryId?: number | null }) => {
      const response = await apiRequest("POST", "/api/journal/save", {
        conversation,
        entryId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal/entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/journal/today"] });
      toast({
        title: "Conversation Saved",
        description: "Your reflection has been saved to your journal.",
      });
      
      // Only clear conversation and start new one if this was a manual save from 💾 button
      // Don't do this when continuing an existing conversation
      if (!continueEntryId) {
        setConversation([]);
        setCurrentEntryId(null);
        startNewConversation();
      }
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save conversation. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Regenerate prompt mutation
  const regeneratePromptMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/journal/prompt");
      return response.json();
    },
    onSuccess: (data) => {
      // Update the first AI message with the new prompt
      const updatedConversation = conversation.map((msg, index) => {
        if (index === 0 && msg.role === "ai") {
          return { ...msg, content: data.prompt };
        }
        return msg;
      });
      
      setConversation(updatedConversation);
      
      // Update current journal entry with new prompt if we have one
      if (currentEntryId && updatedConversation.length > 0) {
        saveConversationMutation.mutate({
          conversation: updatedConversation,
          entryId: currentEntryId
        });
      }
      
      toast({
        title: "Prompt Updated",
        description: "I've given you a new reflection prompt. How does this one feel?",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to generate new prompt. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Start new conversation - no longer creates database entry immediately
  const startNewConversation = async () => {
    try {
      // Just get a prompt, don't create database entry yet
      if (promptData?.prompt) {
        const initialMessage: ChatMessage = {
          id: uuidv4(),
          role: "ai", 
          content: promptData.prompt,
          timestamp: new Date(),
        };
        setConversation([initialMessage]);
        setCurrentEntryId(null); // No entry until user sends first message
      }
    } catch (error) {
      console.error("Error starting new conversation:", error);
    }
  };

  // Initialize conversation when component mounts or when switching back to chat tab
  useEffect(() => {
    if (continueEntryId && continuingEntry && continuingEntry.conversation && !continuingLoading) {
      // Continue specific entry - always load this conversation, removing duplicates
      const serverConversation = continuingEntry.conversation as ChatMessage[];
      const deduplicatedConversation = serverConversation.filter((message, index, arr) => 
        arr.findIndex(m => m.id === message.id) === index
      );
      setConversation(deduplicatedConversation);
      setCurrentEntryId(continuingEntry.id);
      onEntryLoaded?.();
      return; // Exit early to prevent other logic from running
    }
    
    // Always load today's active conversation when not continuing a specific entry
    if (!continueEntryId) {
      if (todayEntry && todayEntry.conversation && !todayLoading) {
        // Load today's conversation - always sync with server state, removing duplicates
        const serverConversation = todayEntry.conversation as ChatMessage[];
        const deduplicatedConversation = serverConversation.filter((message, index, arr) => 
          arr.findIndex(m => m.id === message.id) === index
        );
        setConversation(deduplicatedConversation);
        setCurrentEntryId(todayEntry.id);
      } else if (!todayLoading && !continuingLoading && promptData?.prompt) {
        // Start new conversation with just a prompt - no database entry until user sends message
        startNewConversation();
      }
    }
  }, [continueEntryId, continuingEntry, continuingLoading, todayEntry, todayLoading, promptData]);

  // Disabled automatic sync to prevent overriding local conversation state
  // The sync was causing messages to disappear by constantly resetting the conversation
  // Only initial load and manual refreshes should sync from server
  /*
  useEffect(() => {
    // Sync disabled to prevent message disappearance
  }, []);
  */

  // Force refresh when component mounts (i.e., when returning to chat tab)
  useEffect(() => {
    if (!hasMountedOnce) {
      setHasMountedOnce(true);
    } else if (!continueEntryId) {
      // This is a remount (return to chat tab), force refresh today's data
      refetchToday();
    }
  }, [hasMountedOnce, continueEntryId, refetchToday]);

  // Auto-scroll to bottom only when needed (new messages, typing, or when returning to chat)
  useEffect(() => {
    if (shouldScrollToBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation, isTyping, shouldScrollToBottom]);

  // Set scroll to bottom when conversation loads for the first time or when new messages are added
  useEffect(() => {
    if (conversation.length > 0) {
      setShouldScrollToBottom(true);
    }
  }, [conversation.length]);

  // Edit message functions
  const handleStartEdit = (message: ChatMessage) => {
    setEditingMessageId(message.id);
    setEditingContent(message.content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent("");
  };

  const handleSaveEdit = () => {
    if (!editingContent.trim() || !editingMessageId) return;

    // Update the message in the conversation
    const updatedConversation = conversation.map(msg =>
      msg.id === editingMessageId
        ? { ...msg, content: editingContent.trim() }
        : msg
    );

    // Remove all AI messages after the edited user message
    const editedMessageIndex = updatedConversation.findIndex(msg => msg.id === editingMessageId);
    const filteredConversation = updatedConversation.slice(0, editedMessageIndex + 1);

    setConversation(filteredConversation);
    setEditingMessageId(null);
    setEditingContent("");

    // If there's a current entry, update it in the database and get AI response
    if (currentEntryId) {
      updateConversationMutation.mutate({
        entryId: currentEntryId,
        conversation: filteredConversation,
      });

      // Generate AI response to the edited message
      setIsTyping(true);
      sendMessageMutation.mutate({
        message: editingContent.trim(),
        conversationHistory: filteredConversation,
      });
    }
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim() || sendMessageMutation.isPending) return;
    
    console.log("Sending message, current conversation length:", conversation.length);

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content: currentMessage.trim(),
      timestamp: new Date(),
    };

    // Check for duplicates and create updated conversation
    const messageExists = conversation.some(msg => msg.id === userMessage.id);
    if (messageExists) {
      console.log("User message already exists, skipping duplicate:", userMessage.id);
      return;
    }

    const updatedConversation = [...conversation, userMessage];
    
    // Add user message to conversation
    setConversation(updatedConversation);
    setCurrentMessage("");
    setIsTyping(true);

    // Reset textarea height after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    sendMessageMutation.mutate({
      message: userMessage.content,
      conversationHistory: updatedConversation,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize textarea function
  const resizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const maxHeight = 200; // Maximum height before scrolling (about 8 lines)
    textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px';
  };

  // Auto-resize textarea on change
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentMessage(e.target.value);
    resizeTextarea(e.target);
  };

  // Auto-resize when currentMessage changes (e.g., from voice input)
  useEffect(() => {
    if (textareaRef.current) {
      resizeTextarea(textareaRef.current);
    }
  }, [currentMessage]);

  const handleVoiceInput = () => {
    if (!recognition) {
      toast({
        title: "Voice Input Unavailable",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get text size class based on user preference
  const getTextSizeClass = () => {
    const textSize = (user as any)?.textSize || 'small';
    switch (textSize) {
      case 'medium':
        return 'text-base';
      case 'large':
        return 'text-lg';
      default:
        return 'text-sm';
    }
  };

  const viewFullEntry = (entry: JournalEntry) => {
    // Continue the conversation when viewing full entry
    onViewEntry?.(entry);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Interface */}
      <div className="flex flex-col flex-1 bg-gray-50 relative overflow-hidden">
        {/* Messages Container - Fixed mobile scrolling */}
<div className="flex-1 overflow-y-auto p-4 space-y-4 mobile-scroll-container" style={{ WebkitOverflowScrolling: 'touch' }}>
          {conversation.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-2 ${
                message.role === "user" ? "justify-end" : ""
              }`}
            >
              {message.role === "ai" && (
                <div className="w-8 h-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full flex items-center justify-center flex-shrink-0 border border-blue-100">
                  <AidenOrb size="md" />
                </div>
              )}
              
              <div className="flex flex-col space-y-2">
                {editingMessageId === message.id ? (
                  // Edit mode
                  <div className="flex flex-col space-y-2">
                    <Textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="min-h-32 max-h-48 resize-none border-2 border-teal-300 focus:border-teal-500"
                      placeholder="Edit your message..."
                      autoFocus
                      rows={4}
                    />
                    <div className="flex space-x-2 justify-end">
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                        size="sm"
                        className="h-8 px-3"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveEdit}
                        size="sm"
                        className="h-8 px-3 bg-teal-500 hover:bg-teal-600"
                        disabled={!editingContent.trim()}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Normal message display
                  <div className="group flex items-start space-x-2">
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-teal-500 to-sage-500 text-white rounded-tr-md"
                          : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-tl-md"
                      }`}
                    >
                      <p className={getTextSizeClass()}>{message.content}</p>
                      <span
                        className={`text-xs mt-1 block ${
                          message.role === "user" ? "text-white/80" : "text-gray-500"
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    
                    {/* Edit button for user messages */}
                    {message.role === "user" && (
                      <Button
                        onClick={() => handleStartEdit(message)}
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                        title="Edit message"
                        data-testid={`edit-message-${message.id}`}
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                )}
                
                {/* Show regenerate button only for first AI message and if conversation has just started */}
                {message.role === "ai" && 
                 conversation.indexOf(message) === 0 && 
                 conversation.length === 1 && (
                  <Button
                    onClick={() => regeneratePromptMutation.mutate()}
                    disabled={regeneratePromptMutation.isPending}
                    variant="ghost"
                    size="sm"
                    className="text-xs text-gray-500 hover:text-gray-700 p-1 h-auto self-start"
                  >
                    <RefreshCw className={`w-3 h-3 mr-1 ${regeneratePromptMutation.isPending ? 'animate-spin' : ''}`} />
                    {regeneratePromptMutation.isPending ? 'Getting new prompt...' : 'Try a different prompt'}
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full flex items-center justify-center flex-shrink-0 border border-blue-100">
                <AidenOrb size="md" />
              </div>
              <div className="bg-gray-200 px-4 py-2 rounded-2xl rounded-tl-md">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input - Fixed at bottom with better mobile support */}
        <div className="border-t bg-white p-4 mt-auto z-10 mobile-input-fix">
          <div className="flex items-end space-x-2">
            <Textarea
              ref={textareaRef}
              value={currentMessage}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              onFocus={() => {
                // Ensure input stays visible on mobile when focused
                setTimeout(() => {
                  const inputElement = document.querySelector('.mobile-input-fix');
                  if (inputElement) {
                    inputElement.scrollIntoView({ behavior: "smooth", block: "end" });
                  }
                }, 200);
              }}
              placeholder={isRecording ? "Listening..." : "Share your thoughts..."}
              className="flex-1 border-gray-300 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none min-h-[40px] max-h-[200px] py-2 px-4"
              disabled={sendMessageMutation.isPending || isRecording}
              rows={1}
            />

            <Button
              onClick={handleVoiceInput}
              disabled={sendMessageMutation.isPending}
              className={`w-10 h-10 rounded-full p-0 flex-shrink-0 ${
                isRecording 
                  ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                  : "bg-gray-500 hover:bg-gray-600"
              }`}
              title={isRecording ? "Stop recording" : "Start voice input"}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>

            <Button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || sendMessageMutation.isPending}
              className="w-10 h-10 rounded-full bg-teal-500 hover:bg-teal-600 p-0 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      
    </div>
  );
}
