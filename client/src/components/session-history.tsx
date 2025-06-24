import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { History, ChevronLeft, ChevronRight } from "lucide-react";
import { getJobSessionsWithDetails, getJobTypes } from "@/lib/localStorage";

export default function SessionHistory() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJobType, setSelectedJobType] = useState("all");
  const [sessions, setSessions] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [jobTypes, setJobTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const limit = 10;

  useEffect(() => {
    const loadData = () => {
      const sessionsData = getJobSessionsWithDetails(limit, (currentPage - 1) * limit);
      const jobTypesData = getJobTypes();
      
      setSessions(sessionsData.sessions);
      setPagination(sessionsData.pagination);
      setJobTypes(jobTypesData);
      setIsLoading(false);
    };

    loadData();
    
    // Listen for job session changes to update history
    const handleDataChange = () => loadData();
    window.addEventListener('jobSessionCreated', handleDataChange);
    
    return () => window.removeEventListener('jobSessionCreated', handleDataChange);
  }, [currentPage, limit]);

  const getJobTypeColor = (jobName: string) => {
    const colorMap: { [key: string]: string } = {
      "Cocaine Making": "bg-[#7289DA] bg-opacity-20 text-[#7289DA]",
      "Boosting": "bg-[#43B581] bg-opacity-20 text-[#43B581]",
      "Growing Weed": "bg-green-500 bg-opacity-20 text-green-400",
      "Trucking": "bg-blue-500 bg-opacity-20 text-blue-400",
      "Breaking Rocks": "bg-orange-500 bg-opacity-20 text-orange-400",
    };
    return colorMap[jobName] || "bg-gray-500 bg-opacity-20 text-gray-400";
  };

  const calculateHourlyRate = (earnings: string, expenses: string, durationMinutes: number) => {
    const netProfit = parseFloat(earnings) - parseFloat(expenses);
    const hours = durationMinutes / 60;
    return hours > 0 ? Math.round(netProfit / hours) : 0;
  };

  if (isLoading) {
    return (
      <Card className="bg-[#36393F] border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center text-white">
            <History className="text-[#7289DA] mr-2" />
            Session History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-[#2C2F33] rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#36393F] border-gray-700">
      <CardHeader className="border-b border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-xl font-bold flex items-center text-white mb-4 sm:mb-0">
            <History className="text-[#7289DA] mr-2" />
            Session History
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <Select value={selectedJobType} onValueChange={setSelectedJobType}>
              <SelectTrigger className="bg-[#2C2F33] border-gray-600 text-white">
                <SelectValue placeholder="All Jobs" />
              </SelectTrigger>
              <SelectContent className="bg-[#2C2F33] border-gray-600">
                <SelectItem value="all">All Jobs</SelectItem>
                {jobTypes?.map((jobType: any) => (
                  <SelectItem key={jobType.id} value={jobType.name}>
                    {jobType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#2C2F33]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#99AAB5] uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#99AAB5] uppercase tracking-wider">Job Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#99AAB5] uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#99AAB5] uppercase tracking-wider">Earned</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#99AAB5] uppercase tracking-wider">Expenses</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#99AAB5] uppercase tracking-wider">Net Profit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#99AAB5] uppercase tracking-wider">$/Hour</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {sessions.map((session: any) => {
                const netProfit = parseFloat(session.earnings) - parseFloat(session.expenses);
                const hourlyRate = calculateHourlyRate(session.earnings, session.expenses, session.durationMinutes);
                
                return (
                  <tr key={session.id} className="hover:bg-[#2C2F33] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getJobTypeColor(session.jobType.name)}`}>
                        {session.jobType.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {session.durationMinutes} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">
                      ${parseFloat(session.earnings).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400">
                      ${parseFloat(session.expenses).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#FAA61A]">
                      ${netProfit.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      ${hourlyRate.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {sessions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[#99AAB5]">No sessions logged yet. Start by logging your first job session!</p>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-[#99AAB5]">
                Showing {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} sessions
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="bg-[#2C2F33] border-gray-600 text-white hover:bg-gray-600"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                
                <div className="flex space-x-1">
                  {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum 
                          ? "bg-[#7289DA] text-white" 
                          : "bg-[#2C2F33] border-gray-600 text-white hover:bg-gray-600"
                        }
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="bg-[#2C2F33] border-gray-600 text-white hover:bg-gray-600"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
