import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Plus, CheckCircle, MoreVertical, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Goal } from "@shared/schema";

export default function GoalTracker() {
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch Goals
  const { data: goals = [], isLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
    retry: false,
  });

  // Create new Goal
  const createGoalMutation = useMutation({
    mutationFn: async ({ title, category }: { title: string; category: string }) => {
      const response = await apiRequest("POST", "/api/goals", {
        title,
        category,
        description: "",
        status: "in_progress",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setNewGoalTitle("");
      setNewGoalCategory("");
      toast({
        title: "Goal Created! 🎯",
        description: "Your new intention has been set. You've got this!",
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
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update Goal
  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Goal> }) => {
      const response = await apiRequest("PATCH", `/api/goals/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
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
        description: "Failed to update goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete Goal
  const deleteGoalMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/goals/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Goal Deleted",
        description: "Goal has been removed from your tracker.",
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
        description: "Failed to delete goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim() || !newGoalCategory) return;
    createGoalMutation.mutate({
      title: newGoalTitle.trim(),
      category: newGoalCategory,
    });
  };

  const toggleGoalCompletion = (goal: Goal) => {
    const newStatus = goal.status === "completed" ? "in_progress" : "completed";
    const updates: Partial<Goal> = {
      status: newStatus,
      completedAt: newStatus === "completed" ? new Date().toISOString() as any : null,
    };
    
    updateGoalMutation.mutate({ id: goal.id, updates });
    
    if (newStatus === "completed") {
      toast({
        title: "Goal Completed! 🎉",
        description: `Congratulations on completing "${goal.title}"!`,
      });
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "health":
        return { bg: "bg-green-100", text: "text-green-700", border: "border-green-500" };
      case "career":
        return { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-500" };
      case "relationships":
        return { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-500" };
      case "personal":
        return { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-500" };
      case "financial":
        return { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-500" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-500" };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return { bg: "bg-green-500", indicator: "bg-green-500" };
      case "in_progress":
        return { bg: "bg-yellow-500", indicator: "bg-yellow-500" };
      case "archived":
        return { bg: "bg-gray-500", indicator: "bg-gray-500" };
      default:
        return { bg: "bg-yellow-500", indicator: "bg-yellow-500" };
    }
  };

  const inProgressGoals = goals.filter(goal => goal.status === "in_progress");
  const completedGoals = goals.filter(goal => goal.status === "completed");

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Goals & Intentions 🎯</h2>
        <p className="text-gray-600">Track your journey of growth</p>
      </div>

      {/* Add New Goal */}
      <Card className="mb-6 bg-gradient-to-r from-purple-500 to-indigo-500 border-0">
        <CardContent className="p-4 text-white">
          <h3 className="font-semibold mb-3">Create New Goal</h3>
          <form onSubmit={handleSubmit} className="space-y-2">
            <Input
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              placeholder="Goal title..."
              className="w-full bg-white/20 border-white/30 text-white placeholder-white/70 focus:ring-white/50 focus:border-white/50"
              disabled={createGoalMutation.isPending}
            />
            <div className="flex space-x-2">
              <Select
                value={newGoalCategory}
                onValueChange={setNewGoalCategory}
                disabled={createGoalMutation.isPending}
              >
                <SelectTrigger className="flex-1 bg-white/20 border-white/30 text-white focus:ring-white/50 focus:border-white/50">
                  <SelectValue placeholder="Select category" className="text-white/70" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="health">Health & Wellness</SelectItem>
                  <SelectItem value="career">Career</SelectItem>
                  <SelectItem value="relationships">Relationships</SelectItem>
                  <SelectItem value="personal">Personal Growth</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="submit"
                disabled={!newGoalTitle.trim() || !newGoalCategory || createGoalMutation.isPending}
                className="bg-white/20 hover:bg-white/30 border-0 px-4"
              >
                {createGoalMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Goals Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="border-gray-100">
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-purple-500" />
            </div>
            <p className="text-gray-600 text-sm">
              Set your first intention and start tracking your personal growth journey.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* In Progress Goals */}
          {inProgressGoals.length > 0 && (
            <Card className="border-gray-100">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                  In Progress
                </h3>
                
                <div className="space-y-4">
                  {inProgressGoals.map((goal) => {
                    const categoryColors = getCategoryColor(goal.category);
                    return (
                      <div key={goal.id} className={`border-l-4 ${categoryColors.border} pl-4`}>
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-800 flex-1">{goal.title}</h4>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => toggleGoalCompletion(goal)}
                                className="flex items-center"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark Complete
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteGoalMutation.mutate(goal.id)}
                                className="flex items-center text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        {goal.description && (
                          <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                        )}
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-xs ${categoryColors.bg} ${categoryColors.text} px-2 py-1 rounded-full`}>
                            {goal.category === "health" ? "Health & Wellness" : 
                             goal.category === "personal" ? "Personal Growth" :
                             goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
                          </span>
                          <span className="text-xs text-gray-500">
                            Started {formatDate(goal.startDate!)}
                          </span>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <Card className="border-gray-100">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  Completed
                </h3>
                
                <div className="space-y-4">
                  {completedGoals.map((goal) => {
                    const categoryColors = getCategoryColor(goal.category);
                    return (
                      <div key={goal.id} className="border-l-4 border-green-500 pl-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-800 flex-1">{goal.title}</h4>
                          <span className="text-green-600">
                            <CheckCircle className="w-5 h-5" />
                          </span>
                        </div>
                        {goal.description && (
                          <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${categoryColors.bg} ${categoryColors.text} px-2 py-1 rounded-full`}>
                            {goal.category === "health" ? "Health & Wellness" : 
                             goal.category === "personal" ? "Personal Growth" :
                             goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
                          </span>
                          <span className="text-xs text-gray-500">
                            Completed {goal.completedAt ? formatDate(goal.completedAt) : "Recently"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
