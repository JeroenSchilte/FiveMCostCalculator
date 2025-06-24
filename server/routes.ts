import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertJobTypeSchema, insertJobSessionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Initialize default job types
  await initializeDefaultJobTypes();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Job types routes
  app.get('/api/job-types', isAuthenticated, async (req, res) => {
    try {
      const jobTypes = await storage.getAllJobTypes();
      res.json(jobTypes);
    } catch (error) {
      console.error("Error fetching job types:", error);
      res.status(500).json({ message: "Failed to fetch job types" });
    }
  });

  app.post('/api/job-types', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertJobTypeSchema.parse(req.body);
      
      // Check if job type already exists
      const existing = await storage.getJobTypeByName(validatedData.name);
      if (existing) {
        return res.status(409).json({ message: "Job type already exists" });
      }

      const jobType = await storage.createJobType(validatedData);
      res.json(jobType);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating job type:", error);
      res.status(500).json({ message: "Failed to create job type" });
    }
  });

  // Job sessions routes
  app.post('/api/job-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertJobSessionSchema.parse(req.body);
      
      const session = await storage.createJobSession({
        ...validatedData,
        userId,
      });
      
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating job session:", error);
      res.status(500).json({ message: "Failed to create job session" });
    }
  });

  app.get('/api/job-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const [sessions, totalCount] = await Promise.all([
        storage.getJobSessions(userId, limit, offset),
        storage.getJobSessionsCount(userId),
      ]);

      res.json({
        sessions,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching job sessions:", error);
      res.status(500).json({ message: "Failed to fetch job sessions" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/profitability', isAuthenticated, async (req, res) => {
    try {
      const profitability = await storage.getJobProfitability();
      res.json(profitability);
    } catch (error) {
      console.error("Error fetching profitability data:", error);
      res.status(500).json({ message: "Failed to fetch profitability data" });
    }
  });

  app.get('/api/analytics/user-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Export route
  app.get('/api/export/csv', isAuthenticated, async (req, res) => {
    try {
      const sessions = await storage.getAllJobSessionsForExport();
      
      // Generate CSV content
      const csvHeader = "Date,Job Type,User,Duration (min),Earnings,Expenses,Net Profit,Hourly Rate\n";
      const csvRows = sessions.map(session => {
        const netProfit = parseFloat(session.earnings) - parseFloat(session.expenses);
        const hourlyRate = (session.durationMinutes > 0) ? 
          Math.round((netProfit / (session.durationMinutes / 60)) * 100) / 100 : 0;
        
        const userName = [session.user.firstName, session.user.lastName]
          .filter(Boolean)
          .join(' ') || 'Unknown User';
        
        return [
          session.createdAt?.toISOString().split('T')[0] || '',
          `"${session.jobType.name}"`,
          `"${userName}"`,
          session.durationMinutes,
          session.earnings,
          session.expenses,
          netProfit,
          hourlyRate
        ].join(',');
      }).join('\n');

      const csvContent = csvHeader + csvRows;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="fivem-job-sessions.csv"');
      res.send(csvContent);
    } catch (error) {
      console.error("Error generating CSV export:", error);
      res.status(500).json({ message: "Failed to generate CSV export" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function initializeDefaultJobTypes() {
  const defaultJobs = [
    "Breaking Rocks",
    "Growing Weed", 
    "Cocaine Making",
    "Trucking",
    "Boosting"
  ];

  for (const jobName of defaultJobs) {
    try {
      const existing = await storage.getJobTypeByName(jobName);
      if (!existing) {
        await storage.createJobType({ name: jobName });
      }
    } catch (error) {
      console.warn(`Failed to initialize job type ${jobName}:`, error);
    }
  }
}
