import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Heart, 
  CheckCircle, 
  Calendar,
  BarChart3,
  Search,
  Brain,
  Loader2,
  RefreshCw
} from "lucide-react";
import AidenOrb from "@/components/AidenOrb";
import { useToast } from "@/hooks/use-toast";
import type { Goal, TaDoneItem, GratitudeItem, JournalEntry } from "@shared/schema";

export default function Insights() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  // Default questions for easy access
  const defaultQuestions = [
    "What trends do you see in the last 6 months?",
    "Are there any repeat patterns in my entries?", 
    "List the three most common topics I tend to write about"
  ];

  // Fetch all data for insights
  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
    retry: false,
  });

  const { data: taDoneItems = [] } = useQuery<TaDoneItem[]>({
    queryKey: ["/api/tadone"],
    retry: false,
  });

  const { data: gratitudeItems = [] } = useQuery<GratitudeItem[]>({
    queryKey: ["/api/gratitude"],
    retry: false,
  });

  const { data: journalEntries = [] } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal/entries"],
    retry: false,
  });

  // Search mutation for journal analysis
  const searchMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest("POST", "/api/journal/analyze", { question });
      return await response.json();
    },
    onSuccess: (data) => {
      setSearchResult(data.answer);
      setHasSearched(true);
    },
    onError: (error: any) => {
      toast({
        title: "Search Failed",
        description: error.message || "Failed to analyze your journal entries",
        variant: "destructive"
      });
    }
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Empty Search",
        description: "Please enter a question about your journal entries",
        variant: "destructive"
      });
      return;
    }
    searchMutation.mutate(searchQuery.trim());
  };

  const handleDefaultQuestion = (question: string) => {
    setSearchQuery(question);
    searchMutation.mutate(question);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResult(null);
    setHasSearched(false);
  };

  // Calculate insights
  const completedGoals = goals.filter(goal => goal.status === "completed");
  const inProgressGoals = goals.filter(goal => goal.status === "in_progress");
  const goalCompletionRate = goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0;

  const today = new Date();
  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const thisWeekTaDone = taDoneItems.filter(item => new Date(item.createdAt!) > thisWeek);
  const thisWeekGratitude = gratitudeItems.filter(item => new Date(item.createdAt!) > thisWeek);
  const thisWeekJournals = journalEntries.filter(entry => new Date(entry.createdAt!) > thisWeek);

  const totalActiveDays = new Set([
    ...taDoneItems.map(item => new Date(item.createdAt!).toDateString()),
    ...gratitudeItems.map(item => new Date(item.createdAt!).toDateString()),
    ...journalEntries.map(entry => new Date(entry.createdAt!).toDateString()),
  ]).size;

  return (
    <div className="h-full overflow-y-auto p-6" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Journey Insights ✨</h2>
        <p className="text-gray-600">Celebrating your mindful growth</p>
      </div>

      {/* Journal Search & Analysis */}
      <Card className="mb-6 border-gradient-to-r from-indigo-500 to-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2 text-indigo-600" />
            Ask About Your Journal
          </CardTitle>
          <p className="text-sm text-gray-600">Get AI insights about your journaling patterns and growth</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="flex items-center space-x-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !searchMutation.isPending && searchQuery.trim()) {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              placeholder="Ask about patterns, themes, or insights in your journal..."
              className="flex-1"
              disabled={searchMutation.isPending}
            />
            <Button 
              onClick={handleSearch}
              disabled={searchMutation.isPending || !searchQuery.trim()}
              className={`px-4 ${searchQuery.trim() && !searchMutation.isPending ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
              title={searchQuery.trim() ? 'Search your journal entries' : 'Enter a question to search'}
            >
              {searchMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
            {hasSearched && (
              <Button 
                variant="outline" 
                onClick={handleClearSearch}
                className="px-4"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Default Questions */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Try these questions:</p>
            <div className="flex flex-wrap gap-2">
              {defaultQuestions.map((question, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 text-xs"
                  onClick={() => handleDefaultQuestion(question)}
                >
                  {question}
                </Badge>
              ))}
            </div>
          </div>

          {/* Search Result */}
          {searchResult && (
            <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <div className="flex items-start space-x-3">
                <AidenOrb size="sm" className="mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-indigo-900 mb-2">Aiden's Analysis:</p>
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{searchResult}</p>
                </div>
              </div>
            </div>
          )}

          {journalEntries.length === 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">Start journaling with Aiden to unlock personalized insights about your thoughts and patterns!</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Goal Progress Overview */}
        <Card className="border-gradient-to-r from-purple-500 to-indigo-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Target className="w-5 h-5 mr-2 text-purple-600" />
              Goal Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <span className="font-semibold">{goalCompletionRate}%</span>
              </div>
              <Progress value={goalCompletionRate} className="h-2" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-green-600">{completedGoals.length}</div>
                  <div className="text-gray-500">Completed</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-600">{inProgressGoals.length}</div>
                  <div className="text-gray-500">In Progress</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Activity */}
        <Card className="border-gradient-to-r from-teal-500 to-cyan-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <BarChart3 className="w-5 h-5 mr-2 text-teal-600" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Journal Sessions</span>
                <span className="font-semibold">{thisWeekJournals.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Accomplishments</span>
                <span className="font-semibold">{thisWeekTaDone.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Gratitude Entries</span>
                <span className="font-semibold">{thisWeekGratitude.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Total Active Days */}
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{totalActiveDays}</div>
            <div className="text-sm text-gray-600">Active Days</div>
          </CardContent>
        </Card>

        {/* Total Accomplishments */}
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{taDoneItems.length}</div>
            <div className="text-sm text-gray-600">Total Ta-Done!</div>
          </CardContent>
        </Card>
      </div>

      {/* Mindful Moments */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AidenOrb size="lg" className="mr-2" />
            Mindful Moments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {journalEntries.length > 0 ? (() => {
              // Get the most recent journal entry by createdAt date
              const latestEntry = journalEntries.reduce((latest, current) => 
                new Date(current.createdAt!) > new Date(latest.createdAt!) ? current : latest
              );
              
              return (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Recent Reflection</p>
                  <p className="font-medium text-gray-800 mb-2">{latestEntry.title || "Your latest journal conversation"}</p>
                  {latestEntry.summary && (
                    <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                      {latestEntry.summary}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    {new Date(latestEntry.createdAt!).toLocaleDateString()}
                  </p>
                </div>
              );
            })() : (
              <p className="text-gray-500 text-sm">Start journaling with Aiden to see your mindful moments here</p>
            )}

            {gratitudeItems.length > 0 && (() => {
              // Get the most recent gratitude item by createdAt date
              const latestGratitude = gratitudeItems.reduce((latest, current) => 
                new Date(current.createdAt!) > new Date(latest.createdAt!) ? current : latest
              );
              
              return (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Latest Gratitude</p>
                  <p className="font-medium text-gray-800">"{latestGratitude.description}"</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(latestGratitude.createdAt!).toLocaleDateString()}
                  </p>
                </div>
              );
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Encouragement Message */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <CardContent className="p-6 text-center">
          <Heart className="w-8 h-8 mx-auto mb-3" />
          <p className="font-medium mb-2">Keep up the amazing work!</p>
          <p className="text-sm opacity-90">
            Your mindful journey is creating positive momentum. Every small step counts toward your growth.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}