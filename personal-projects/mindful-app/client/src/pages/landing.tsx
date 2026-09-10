import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, MessageCircle, Target, CheckCircle } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-sage-50">
      {/* Mobile-first container */}
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
        
        {/* Header */}
        <header className="bg-gradient-to-r from-teal-500 to-sage-500 px-6 py-8 text-white text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">MindfulFlow</h1>
            <p className="text-white/90 text-sm">AI-Powered Journaling & Well-being</p>
          </div>
        </header>

        {/* Main content */}
        <main className="p-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Welcome to your journey of mindful reflection
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Connect with an AI companion that understands, celebrates your wins, 
              and helps you grow through thoughtful conversation.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-8">
            <Card className="border-teal-100">
              <CardContent className="p-4 flex items-start space-x-3">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">AI Journal Chat</h3>
                  <p className="text-sm text-gray-600">
                    Have meaningful conversations with a supportive AI companion
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-coral-100">
              <CardContent className="p-4 flex items-start space-x-3">
                <div className="w-10 h-10 bg-coral-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-coral-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">Ta-Done! List</h3>
                  <p className="text-sm text-gray-600">
                    Celebrate your accomplishments, big and small
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-pink-100">
              <CardContent className="p-4 flex items-start space-x-3">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">Gratitude Practice</h3>
                  <p className="text-sm text-gray-600">
                    Count your blessings and appreciate life's moments
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-100">
              <CardContent className="p-4 flex items-start space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">Goal Tracking</h3>
                  <p className="text-sm text-gray-600">
                    Set intentions and track your personal growth journey
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button 
              onClick={() => window.location.href = "/api/login"}
              className="w-full bg-gradient-to-r from-teal-500 to-sage-500 hover:from-teal-600 hover:to-sage-600 text-white py-3 rounded-xl text-base font-medium"
            >
              Start Your Journey
            </Button>
            <p className="text-xs text-gray-500 mt-3">
              Sign in to begin your mindful journaling experience
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
