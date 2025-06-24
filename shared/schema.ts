import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const jobTypes = pgTable("job_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobSessions = pgTable("job_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  jobTypeId: integer("job_type_id").notNull().references(() => jobTypes.id),
  durationMinutes: integer("duration_minutes").notNull(),
  earnings: decimal("earnings", { precision: 10, scale: 2 }).notNull(),
  expenses: decimal("expenses", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  jobSessions: many(jobSessions),
}));

export const jobTypesRelations = relations(jobTypes, ({ many }) => ({
  jobSessions: many(jobSessions),
}));

export const jobSessionsRelations = relations(jobSessions, ({ one }) => ({
  user: one(users, {
    fields: [jobSessions.userId],
    references: [users.id],
  }),
  jobType: one(jobTypes, {
    fields: [jobSessions.jobTypeId],
    references: [jobTypes.id],
  }),
}));

// Schemas
export const insertJobTypeSchema = createInsertSchema(jobTypes).pick({
  name: true,
});

export const insertJobSessionSchema = createInsertSchema(jobSessions).pick({
  jobTypeId: true,
  durationMinutes: true,
  earnings: true,
  expenses: true,
}).extend({
  durationMinutes: z.number().min(1, "Duration must be at least 1 minute"),
  earnings: z.string().transform(val => parseFloat(val)).refine(val => val >= 0, "Earnings must be non-negative"),
  expenses: z.string().transform(val => parseFloat(val)).refine(val => val >= 0, "Expenses must be non-negative"),
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type JobType = typeof jobTypes.$inferSelect;
export type InsertJobType = z.infer<typeof insertJobTypeSchema>;
export type JobSession = typeof jobSessions.$inferSelect;
export type InsertJobSession = z.infer<typeof insertJobSessionSchema>;

// View types for API responses
export type JobSessionWithDetails = JobSession & {
  jobType: JobType;
  user: Pick<User, 'id' | 'firstName' | 'lastName'>;
};

export type JobProfitability = {
  jobType: JobType;
  averageHourlyRate: number;
  totalSessions: number;
  totalHours: number;
  totalEarnings: number;
  totalExpenses: number;
  netProfit: number;
};
