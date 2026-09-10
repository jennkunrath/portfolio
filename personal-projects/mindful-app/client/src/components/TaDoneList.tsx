import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Heart, Plus } from "lucide-react";
import type { TaDoneItem, Goal } from "@shared/schema";

export default function TaDoneList() {
  const [newItem, setNewItem] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState<string>("none");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch Ta-Done items
  const { data: items = [], isLoading } = useQuery<TaDoneItem[]>({
    queryKey: ["/api/tadone"],
    retry: false,
  });

  // Fetch Goals for linking
  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
    retry: false,
  });

  // Create new Ta-Done item
  const createItemMutation = useMutation({
    mutationFn: async ({ description, goalId }: { description: string; goalId?: number }) => {
      const response = await apiRequest("POST", "/api/tadone", {
        description,
        goalId: goalId || null,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tadone"] });
      setNewItem("");
      setSelectedGoalId("none");
      toast({
        title: "Ta-Done! 🎉",
        description: "Your accomplishment has been celebrated!",
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
        description: "Failed to add Ta-Done item. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete Ta-Done item
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const response = await apiRequest("DELETE", `/api/tadone/${itemId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tadone"] });
      toast({
        title: "Item Deleted",
        description: "Ta-Done item has been removed.",
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
        description: "Failed to delete item.",
        variant: "destructive",
      });
    },
  });

  const deleteItem = (itemId: number) => {
    if (confirm("Are you sure you want to delete this Ta-Done item?")) {
      deleteItemMutation.mutate(itemId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    createItemMutation.mutate({
      description: newItem.trim(),
      goalId: selectedGoalId && selectedGoalId !== "none" ? parseInt(selectedGoalId) : undefined,
    });
  };

  const celebrate = (itemId: number) => {
    // Add celebration animation
    const element = document.querySelector(`[data-item-id="${itemId}"]`);
    if (element) {
      element.classList.add("animate-bounce");
      setTimeout(() => {
        element.classList.remove("animate-bounce");
      }, 600);
    }
    
    toast({
      title: "🎉 Celebration!",
      description: "Way to go! You're amazing!",
    });
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Ta-Done! 🎉</h2>
        <p className="text-gray-600">Celebrate your accomplishments, big and small!</p>
      </div>

      {/* Add New Ta-Done */}
      <Card className="mb-6 border-0" style={{ background: 'linear-gradient(to right, #f9a566, #e8935a)' }}>
        <CardContent className="p-4 text-white">
          <h3 className="font-semibold mb-3">Add Something You've Accomplished</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="I finished..."
              className="w-full bg-white/20 border-white/30 text-white placeholder-white/70 focus:ring-white/50 focus:border-white/50"
              disabled={createItemMutation.isPending}
            />
            
            {goals.length > 0 && (
              <Select
                value={selectedGoalId}
                onValueChange={setSelectedGoalId}
                disabled={createItemMutation.isPending}
              >
                <SelectTrigger className="w-full bg-white/20 border-white/30 text-white focus:ring-white/50 focus:border-white/50">
                  <SelectValue placeholder="Link to a goal (optional)" className="text-white/70" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No goal</SelectItem>
                  {goals.filter(goal => goal.status === "in_progress").map((goal) => (
                    <SelectItem key={goal.id} value={goal.id.toString()}>
                      {goal.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!newItem.trim() || createItemMutation.isPending}
                className="bg-white/20 hover:bg-white/30 border-0 px-4"
              >
                {createItemMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Ta-Done Items */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-gray-100">
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-coral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-coral-500" />
            </div>
            <p className="text-gray-600 text-sm">
              Ready to celebrate your first accomplishment? Add something you've done above!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 pb-6">
          {items.map((item) => (
            <Card
              key={item.id}
              data-item-id={item.id}
              className="border-gray-100 hover:border-coral-200 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-coral-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-coral-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.description}</p>
                    {item.goalId && (
                      <p className="text-xs text-teal-600 font-medium mt-1">
                        🎯 {goals.find(g => g.id === item.goalId)?.title || "Goal"}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(item.createdAt!)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      onClick={() => celebrate(item.id)}
                      variant="ghost"
                      size="sm"
                      className="text-coral-500 hover:text-coral-600 hover:bg-coral-50 p-2"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => deleteItem(item.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2"
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
