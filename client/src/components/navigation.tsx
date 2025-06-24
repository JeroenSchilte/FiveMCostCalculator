import { Button } from "@/components/ui/button";
import { ChartLine, User } from "lucide-react";

export default function Navigation() {
  return (
    <nav className="bg-[#36393F] border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <ChartLine className="text-[#7289DA] text-2xl" />
            <h1 className="text-xl font-bold text-white">FiveM Job Tracker</h1>
            <span className="text-xs bg-[#FAA61A] text-black px-2 py-1 rounded font-semibold">DEMO</span>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#7289DA] rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-white">Demo User</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
