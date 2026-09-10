import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, ChevronLeft, ChevronRight, MessageCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AidenOrb from "./AidenOrb";
import type { JournalEntry } from "@shared/schema";

interface JournalCalendarProps {
  onContinueConversation?: (entry: JournalEntry) => void;
}

export function JournalCalendar({ onContinueConversation }: JournalCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  const { data: entries = [], isLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal/entries"],
    retry: false,
  });

  // Get the most recent entry
  const mostRecentEntry = entries.length > 0 ? entries[0] : null;
  const olderEntries = entries.slice(1);

  // Create a map of dates to entries for the calendar
  const entriesByDate = olderEntries.reduce((acc, entry) => {
    const date = new Date(entry.createdAt!).toDateString();
    acc[date] = entry;
    return acc;
  }, {} as Record<string, JournalEntry>);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getMessageCount = (conversation: any) => {
    if (!conversation || !Array.isArray(conversation)) return 0;
    return conversation.length;
  };

  // Calendar navigation
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Calendar grid generation
  const generateCalendarDays = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentMonth = firstDay.getMonth();

    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = day.getMonth() === currentMonth;
      const hasEntry = entriesByDate[day.toDateString()];
      const isToday = day.toDateString() === new Date().toDateString();

      days.push({
        date: day,
        isCurrentMonth,
        hasEntry,
        isToday,
        entry: hasEntry,
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-6 p-4">
      {/* Most Recent Entry */}
      {mostRecentEntry && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Current Entry</h2>
          <Card className="border-teal-200 bg-gradient-to-r from-teal-50 to-green-50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 mb-1">{mostRecentEntry.title}</h3>
                  {mostRecentEntry.summary && (
                    <p className="text-sm text-gray-600 mb-2">{mostRecentEntry.summary}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <div className="flex items-center text-xs text-gray-500 mb-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(mostRecentEntry.createdAt!).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    {getMessageCount(mostRecentEntry.conversation)} messages
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-teal-100">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-6 min-w-0 flex-shrink">
                    <div className="flex items-center text-xs text-gray-500">
                      <AidenOrb size="sm" className="mr-1" />
                      Conversation with Aiden
                    </div>
                    {!mostRecentEntry.isComplete && (
                      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs whitespace-nowrap">
                        Active
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!mostRecentEntry.isComplete && onContinueConversation && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onContinueConversation(mostRecentEntry)}
                        className="text-teal-600 border-teal-200 hover:bg-teal-50 text-xs px-3 py-1"
                      >
                        Continue
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Calendar View for Older Entries */}
      {olderEntries.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Journal History</h2>
          
          {/* Calendar Header */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={previousMonth}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={nextMonth}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`
                      relative h-10 flex items-center justify-center text-sm cursor-pointer rounded
                      ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-300'}
                      ${day.isToday ? 'bg-blue-100 text-blue-900 font-medium' : ''}
                      ${day.hasEntry ? 'bg-teal-100 text-teal-900 hover:bg-teal-200' : 'hover:bg-gray-100'}
                    `}
                    onClick={() => day.hasEntry && setSelectedEntry(day.entry)}
                  >
                    {day.date.getDate()}
                    {day.hasEntry && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-teal-500 rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Entry Details Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{selectedEntry.title}</h2>
                <Button variant="ghost" onClick={() => setSelectedEntry(null)}>
                  ✕
                </Button>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(selectedEntry.createdAt!).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric", 
                      month: "long",
                      day: "numeric"
                    })}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatTime(selectedEntry.createdAt!.toString())}
                  </div>
                </div>
                {selectedEntry.summary && (
                  <p className="text-gray-700 mb-4">{selectedEntry.summary}</p>
                )}
              </div>

              {selectedEntry.conversation && Array.isArray(selectedEntry.conversation) && (
                <div className="space-y-3 mb-6">
                  <h3 className="font-medium text-gray-800">Conversation with Aiden</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3 max-h-60 overflow-y-auto">
                    {(selectedEntry.conversation as any[]).map((message: any, index: number) => (
                      <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                          message.role === "user" 
                            ? "bg-teal-500 text-white" 
                            : "bg-white border"
                        }`}>
                          {message.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                {!selectedEntry.isComplete && onContinueConversation && (
                  <Button 
                    onClick={() => {
                      setSelectedEntry(null);
                      onContinueConversation(selectedEntry);
                    }}
                    className="bg-teal-500 hover:bg-teal-600"
                  >
                    Continue Conversation
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedEntry(null)}>
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