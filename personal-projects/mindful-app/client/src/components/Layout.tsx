import { useAuth } from "@/hooks/useAuth";
import { 
  Home,
  BarChart3,
  Settings,
  User
} from "lucide-react";
import { useLocation } from "wouter";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-900 shadow-xl w-full flex flex-col h-full">
        {/* Header */}
        <header className="bg-gradient-to-r from-teal-500 to-sage-500 px-6 py-4 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Profile photo */}
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                {((user as any)?.customProfileImageUrl || (user as any)?.profileImageUrl) ? (
                  <img 
                    src={(user as any)?.customProfileImageUrl || (user as any)?.profileImageUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-white/80" />
                )}
              </div>
              <div>
                <h1 className="font-semibold text-lg">
                  {(user as any)?.displayName || 
                   (user as any)?.firstName || 
                   (user as any)?.email?.split('@')[0] || 'Welcome'}
                </h1>
                <p className="text-white/80 text-sm">Welcome back!</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 bg-white dark:bg-gray-900 overflow-hidden">
          {children}
        </main>

        {/* Bottom Navigation - Always visible */}
        <nav className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
        <div className="flex justify-around py-2">
          <button 
            onClick={() => setLocation("/")}
            className={`flex flex-col items-center py-2 px-4 ${
              isActive("/") ? "text-teal-600" : "text-gray-400 dark:text-gray-500"
            }`}
          >
            <Home className="w-4 h-4 mb-1" />
            <span className="text-xs">Home</span>
          </button>
          <button 
            onClick={() => setLocation("/insights")}
            className={`flex flex-col items-center py-2 px-4 ${
              isActive("/insights") ? "text-teal-600" : "text-gray-400 dark:text-gray-500"
            }`}
          >
            <BarChart3 className="w-4 h-4 mb-1" />
            <span className="text-xs">Insights</span>
          </button>
          <button 
            onClick={() => setLocation("/settings")}
            className={`flex flex-col items-center py-2 px-4 ${
              isActive("/settings") ? "text-teal-600" : "text-gray-400 dark:text-gray-500"
            }`}
          >
            <Settings className="w-4 h-4 mb-1" />
            <span className="text-xs">Settings</span>
          </button>
          <button 
            onClick={() => window.location.href = "/api/logout"}
            className="flex flex-col items-center py-2 px-4 text-gray-400 dark:text-gray-500"
          >
            <User className="w-4 h-4 mb-1" />
            <span className="text-xs">Logout</span>
          </button>
        </div>
        </nav>
      </div>
    </div>
  );
}