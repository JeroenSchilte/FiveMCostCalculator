import {
  users,
  jobTypes,
  jobSessions,
  type User,
  type UpsertUser,
  type JobType,
  type InsertJobType,
  type JobSession,
  type InsertJobSession,
  type JobSessionWithDetails,
  type JobProfitability,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Job type operations
  getAllJobTypes(): Promise<JobType[]>;
  createJobType(jobType: InsertJobType): Promise<JobType>;
  getJobTypeByName(name: string): Promise<JobType | undefined>;
  
  // Job session operations
  createJobSession(session: InsertJobSession & { userId: string }): Promise<JobSession>;
  getJobSessions(userId?: string, limit?: number, offset?: number): Promise<JobSessionWithDetails[]>;
  getJobSessionsCount(userId?: string): Promise<number>;
  
  // Analytics operations
  getJobProfitability(): Promise<JobProfitability[]>;
  getUserStats(userId: string): Promise<{
    totalEarned: number;
    totalHours: number;
    bestHourlyRate: number;
    jobsCompleted: number;
  }>;
  
  // Export operations
  getAllJobSessionsForExport(): Promise<JobSessionWithDetails[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Job type operations
  async getAllJobTypes(): Promise<JobType[]> {
    return await db.select().from(jobTypes).orderBy(jobTypes.name);
  }

  async createJobType(jobType: InsertJobType): Promise<JobType> {
    const [newJobType] = await db
      .insert(jobTypes)
      .values(jobType)
      .returning();
    return newJobType;
  }

  async getJobTypeByName(name: string): Promise<JobType | undefined> {
    const [jobType] = await db
      .select()
      .from(jobTypes)
      .where(eq(jobTypes.name, name));
    return jobType;
  }

  // Job session operations
  async createJobSession(session: InsertJobSession & { userId: string }): Promise<JobSession> {
    const [newSession] = await db
      .insert(jobSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async getJobSessions(userId?: string, limit = 50, offset = 0): Promise<JobSessionWithDetails[]> {
    const query = db
      .select({
        id: jobSessions.id,
        userId: jobSessions.userId,
        jobTypeId: jobSessions.jobTypeId,
        durationMinutes: jobSessions.durationMinutes,
        earnings: jobSessions.earnings,
        expenses: jobSessions.expenses,
        createdAt: jobSessions.createdAt,
        jobType: {
          id: jobTypes.id,
          name: jobTypes.name,
          createdAt: jobTypes.createdAt,
        },
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(jobSessions)
      .innerJoin(jobTypes, eq(jobSessions.jobTypeId, jobTypes.id))
      .innerJoin(users, eq(jobSessions.userId, users.id))
      .orderBy(desc(jobSessions.createdAt))
      .limit(limit)
      .offset(offset);

    if (userId) {
      query.where(eq(jobSessions.userId, userId));
    }

    return await query;
  }

  async getJobSessionsCount(userId?: string): Promise<number> {
    const query = db
      .select({ count: sql<number>`count(*)` })
      .from(jobSessions);

    if (userId) {
      query.where(eq(jobSessions.userId, userId));
    }

    const [result] = await query;
    return result.count;
  }

  // Analytics operations
  async getJobProfitability(): Promise<JobProfitability[]> {
    const results = await db
      .select({
        jobType: {
          id: jobTypes.id,
          name: jobTypes.name,
          createdAt: jobTypes.createdAt,
        },
        totalSessions: sql<number>`count(${jobSessions.id})`,
        totalMinutes: sql<number>`sum(${jobSessions.durationMinutes})`,
        totalEarnings: sql<string>`sum(${jobSessions.earnings})`,
        totalExpenses: sql<string>`sum(${jobSessions.expenses})`,
      })
      .from(jobSessions)
      .innerJoin(jobTypes, eq(jobSessions.jobTypeId, jobTypes.id))
      .groupBy(jobTypes.id, jobTypes.name, jobTypes.createdAt)
      .having(sql`count(${jobSessions.id}) > 0`);

    return results.map((result) => {
      const totalHours = result.totalMinutes / 60;
      const totalEarnings = parseFloat(result.totalEarnings);
      const totalExpenses = parseFloat(result.totalExpenses);
      const netProfit = totalEarnings - totalExpenses;
      const averageHourlyRate = totalHours > 0 ? netProfit / totalHours : 0;

      return {
        jobType: result.jobType,
        averageHourlyRate: Math.round(averageHourlyRate),
        totalSessions: result.totalSessions,
        totalHours: Math.round(totalHours * 10) / 10,
        totalEarnings,
        totalExpenses,
        netProfit,
      };
    }).sort((a, b) => b.averageHourlyRate - a.averageHourlyRate);
  }

  async getUserStats(userId: string): Promise<{
    totalEarned: number;
    totalHours: number;
    bestHourlyRate: number;
    jobsCompleted: number;
  }> {
    const [stats] = await db
      .select({
        totalEarned: sql<string>`coalesce(sum(${jobSessions.earnings}), 0)`,
        totalMinutes: sql<number>`coalesce(sum(${jobSessions.durationMinutes}), 0)`,
        jobsCompleted: sql<number>`count(${jobSessions.id})`,
      })
      .from(jobSessions)
      .where(eq(jobSessions.userId, userId));

    // Calculate best hourly rate
    const sessionRates = await db
      .select({
        earnings: jobSessions.earnings,
        expenses: jobSessions.expenses,
        durationMinutes: jobSessions.durationMinutes,
      })
      .from(jobSessions)
      .where(eq(jobSessions.userId, userId));

    let bestHourlyRate = 0;
    sessionRates.forEach((session) => {
      const netProfit = parseFloat(session.earnings) - parseFloat(session.expenses);
      const hours = session.durationMinutes / 60;
      const hourlyRate = hours > 0 ? netProfit / hours : 0;
      if (hourlyRate > bestHourlyRate) {
        bestHourlyRate = hourlyRate;
      }
    });

    return {
      totalEarned: parseFloat(stats.totalEarned),
      totalHours: Math.round((stats.totalMinutes / 60) * 10) / 10,
      bestHourlyRate: Math.round(bestHourlyRate),
      jobsCompleted: stats.jobsCompleted,
    };
  }

  async getAllJobSessionsForExport(): Promise<JobSessionWithDetails[]> {
    return await db
      .select({
        id: jobSessions.id,
        userId: jobSessions.userId,
        jobTypeId: jobSessions.jobTypeId,
        durationMinutes: jobSessions.durationMinutes,
        earnings: jobSessions.earnings,
        expenses: jobSessions.expenses,
        createdAt: jobSessions.createdAt,
        jobType: {
          id: jobTypes.id,
          name: jobTypes.name,
          createdAt: jobTypes.createdAt,
        },
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(jobSessions)
      .innerJoin(jobTypes, eq(jobSessions.jobTypeId, jobTypes.id))
      .innerJoin(users, eq(jobSessions.userId, users.id))
      .orderBy(desc(jobSessions.createdAt));
  }
}

export const storage = new DatabaseStorage();
