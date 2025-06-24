import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Clock, Trophy, Briefcase } from "lucide-react";
import { getUserStats } from "@/lib/localStorage";

export default function QuickStats() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = () => {
      const userStats = getUserStats();
      setStats(userStats);
      setIsLoading(false);
    };

    loadStats();
    // Listen for job session changes to update stats
    const handleDataChange = () => loadStats();
    window.addEventListener('jobSessionCreated', handleDataChange);
    
    return () => window.removeEventListener('jobSessionCreated', handleDataChange);
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-[#36393F] border-gray-700">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-600 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      label: "Total Earned",
      value: `$${stats?.totalEarned.toLocaleString() || 0}`,
      icon: DollarSign,
      color: "text-[#7289DA]",
      bgColor: "bg-[#7289DA] bg-opacity-20",
    },
    {
      label: "Hours Played",
      value: `${stats?.totalHours || 0}h`,
      icon: Clock,
      color: "text-[#43B581]",
      bgColor: "bg-[#43B581] bg-opacity-20",
    },
    {
      label: "Best $/Hour",
      value: `$${stats?.bestHourlyRate.toLocaleString() || 0}`,
      icon: Trophy,
      color: "text-[#FAA61A]",
      bgColor: "bg-[#FAA61A] bg-opacity-20",
    },
    {
      label: "Jobs Completed",
      value: stats?.jobsCompleted || 0,
      icon: Briefcase,
      color: "text-green-400",
      bgColor: "bg-green-500 bg-opacity-20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <Card key={index} className="bg-[#36393F] border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`${stat.color} text-xl w-6 h-6`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[#99AAB5]">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
