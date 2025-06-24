import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, PieChart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getJobProfitability } from "@/lib/localStorage";

export default function Charts() {
  const barChartRef = useRef<HTMLCanvasElement>(null);
  const pieChartRef = useRef<HTMLCanvasElement>(null);
  const barChartInstance = useRef<any>(null);
  const pieChartInstance = useRef<any>(null);
  const [profitability, setProfitability] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfitability = () => {
      const data = getJobProfitability();
      setProfitability(data);
      setIsLoading(false);
    };

    loadProfitability();
    
    // Listen for job session changes to update charts
    const handleDataChange = () => loadProfitability();
    window.addEventListener('jobSessionCreated', handleDataChange);
    
    return () => window.removeEventListener('jobSessionCreated', handleDataChange);
  }, []);

  useEffect(() => {
    if (!profitability || isLoading) return;

    const loadCharts = async () => {
      // Dynamically import Chart.js to avoid SSR issues
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);

      // Destroy existing charts
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
      }
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy();
      }

      const jobColors = [
        '#FAA61A',
        '#43B581', 
        '#7289DA',
        '#99AAB5',
        '#F04747',
        '#9C59B6',
        '#E67E22',
        '#2ECC71'
      ];

      // Bar Chart
      if (barChartRef.current) {
        const barCtx = barChartRef.current.getContext('2d');
        if (barCtx) {
          barChartInstance.current = new Chart(barCtx, {
            type: 'bar',
            data: {
              labels: profitability.slice(0, 8).map((job: any) => job.jobType.name),
              datasets: [{
                label: '$/Hour',
                data: profitability.slice(0, 8).map((job: any) => job.averageHourlyRate),
                backgroundColor: jobColors,
                borderWidth: 0
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: '#36393F'
                  },
                  ticks: {
                    color: '#99AAB5'
                  }
                },
                x: {
                  grid: {
                    color: '#36393F'
                  },
                  ticks: {
                    color: '#99AAB5',
                    maxRotation: 45
                  }
                }
              }
            }
          });
        }
      }

      // Pie Chart
      if (pieChartRef.current) {
        const pieCtx = pieChartRef.current.getContext('2d');
        if (pieCtx) {
          pieChartInstance.current = new Chart(pieCtx, {
            type: 'doughnut',
            data: {
              labels: profitability.slice(0, 8).map((job: any) => job.jobType.name),
              datasets: [{
                data: profitability.slice(0, 8).map((job: any) => job.totalHours),
                backgroundColor: jobColors,
                borderWidth: 0
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom' as const,
                  labels: {
                    color: '#99AAB5',
                    padding: 20,
                    usePointStyle: true
                  }
                }
              }
            }
          });
        }
      }
    };

    loadCharts();

    return () => {
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
      }
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy();
      }
    };
  }, [profitability, isLoading]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#36393F] border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center text-white">
              <BarChart3 className="text-[#7289DA] mr-2" />
              Hourly Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="text-[#99AAB5]">Loading chart...</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#36393F] border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center text-white">
              <PieChart className="text-[#43B581] mr-2" />
              Time Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="text-[#99AAB5]">Loading chart...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-[#36393F] border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center text-white">
            <BarChart3 className="text-[#7289DA] mr-2" />
            Hourly Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <canvas ref={barChartRef}></canvas>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#36393F] border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center text-white">
            <PieChart className="text-[#43B581] mr-2" />
            Time Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <canvas ref={pieChartRef}></canvas>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
