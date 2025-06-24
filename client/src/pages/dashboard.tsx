import Navigation from "@/components/navigation";
import QuickStats from "@/components/quick-stats";
import JobForm from "@/components/job-form";
import ProfitabilityRankings from "@/components/profitability-rankings";
import Charts from "@/components/charts";
import SessionHistory from "@/components/session-history";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#2C2F33] text-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <QuickStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <JobForm />
          </div>
          
          <div className="lg:col-span-2 space-y-6">
            <ProfitabilityRankings />
            <Charts />
          </div>
        </div>
        
        <div className="mt-8">
          <SessionHistory />
        </div>
      </div>
    </div>
  );
}
