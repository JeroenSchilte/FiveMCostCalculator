import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { getJobProfitability } from "@/lib/localStorage";

export default function ProfitabilityRankings() {
  const [profitability, setProfitability] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfitability = () => {
      const data = getJobProfitability();
      setProfitability(data);
      setIsLoading(false);
    };

    loadProfitability();
    
    // Listen for job session changes to update rankings
    const handleDataChange = () => loadProfitability();
    window.addEventListener('jobSessionCreated', handleDataChange);
    
    return () => window.removeEventListener('jobSessionCreated', handleDataChange);
  }, []);

  if (isLoading) {
    return (
      <Card className="bg-[#36393F] border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center text-white">
            <Trophy className="text-[#FAA61A] mr-2" />
            Job Profitability Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 bg-[#2C2F33] rounded-lg border border-gray-600">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-600 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-600 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-5 bg-gray-600 rounded w-20 mb-1"></div>
                    <div className="h-3 bg-gray-600 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return "bg-[#FAA61A]";
      case 2: return "bg-gray-400";
      case 3: return "bg-yellow-600";
      default: return "bg-gray-500";
    }
  };

  const getJobColor = (rank: number) => {
    const colors = [
      "text-[#FAA61A]",
      "text-[#43B581]",
      "text-green-400",
      "text-blue-400",
      "text-orange-400",
    ];
    return colors[rank - 1] || "text-gray-400";
  };

  return (
    <Card className="bg-[#36393F] border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center text-white">
          <Trophy className="text-[#FAA61A] mr-2" />
          Job Profitability Rankings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {profitability?.slice(0, 5).map((job: any, index: number) => (
            <div key={job.jobType.id} className="flex items-center justify-between p-4 bg-[#2C2F33] rounded-lg border border-gray-600">
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 ${getRankColor(index + 1)} rounded-full flex items-center justify-center text-sm font-bold text-white`}>
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{job.jobType.name}</h3>
                  <p className="text-sm text-[#99AAB5]">Community Average</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${getJobColor(index + 1)}`}>
                  ${job.averageHourlyRate.toLocaleString()}/hr
                </p>
                <p className="text-sm text-[#99AAB5]">{job.totalSessions} sessions</p>
              </div>
            </div>
          ))}
          
          {!profitability?.length && (
            <div className="text-center py-8">
              <p className="text-[#99AAB5]">No job data available yet. Start logging sessions to see rankings!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
