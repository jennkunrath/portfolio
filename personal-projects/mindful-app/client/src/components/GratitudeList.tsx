import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Plus } from "lucide-react";
import type { GratitudeItem } from "@shared/schema";

export default function GratitudeList() {
  const [newItem, setNewItem] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch Gratitude items
  const { data: items = [], isLoading } = useQuery<GratitudeItem[]>({
    queryKey: ["/api/gratitude"],
    retry: false,
  });

  // Create new Gratitude item
  const createItemMutation = useMutation({
    mutationFn: async (description: string) => {
      const response = await apiRequest("POST", "/api/gratitude", {
        description,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gratitude"] });
      setNewItem("");
      toast({
        title: "Grateful Heart 💝",
        description: "Your gratitude has been recorded with love.",
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
        description: "Failed to add gratitude entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete Gratitude item
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const response = await apiRequest("DELETE", `/api/gratitude/${itemId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gratitude"] });
      toast({
        title: "Item Deleted",
        description: "Gratitude item has been removed.",
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
    if (confirm("Are you sure you want to delete this gratitude item?")) {
      deleteItemMutation.mutate(itemId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    createItemMutation.mutate(newItem.trim());
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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Gratitude 💝</h2>
        <p className="text-gray-600">Count your blessings, one by one</p>
      </div>

      {/* Add New Gratitude */}
      <Card className="mb-6 bg-gradient-to-r from-pink-400 to-red-400 border-0">
        <CardContent className="p-4 text-white">
          <h3 className="font-semibold mb-3">What are you grateful for today?</h3>
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="I'm grateful for..."
              className="flex-1 bg-white/20 border-white/30 text-white placeholder-white/70 focus:ring-white/50 focus:border-white/50"
              disabled={createItemMutation.isPending}
            />
            <Button
              type="submit"
              disabled={!newItem.trim() || createItemMutation.isPending}
              className="bg-white/20 hover:bg-white/30 border-0 px-4"
            >
              {createItemMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Heart className="w-4 h-4" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Gratitude Items */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
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
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-pink-500" />
            </div>
            <p className="text-gray-600 text-sm">
              Start your gratitude practice by sharing something you're thankful for today.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className="border-gray-100 hover:border-pink-200 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="w-4 h-4 text-pink-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.description}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(item.createdAt!)}
                    </p>
                  </div>
                  <Button
                    onClick={() => deleteItem(item.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2"
                  >
                    🗑️
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
