import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartLine, Clock, DollarSign, Trophy, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#2C2F33] text-white">
      {/* Navigation */}
      <nav className="bg-[#36393F] border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <ChartLine className="text-[#7289DA] text-2xl" />
              <h1 className="text-xl font-bold text-white">FiveM Job Tracker</h1>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-[#7289DA] hover:bg-blue-600 text-white"
            >
              Login
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Track Your <span className="text-[#7289DA]">FiveM Job</span> Profitability
          </h1>
          <p className="text-xl text-[#99AAB5] mb-8 max-w-3xl mx-auto">
            Community-driven job profitability tracker with minute-based tracking, 
            CSV export, and comprehensive dashboards showing which jobs are most profitable.
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            size="lg"
            className="bg-[#7289DA] hover:bg-blue-600 text-white px-8 py-3 text-lg"
          >
            Get Started
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <Card className="bg-[#36393F] border-gray-700">
            <CardHeader>
              <DollarSign className="w-8 h-8 text-[#43B581] mb-2" />
              <CardTitle className="text-white">Track Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#99AAB5]">
                Log your job sessions with earnings, expenses, and duration for accurate profit tracking.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#36393F] border-gray-700">
            <CardHeader>
              <Clock className="w-8 h-8 text-[#FAA61A] mb-2" />
              <CardTitle className="text-white">Minute Precision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#99AAB5]">
                Track time down to the minute for the most accurate hourly rate calculations.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#36393F] border-gray-700">
            <CardHeader>
              <Users className="w-8 h-8 text-[#7289DA] mb-2" />
              <CardTitle className="text-white">Community Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#99AAB5]">
                See community-wide averages and rankings to find the most profitable jobs.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#36393F] border-gray-700">
            <CardHeader>
              <Trophy className="w-8 h-8 text-[#43B581] mb-2" />
              <CardTitle className="text-white">Export Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#99AAB5]">
                Export all your session data to CSV for external analysis and record keeping.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-[#36393F] rounded-lg border border-gray-700 p-8 mt-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Optimize Your Grinding?</h2>
          <p className="text-[#99AAB5] mb-6">
            Join the community and start tracking your job profitability today.
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            size="lg"
            className="bg-[#43B581] hover:bg-green-600 text-white px-8 py-3 text-lg"
          >
            Start Tracking Now
          </Button>
        </div>
      </div>
    </div>
  );
}
