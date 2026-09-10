import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Book, 
  Calendar, 
  MessageCircle, 
  ChevronRight,
  Play
} from "lucide-react";
import AidenOrb from "./AidenOrb";
import type { JournalEntry } from "@shared/schema";

interface JournalEntriesProps {
  onContinueConversation?: (entry: JournalEntry) => void;
}

export default function JournalEntries({ onContinueConversation }: JournalEntriesProps = {}) {
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const viewEntryDetails = (entry: JournalEntry) => {
    setSelectedEntry(entry);
  };
  
  const closeDetails = () => {
    setSelectedEntry(null);
  };

  // Delete journal entry
  const deleteEntryMutation = useMutation({
    mutationFn: async (entryId: number) => {
      const response = await apiRequest("DELETE", `/api/journal/entries/${entryId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal/entries"] });
      toast({
        title: "Entry Deleted",
        description: "Journal entry has been removed.",
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
        description: "Failed to delete entry.",
        variant: "destructive",
      });
    },
  });

  const deleteEntry = (entryId: number) => {
    if (confirm("Are you sure you want to delete this journal entry? This action cannot be undone.")) {
      deleteEntryMutation.mutate(entryId);
    }
  };
  const { data: entries = [], isLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal/entries"],
    retry: false,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const getMessageCount = (conversation: any) => {
    if (!conversation || !Array.isArray(conversation)) return 0;
    return conversation.length;
  };

  const getPreview = (conversation: any) => {
    if (!conversation || !Array.isArray(conversation) || conversation.length === 0) {
      return "No preview available";
    }
    const userMessages = conversation.filter(msg => msg.role === "user");
    if (userMessages.length > 0) {
      const preview = userMessages[0].content;
      return preview.length > 100 ? preview.substring(0, 100) + "..." : preview;
    }
    return "Conversation with Aiden";
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Journal Entries 📖</h2>
          <p className="text-gray-600">Your mindful conversations with Arlo</p>
        </div>
        
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-gray-100">
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-2/3 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Journal Entries 📖</h2>
        <p className="text-gray-600">Your mindful conversations with Aiden</p>
      </div>
      {entries.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Book className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Your journal entries will appear here after you finish conversations with Aiden.
            </p>
            <p className="text-gray-500 text-xs">
              Start a chat to create your first mindful journal entry
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <Card key={entry.id} className="border-gray-100 hover:border-gray-200 transition-colors">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 mb-1">{entry.title}</h3>
                      {entry.summary && (
                        <p className="text-sm text-gray-600 mb-2">{entry.summary}</p>
                      )}

                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <div className="flex items-center text-xs text-gray-500 mb-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(entry.createdAt!.toString())}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <MessageCircle className="w-3 h-3 mr-1" />
                        {getMessageCount(entry.conversation)} messages
                      </div>
                    </div>
                  </div>

                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {entry.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-6 min-w-0 flex-shrink">
                        <div className="flex items-center text-xs text-gray-500">
                          <AidenOrb size="sm" className="mr-1" />
                          Conversation with Aiden
                        </div>
                        {!entry.isComplete && (
                          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs whitespace-nowrap">
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!entry.isComplete && onContinueConversation && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => onContinueConversation(entry)}
                            className="text-teal-600 border-teal-200 hover:bg-teal-50 text-xs px-2 py-1"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Continue
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs px-2 py-1"
                          onClick={() => viewEntryDetails(entry)}
                        >
                          View Details
                          <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 w-8 h-8 flex items-center justify-center"
                          onClick={() => deleteEntry(entry.id)}
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {entries.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">Keep journaling with Aiden to build your collection of mindful moments</p>
        </div>
      )}
      {/* Entry Details Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{selectedEntry.title}</h2>
                <Button variant="ghost" onClick={closeDetails}>
                  ✕
                </Button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  {new Date(selectedEntry.createdAt!).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric", 
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit"
                  })}
                </p>
                {selectedEntry.summary && (
                  <p className="text-gray-700 mb-4">{selectedEntry.summary}</p>
                )}
              </div>

              {selectedEntry.conversation && Array.isArray(selectedEntry.conversation) && (
                <div className="space-y-3 mb-6">
                  <h3 className="font-medium text-gray-800">Conversation with Aiden</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3 max-h-60 overflow-y-auto">
                    {selectedEntry.conversation.map((message: any, index: number) => (
                      <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                          message.role === "user" 
                            ? "bg-teal-500 text-white" 
                            : "bg-white border"
                        }`}>
                          {String(message.content)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                {!selectedEntry.isComplete && (
                  <Button 
                    onClick={() => {
                      closeDetails();
                      onContinueConversation?.(selectedEntry);
                    }}
                    className="bg-teal-500 hover:bg-teal-600"
                  >
                    Continue Conversation
                  </Button>
                )}
                <Button variant="outline" onClick={closeDetails}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}