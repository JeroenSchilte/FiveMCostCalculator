import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { PlusCircle, Plus, Save, Download } from "lucide-react";

const sessionSchema = z.object({
  jobTypeId: z.string().min(1, "Please select a job type"),
  durationMinutes: z.string().min(1, "Duration is required").transform(val => parseInt(val)).refine(val => val > 0, "Duration must be greater than 0"),
  earnings: z.string().min(1, "Earnings is required"),
  expenses: z.string().default("0"),
});

const jobTypeSchema = z.object({
  name: z.string().min(1, "Job name is required").max(100, "Job name too long"),
});

type SessionFormData = z.infer<typeof sessionSchema>;
type JobTypeFormData = z.infer<typeof jobTypeSchema>;

export default function JobForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);

  const { data: jobTypes, isLoading: isLoadingJobTypes } = useQuery({
    queryKey: ["/api/job-types"],
  });

  const sessionForm = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      jobTypeId: "",
      durationMinutes: "",
      earnings: "",
      expenses: "0",
    },
  });

  const jobTypeForm = useForm<JobTypeFormData>({
    resolver: zodResolver(jobTypeSchema),
    defaultValues: {
      name: "",
    },
  });

  const createSession = useMutation({
    mutationFn: async (data: SessionFormData) => {
      await apiRequest("POST", "/api/job-sessions", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Job session logged successfully!",
      });
      sessionForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/job-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/user-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/profitability"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to log job session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createJobType = useMutation({
    mutationFn: async (data: JobTypeFormData) => {
      await apiRequest("POST", "/api/job-types", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "New job type added successfully!",
      });
      jobTypeForm.reset();
      setIsAddJobOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/job-types"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add job type. It may already exist.",
        variant: "destructive",
      });
    },
  });

  const handleExportCSV = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/export/csv", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to export CSV");
      }
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fivem-job-sessions.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Success",
        description: "CSV exported successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to export CSV. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSessionSubmit = (data: SessionFormData) => {
    createSession.mutate(data);
  };

  const onJobTypeSubmit = (data: JobTypeFormData) => {
    createJobType.mutate(data);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#36393F] border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center text-white">
            <PlusCircle className="text-[#7289DA] mr-2" />
            Log New Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={sessionForm.handleSubmit(onSessionSubmit)} className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-[#99AAB5] mb-2">Job Type</Label>
              <Select 
                value={sessionForm.watch("jobTypeId")} 
                onValueChange={(value) => sessionForm.setValue("jobTypeId", value)}
              >
                <SelectTrigger className="w-full bg-[#2C2F33] border-gray-600 text-white">
                  <SelectValue placeholder="Select a job..." />
                </SelectTrigger>
                <SelectContent className="bg-[#2C2F33] border-gray-600">
                  {isLoadingJobTypes ? (
                    <SelectItem value="loading">Loading...</SelectItem>
                  ) : (
                    jobTypes?.map((jobType: any) => (
                      <SelectItem key={jobType.id} value={jobType.id.toString()}>
                        {jobType.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {sessionForm.formState.errors.jobTypeId && (
                <p className="text-red-400 text-sm mt-1">{sessionForm.formState.errors.jobTypeId.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-[#99AAB5] mb-2">Duration (min)</Label>
                <Input
                  type="number"
                  placeholder="60"
                  className="bg-[#2C2F33] border-gray-600 text-white"
                  {...sessionForm.register("durationMinutes")}
                />
                {sessionForm.formState.errors.durationMinutes && (
                  <p className="text-red-400 text-sm mt-1">{sessionForm.formState.errors.durationMinutes.message}</p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-[#99AAB5] mb-2">Earned ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="1500"
                  className="bg-[#2C2F33] border-gray-600 text-white"
                  {...sessionForm.register("earnings")}
                />
                {sessionForm.formState.errors.earnings && (
                  <p className="text-red-400 text-sm mt-1">{sessionForm.formState.errors.earnings.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-[#99AAB5] mb-2">Expenses ($)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="200"
                className="bg-[#2C2F33] border-gray-600 text-white"
                {...sessionForm.register("expenses")}
              />
              {sessionForm.formState.errors.expenses && (
                <p className="text-red-400 text-sm mt-1">{sessionForm.formState.errors.expenses.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={createSession.isPending}
              className="w-full bg-[#7289DA] hover:bg-blue-600 text-white font-medium py-3"
            >
              <Save className="mr-2 w-4 h-4" />
              {createSession.isPending ? "Logging..." : "Log Session"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <Dialog open={isAddJobOpen} onOpenChange={setIsAddJobOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-[#FAA61A] hover:bg-yellow-600 text-white font-medium py-2 text-sm">
                  <Plus className="mr-2 w-4 h-4" />
                  Add New Job Type
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#36393F] border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Add New Job Type</DialogTitle>
                </DialogHeader>
                <form onSubmit={jobTypeForm.handleSubmit(onJobTypeSubmit)} className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-[#99AAB5] mb-2">Job Name</Label>
                    <Input
                      placeholder="Enter job name"
                      className="bg-[#2C2F33] border-gray-600 text-white"
                      {...jobTypeForm.register("name")}
                    />
                    {jobTypeForm.formState.errors.name && (
                      <p className="text-red-400 text-sm mt-1">{jobTypeForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    disabled={createJobType.isPending}
                    className="w-full bg-[#7289DA] hover:bg-blue-600 text-white"
                  >
                    {createJobType.isPending ? "Adding..." : "Add Job Type"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#36393F] border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center text-white">
            <Download className="text-[#43B581] mr-2" />
            Export Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => handleExportCSV.mutate()}
            disabled={handleExportCSV.isPending}
            className="w-full bg-[#43B581] hover:bg-green-600 text-white font-medium py-3"
          >
            <Download className="mr-2 w-4 h-4" />
            {handleExportCSV.isPending ? "Exporting..." : "Export to CSV"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
