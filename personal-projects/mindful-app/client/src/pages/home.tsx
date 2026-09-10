import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { JournalEntry } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import ChatInterface from "@/components/ChatInterface";
import TaDoneList from "@/components/TaDoneList";
import GratitudeList from "@/components/GratitudeList";
import GoalTracker from "@/components/GoalTracker";
import JournalEntries from "@/components/JournalEntries";
import { JournalCalendar } from "@/components/JournalCalendar";
import { 
  MessageCircle, 
  CheckCircle, 
  Heart, 
  Target, 
  User,
  Plus,
  Home,
  BarChart3,
  Settings,
  Book
} from "lucide-react";

type TabType = "chat" | "tadone" | "gratitude" | "goals" | "journal";

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("chat");
  const [continuingEntryId, setContinuingEntryId] = useState<number | null>(null);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  // Notify Layout about initial chat tab state
  useEffect(() => {
    const chatTabChangeEvent = new CustomEvent('chatTabChange', {
      detail: { isActive: activeTab === 'chat' }
    });
    window.dispatchEvent(chatTabChangeEvent);
  }, [activeTab]);

  const handleContinueConversation = (entry: JournalEntry) => {
    // Set the entry to continue and switch to chat tab
    setContinuingEntryId(entry.id);
    setActiveTab("chat");
    
    // Force a state reset to ensure clean loading
    window.setTimeout(() => {
      setContinuingEntryId(entry.id);
    }, 50);
  };

  const handleEntryLoaded = () => {
    // Don't clear the continuing entry ID immediately - let it persist until user switches tabs
    // This ensures the conversation stays loaded and doesn't get replaced with a new prompt
  };

  // Handle tab switching without resetting conversation state
  const handleTabChange = (tab: TabType) => {
    // Clear continuing entry ID when switching away from chat to prevent stale state
    if (activeTab === 'chat' && tab !== 'chat' && continuingEntryId) {
      setContinuingEntryId(null);
    }
    
    setActiveTab(tab);
    
    // Dispatch event to notify Layout about chat tab state
    const chatTabChangeEvent = new CustomEvent('chatTabChange', {
      detail: { isActive: tab === 'chat' }
    });
    window.dispatchEvent(chatTabChangeEvent);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-xl text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your mindful space...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  const TabButton = ({ 
    tab, 
    icon: Icon, 
    label, 
    isActive 
  }: { 
    tab: TabType; 
    icon: any; 
    label: string; 
    isActive: boolean;
  }) => (
    <button
      onClick={() => handleTabChange(tab)}
      className={`flex-1 py-4 px-3 text-center transition-colors ${
        isActive
          ? "text-teal-600 border-b-2 border-teal-600 font-medium"
          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
      }`}
    >
      <Icon className="w-4 h-4 block mb-1 mx-auto" />
      <span className="text-xs whitespace-nowrap">{label}</span>
    </button>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "chat":
        return <ChatInterface 
          continueEntryId={continuingEntryId} 
          onEntryLoaded={handleEntryLoaded}
          onViewEntry={handleContinueConversation}
        />;
      case "tadone":
        return <TaDoneList />;
      case "gratitude":
        return <GratitudeList />;
      case "goals":
        return <GoalTracker />;
      case "journal":
        return <JournalCalendar onContinueConversation={handleContinueConversation} />;
      default:
        return <ChatInterface 
          continueEntryId={continuingEntryId} 
          onEntryLoaded={handleEntryLoaded}
          onViewEntry={handleContinueConversation}
        />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 flex flex-col h-full">{/* Better mobile viewport support */}

      {/* Tab Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          <TabButton
            tab="chat"
            icon={MessageCircle}
            label="Chat"
            isActive={activeTab === "chat"}
          />
          <TabButton
            tab="tadone"
            icon={CheckCircle}
            label="Ta-Done!"
            isActive={activeTab === "tadone"}
          />
          <TabButton
            tab="gratitude"
            icon={Heart}
            label="Gratitude"
            isActive={activeTab === "gratitude"}
          />
          <TabButton
            tab="goals"
            icon={Target}
            label="Goals"
            isActive={activeTab === "goals"}
          />
          <TabButton
            tab="journal"
            icon={Book}
            label="Journal"
            isActive={activeTab === "journal"}
          />
        </div>
      </nav>

      {/* Main Content - Better mobile handling */}
      <div className="flex-1 relative" style={{ minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {renderTabContent()}
      </div>

      
    </div>
  );
}
