import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  User, 
  Bell, 
  Palette, 
  Download, 
  Trash2, 
  LogOut,
  Moon,
  Sun,
  Shield,
  Camera,
  Upload,
  Clock,
  Users,
  DollarSign,
  BarChart3,
  Edit3,
  Check,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notifications, setNotifications] = useState(true);
  const [weeklyInsights, setWeeklyInsights] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editingDisplayName, setEditingDisplayName] = useState(false);
  const [displayNameValue, setDisplayNameValue] = useState("");

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your data export will be ready shortly.",
    });
  };

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/auth/user");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account Deleted",
        description: "Your account and all data have been permanently deleted.",
      });
      // Redirect to login after a brief delay
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 2000);
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
        title: "Deletion Failed",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteAccount = () => {
    const confirmation = window.confirm(
      "Are you absolutely sure you want to delete your account?\n\n" +
      "This will permanently delete:\n" +
      "• All your journal conversations with Aiden\n" +
      "• Your Ta-Done list and accomplishments\n" +
      "• Your gratitude entries\n" +
      "• Your goals and progress\n" +
      "• Your profile and settings\n\n" +
      "This action cannot be undone!"
    );

    if (confirmation) {
      const finalConfirmation = window.confirm(
        "Last chance! Are you really sure you want to permanently delete everything?\n\n" +
        "Type 'DELETE' and click OK if you're absolutely certain."
      );

      if (finalConfirmation) {
        deleteAccountMutation.mutate();
      }
    }
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  // Profile picture upload mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (customProfileImageUrl: string) => {
      const response = await apiRequest("PATCH", "/api/auth/user", {
        customProfileImageUrl,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile Updated",
        description: "Your profile picture has been updated successfully!",
      });
      setIsUploadingImage(false);
    },
    onError: (error) => {
      setIsUploadingImage(false);
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
        title: "Upload Failed",
        description: "Failed to update profile picture. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (2MB limit for better performance)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 2MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingImage(true);

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      updateProfileMutation.mutate(result);
    };
    reader.onerror = () => {
      setIsUploadingImage(false);
      toast({
        title: "Upload Error",
        description: "Failed to read the image file.",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Get the display profile image (custom or from Replit)
  const displayProfileImage = user?.customProfileImageUrl || user?.profileImageUrl;

  // Common timezones for selection
  const commonTimezones = [
    { value: "UTC", label: "UTC (Coordinated Universal Time)" },
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "America/Phoenix", label: "Arizona Time (MST)" },
    { value: "America/Anchorage", label: "Alaska Time (AKST)" },
    { value: "Pacific/Honolulu", label: "Hawaii Time (HST)" },
    { value: "Europe/London", label: "London (GMT/BST)" },
    { value: "Europe/Paris", label: "Paris (CET/CEST)" },
    { value: "Europe/Berlin", label: "Berlin (CET/CEST)" },
    { value: "Europe/Rome", label: "Rome (CET/CEST)" },
    { value: "Asia/Tokyo", label: "Tokyo (JST)" },
    { value: "Asia/Shanghai", label: "Shanghai (CST)" },
    { value: "Asia/Kolkata", label: "India (IST)" },
    { value: "Australia/Sydney", label: "Sydney (AEDT/AEST)" },
    { value: "Australia/Melbourne", label: "Melbourne (AEDT/AEST)" },
  ];

  // Timezone update mutation
  const updateTimezoneMutation = useMutation({
    mutationFn: async (timezone: string) => {
      const response = await apiRequest("PATCH", "/api/auth/user", {
        timezone,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Timezone Updated",
        description: "Your timezone preference has been saved successfully!",
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
        title: "Update Failed",
        description: "Failed to update timezone. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleTimezoneChange = (timezone: string) => {
    updateTimezoneMutation.mutate(timezone);
  };

  // Text size update mutation
  const updateTextSizeMutation = useMutation({
    mutationFn: async (textSize: string) => {
      const response = await apiRequest("PATCH", "/api/auth/user", {
        textSize,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Text Size Updated",
        description: "Your text size preference has been saved successfully!",
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
        title: "Update Failed",
        description: "Failed to update text size. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleTextSizeChange = (textSize: string) => {
    updateTextSizeMutation.mutate(textSize);
  };

  // Update display name mutation
  const updateDisplayNameMutation = useMutation({
    mutationFn: async (displayName: string) => {
      const response = await apiRequest("PATCH", "/api/auth/user", {
        displayName: displayName.trim() || null,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setEditingDisplayName(false);
      setDisplayNameValue("");
      toast({
        title: "Display Name Updated",
        description: "Your display name has been updated successfully!",
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
        title: "Update Failed",
        description: "Failed to update display name. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStartEditDisplayName = () => {
    setDisplayNameValue((user as any)?.displayName || "");
    setEditingDisplayName(true);
  };

  const handleSaveDisplayName = () => {
    if (displayNameValue.trim().length > 50) {
      toast({
        title: "Invalid Length",
        description: "Display name must be 50 characters or less.",
        variant: "destructive",
      });
      return;
    }
    updateDisplayNameMutation.mutate(displayNameValue);
  };

  const handleCancelEditDisplayName = () => {
    setEditingDisplayName(false);
    setDisplayNameValue("");
  };

  // Admin functionality
  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: user?.isAdmin || false,
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/users");
      return response.json();
    },
  });

  const { data: usageStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/usage-stats"],
    enabled: user?.isAdmin || false,
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/usage-stats");
      return response.json();
    },
  });

  const setAdminMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${userId}/admin`, {
        isAdmin,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Admin Status Updated",
        description: "User admin privileges have been updated successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update admin status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/usage-stats"] });
      toast({
        title: "Account Deleted",
        description: "User account has been deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete user account. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="h-full overflow-y-auto p-6 max-w-2xl mx-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Settings ⚙️</h2>
        <p className="text-gray-600">Customize your MindfulFlow experience</p>
      </div>

      {/* Profile Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {displayProfileImage ? (
                <img 
                  src={displayProfileImage} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-100 to-sage-100 flex items-center justify-center border-2 border-gray-200">
                  <User className="w-8 h-8 text-teal-600" />
                </div>
              )}
              <button
                onClick={handleUploadClick}
                disabled={isUploadingImage}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-teal-500 hover:bg-teal-600 rounded-full flex items-center justify-center transition-colors shadow-md disabled:opacity-50"
              >
                {isUploadingImage ? (
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-3 h-3 text-white" />
                )}
              </button>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">
                {(user as any)?.displayName || 
                 (user?.firstName || user?.lastName 
                  ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                  : 'MindfulFlow User')}
              </p>
              <p className="text-sm text-gray-600">{user?.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUploadClick}
                  disabled={isUploadingImage}
                  className="text-xs"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  {isUploadingImage ? "Uploading..." : "Change Picture"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartEditDisplayName}
                  className="text-xs"
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  Edit Name
                </Button>
              </div>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Separator />
          
          {editingDisplayName && (
            <div className="space-y-3">
              <Label htmlFor="displayName">Display Name</Label>
              <div className="flex space-x-2">
                <Input
                  id="displayName"
                  value={displayNameValue}
                  onChange={(e) => setDisplayNameValue(e.target.value)}
                  placeholder="Enter your display name (optional)"
                  maxLength={50}
                  className="flex-1"
                />
                <Button
                  onClick={handleSaveDisplayName}
                  size="sm"
                  disabled={updateDisplayNameMutation.isPending}
                  className="bg-teal-500 hover:bg-teal-600"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleCancelEditDisplayName}
                  variant="outline"
                  size="sm"
                  disabled={updateDisplayNameMutation.isPending}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                {displayNameValue.length}/50 characters
                {displayNameValue.trim() === "" && " (Leave empty to use your Replit name)"}
              </p>
            </div>
          )}
          
          <p className="text-sm text-gray-500">
            Upload a custom profile picture (max 2MB) or use your Replit account image.
            {user?.customProfileImageUrl && " Using custom uploaded image."}
          </p>
        </CardContent>
      </Card>

      {/* Timezone Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Timezone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="timezone">Your Timezone</Label>
            <Select 
              value={user?.timezone || "UTC"} 
              onValueChange={handleTimezoneChange}
              disabled={updateTimezoneMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your timezone" />
              </SelectTrigger>
              <SelectContent>
                {commonTimezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-gray-500">
            This helps ensure your daily journal conversations start at the right time for your location.
          </p>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="w-5 h-5 mr-2" />
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center">
                <Bell className="w-4 h-4 mr-2" />
                Mindful Reminders
              </Label>
              <p className="text-sm text-gray-500">Get gentle nudges to journal and reflect</p>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center">
                <Moon className="w-4 h-4 mr-2" />
                Dark Mode
              </Label>
              <p className="text-sm text-gray-500">Switch to a darker theme</p>
            </div>
            <Switch
              checked={isDarkMode}
              onCheckedChange={toggleDarkMode}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="flex items-center">
              <span className="text-lg mr-2">Aa</span>
              Chat Text Size
            </Label>
            <Select
              value={user?.textSize || "small"}
              onValueChange={handleTextSizeChange}
              disabled={updateTextSizeMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select text size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">
                  <span className="text-sm">Small (Current)</span>
                </SelectItem>
                <SelectItem value="medium">
                  <span className="text-base">Medium</span>
                </SelectItem>
                <SelectItem value="large">
                  <span className="text-lg">Large</span>
                </SelectItem>
              </SelectContent>
            </Select>
            {updateTextSizeMutation.isPending && (
              <p className="text-xs text-gray-500">Updating text size...</p>
            )}
            <p className="text-sm text-gray-500">
              Changes the text size in chat conversations with Aiden
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center">
                Weekly Insights
              </Label>
              <p className="text-sm text-gray-500">Receive weekly progress summaries</p>
            </div>
            <Switch
              checked={weeklyInsights}
              onCheckedChange={setWeeklyInsights}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Data & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleExportData}
          >
            <Download className="w-4 h-4 mr-2" />
            Export My Data
          </Button>
          
          <Button 
            variant="destructive" 
            className="w-full justify-start"
            onClick={handleDeleteAccount}
            disabled={deleteAccountMutation.isPending}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {deleteAccountMutation.isPending ? "Deleting Account..." : "Delete My Data"}
          </Button>
          
          <p className="text-sm text-gray-500">
            Your data is securely stored and encrypted. We never share your personal information 
            or journal entries with third parties.
          </p>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>About MindfulFlow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            Version 1.0.0 - Your AI-powered companion for mindful journaling and personal growth.
          </p>
          <p className="text-sm text-gray-600">
            Built with care to help you celebrate achievements, practice gratitude, 
            and reflect on your journey.
          </p>
          <div className="pt-2">
            <p className="text-xs text-gray-400">
              Made with ❤️ for mindful living
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Admin Panel - Only visible to admins */}
      {user?.isAdmin && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Admin Panel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Management */}
            <div className="space-y-4">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                <h3 className="font-medium">User Management</h3>
              </div>
              
              {usersLoading ? (
                <p className="text-sm text-gray-500">Loading users...</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {allUsers?.map((adminUser: any) => (
                    <div 
                      key={adminUser.id} 
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedUserId === adminUser.id 
                          ? 'bg-blue-100 border-2 border-blue-300' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedUserId(selectedUserId === adminUser.id ? null : adminUser.id)}
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-sm">
                          {adminUser.firstName} {adminUser.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{adminUser.email}</p>
                        <p className="text-xs text-gray-400">
                          Joined: {new Date(adminUser.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {adminUser.isAdmin && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Admin
                          </span>
                        )}
                        <Switch
                          checked={adminUser.isAdmin || false}
                          onCheckedChange={(checked) => 
                            setAdminMutation.mutate({ userId: adminUser.id, isAdmin: checked })
                          }
                          disabled={setAdminMutation.isPending || adminUser.id === user?.id}
                          onClick={(e) => e.stopPropagation()}
                        />
                        {adminUser.id !== user?.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Are you sure you want to delete ${adminUser.firstName} ${adminUser.lastName}'s account? This action cannot be undone.`)) {
                                deleteUserMutation.mutate(adminUser.id);
                              }
                            }}
                            disabled={deleteUserMutation.isPending}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Usage Statistics */}
            <div className="space-y-4">
              <div className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                <h3 className="font-medium">OpenAI Usage & Costs</h3>
              </div>
              
              {statsLoading ? (
                <p className="text-sm text-gray-500">Loading usage statistics...</p>
              ) : (
                <div className="space-y-4">
                  {selectedUserId ? (
                    // Individual User View
                    (() => {
                      const selectedUserStats = usageStats?.find((u: any) => u.userId === selectedUserId);
                      const selectedUserInfo = allUsers?.find((u: any) => u.id === selectedUserId);
                      
                      return selectedUserStats ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-700">
                              Usage for {selectedUserInfo?.firstName} {selectedUserInfo?.lastName}
                            </h4>
                            
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                              <DollarSign className="w-5 h-5 mx-auto mb-2 text-blue-600" />
                              <p className="text-xl font-bold text-blue-800">
                                ${selectedUserStats.totalCostDollars}
                              </p>
                              <p className="text-sm text-blue-600">Total Cost</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                              <BarChart3 className="w-5 h-5 mx-auto mb-2 text-green-600" />
                              <p className="text-xl font-bold text-green-800">
                                {selectedUserStats.totalTokens.toLocaleString()}
                              </p>
                              <p className="text-sm text-green-600">Total Tokens</p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                              <Users className="w-5 h-5 mx-auto mb-2 text-purple-600" />
                              <p className="text-xl font-bold text-purple-800">
                                {selectedUserStats.requestCount}
                              </p>
                              <p className="text-sm text-purple-600">API Calls</p>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>User Details:</strong>
                            </p>
                            <p className="text-sm text-gray-600">Email: {selectedUserInfo?.email}</p>
                            <p className="text-sm text-gray-600">
                              Joined: {new Date(selectedUserInfo?.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              Admin: {selectedUserInfo?.isAdmin ? 'Yes' : 'No'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-4 text-gray-500">
                          <p>No usage data found for this user</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="mt-2"
                            onClick={() => setSelectedUserId(null)}
                          >
                            View All Users
                          </Button>
                        </div>
                      );
                    })()
                  ) : (
                    // Overall Summary View
                    <>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <DollarSign className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                          <p className="text-lg font-bold text-blue-800">
                            ${usageStats?.reduce((total: number, user: any) => total + parseFloat(user.totalCostDollars || 0), 0).toFixed(4)}
                          </p>
                          <p className="text-xs text-blue-600">Total Cost</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <BarChart3 className="w-4 h-4 mx-auto mb-1 text-green-600" />
                          <p className="text-lg font-bold text-green-800">
                            {usageStats?.reduce((total: number, user: any) => total + (user.totalTokens || 0), 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-green-600">Total Tokens</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <Users className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                          <p className="text-lg font-bold text-purple-800">
                            {usageStats?.reduce((total: number, user: any) => total + (user.requestCount || 0), 0)}
                          </p>
                          <p className="text-xs text-purple-600">API Calls</p>
                        </div>
                      </div>

                      
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Actions */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleDeleteAccount}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}