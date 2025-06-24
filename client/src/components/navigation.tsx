import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ChartLine, Bell } from "lucide-react";

export default function Navigation() {
  const { user } = useAuth();

  return (
    <nav className="bg-[#36393F] border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <ChartLine className="text-[#7289DA] text-2xl" />
            <h1 className="text-xl font-bold text-white">FiveM Job Tracker</h1>
          </div>
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              className="text-[#99AAB5] hover:text-white"
            >
              <Bell className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-2">
              {user?.profileImageUrl && (
                <img 
                  src={user.profileImageUrl}
                  alt="User profile" 
                  className="w-8 h-8 rounded-full object-cover" 
                />
              )}
              <span className="text-sm font-medium">
                {user?.firstName || user?.email || 'User'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/api/logout'}
                className="text-[#99AAB5] hover:text-white ml-4"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
