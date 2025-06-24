// Local storage utilities for static site
export interface JobType {
  id: number;
  name: string;
  createdAt: string;
}

export interface JobSession {
  id: number;
  jobTypeId: number;
  durationMinutes: number;
  earnings: string;
  expenses: string;
  createdAt: string;
}

export interface JobSessionWithDetails extends JobSession {
  jobType: JobType;
}

export interface JobProfitability {
  jobType: JobType;
  averageHourlyRate: number;
  totalSessions: number;
  totalHours: number;
  totalEarnings: number;
  totalExpenses: number;
  netProfit: number;
}

const STORAGE_KEYS = {
  JOB_TYPES: 'fivem_job_types',
  JOB_SESSIONS: 'fivem_job_sessions',
  NEXT_JOB_TYPE_ID: 'fivem_next_job_type_id',
  NEXT_SESSION_ID: 'fivem_next_session_id',
};

// Initialize default data
export function initializeDefaultData() {
  if (!localStorage.getItem(STORAGE_KEYS.JOB_TYPES)) {
    const defaultJobTypes: JobType[] = [
      { id: 1, name: "Breaking Rocks", createdAt: new Date().toISOString() },
      { id: 2, name: "Growing Weed", createdAt: new Date().toISOString() },
      { id: 3, name: "Cocaine Making", createdAt: new Date().toISOString() },
      { id: 4, name: "Trucking", createdAt: new Date().toISOString() },
      { id: 5, name: "Boosting", createdAt: new Date().toISOString() },
    ];
    localStorage.setItem(STORAGE_KEYS.JOB_TYPES, JSON.stringify(defaultJobTypes));
    localStorage.setItem(STORAGE_KEYS.NEXT_JOB_TYPE_ID, '6');
  }

  if (!localStorage.getItem(STORAGE_KEYS.JOB_SESSIONS)) {
    localStorage.setItem(STORAGE_KEYS.JOB_SESSIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.NEXT_SESSION_ID, '1');
  }
}

// Job Types
export function getJobTypes(): JobType[] {
  const data = localStorage.getItem(STORAGE_KEYS.JOB_TYPES);
  return data ? JSON.parse(data) : [];
}

export function createJobType(name: string): JobType {
  const jobTypes = getJobTypes();
  const nextId = parseInt(localStorage.getItem(STORAGE_KEYS.NEXT_JOB_TYPE_ID) || '1');
  
  const newJobType: JobType = {
    id: nextId,
    name,
    createdAt: new Date().toISOString(),
  };
  
  jobTypes.push(newJobType);
  localStorage.setItem(STORAGE_KEYS.JOB_TYPES, JSON.stringify(jobTypes));
  localStorage.setItem(STORAGE_KEYS.NEXT_JOB_TYPE_ID, (nextId + 1).toString());
  
  return newJobType;
}

export function getJobTypeByName(name: string): JobType | undefined {
  const jobTypes = getJobTypes();
  return jobTypes.find(jt => jt.name === name);
}

// Job Sessions
export function getJobSessions(): JobSession[] {
  const data = localStorage.getItem(STORAGE_KEYS.JOB_SESSIONS);
  return data ? JSON.parse(data) : [];
}

export function createJobSession(session: Omit<JobSession, 'id' | 'createdAt'>): JobSession {
  const sessions = getJobSessions();
  const nextId = parseInt(localStorage.getItem(STORAGE_KEYS.NEXT_SESSION_ID) || '1');
  
  const newSession: JobSession = {
    ...session,
    id: nextId,
    createdAt: new Date().toISOString(),
  };
  
  sessions.push(newSession);
  localStorage.setItem(STORAGE_KEYS.JOB_SESSIONS, JSON.stringify(sessions));
  localStorage.setItem(STORAGE_KEYS.NEXT_SESSION_ID, (nextId + 1).toString());
  
  return newSession;
}

export function getJobSessionsWithDetails(limit = 50, offset = 0): {
  sessions: JobSessionWithDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} {
  const sessions = getJobSessions();
  const jobTypes = getJobTypes();
  
  const sessionsWithDetails: JobSessionWithDetails[] = sessions
    .map(session => {
      const jobType = jobTypes.find(jt => jt.id === session.jobTypeId);
      return jobType ? { ...session, jobType } : null;
    })
    .filter(Boolean) as JobSessionWithDetails[];
  
  // Sort by creation date (newest first)
  sessionsWithDetails.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const total = sessionsWithDetails.length;
  const paginatedSessions = sessionsWithDetails.slice(offset, offset + limit);
  const page = Math.floor(offset / limit) + 1;
  
  return {
    sessions: paginatedSessions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Analytics
export function getJobProfitability(): JobProfitability[] {
  const sessions = getJobSessions();
  const jobTypes = getJobTypes();
  
  const profitabilityMap = new Map<number, {
    jobType: JobType;
    totalSessions: number;
    totalMinutes: number;
    totalEarnings: number;
    totalExpenses: number;
  }>();
  
  sessions.forEach(session => {
    const jobType = jobTypes.find(jt => jt.id === session.jobTypeId);
    if (!jobType) return;
    
    const existing = profitabilityMap.get(session.jobTypeId) || {
      jobType,
      totalSessions: 0,
      totalMinutes: 0,
      totalEarnings: 0,
      totalExpenses: 0,
    };
    
    existing.totalSessions++;
    existing.totalMinutes += session.durationMinutes;
    existing.totalEarnings += parseFloat(session.earnings);
    existing.totalExpenses += parseFloat(session.expenses);
    
    profitabilityMap.set(session.jobTypeId, existing);
  });
  
  const profitability: JobProfitability[] = Array.from(profitabilityMap.values()).map(data => {
    const totalHours = data.totalMinutes / 60;
    const netProfit = data.totalEarnings - data.totalExpenses;
    const averageHourlyRate = totalHours > 0 ? netProfit / totalHours : 0;
    
    return {
      jobType: data.jobType,
      averageHourlyRate: Math.round(averageHourlyRate),
      totalSessions: data.totalSessions,
      totalHours: Math.round(totalHours * 10) / 10,
      totalEarnings: data.totalEarnings,
      totalExpenses: data.totalExpenses,
      netProfit,
    };
  });
  
  return profitability.sort((a, b) => b.averageHourlyRate - a.averageHourlyRate);
}

export function getUserStats(): {
  totalEarned: number;
  totalHours: number;
  bestHourlyRate: number;
  jobsCompleted: number;
} {
  const sessions = getJobSessions();
  
  let totalEarned = 0;
  let totalMinutes = 0;
  let bestHourlyRate = 0;
  
  sessions.forEach(session => {
    const earnings = parseFloat(session.earnings);
    const expenses = parseFloat(session.expenses);
    const netProfit = earnings - expenses;
    const hours = session.durationMinutes / 60;
    const hourlyRate = hours > 0 ? netProfit / hours : 0;
    
    totalEarned += earnings;
    totalMinutes += session.durationMinutes;
    
    if (hourlyRate > bestHourlyRate) {
      bestHourlyRate = hourlyRate;
    }
  });
  
  return {
    totalEarned,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    bestHourlyRate: Math.round(bestHourlyRate),
    jobsCompleted: sessions.length,
  };
}

export function exportToCSV(): string {
  const sessions = getJobSessions();
  const jobTypes = getJobTypes();
  
  const csvHeader = "Date,Job Type,Duration (min),Earnings,Expenses,Net Profit,Hourly Rate\n";
  const csvRows = sessions.map(session => {
    const jobType = jobTypes.find(jt => jt.id === session.jobTypeId);
    const netProfit = parseFloat(session.earnings) - parseFloat(session.expenses);
    const hourlyRate = (session.durationMinutes > 0) ? 
      Math.round((netProfit / (session.durationMinutes / 60)) * 100) / 100 : 0;
    
    return [
      new Date(session.createdAt).toISOString().split('T')[0],
      `"${jobType?.name || 'Unknown'}"`,
      session.durationMinutes,
      session.earnings,
      session.expenses,
      netProfit,
      hourlyRate
    ].join(',');
  }).join('\n');

  return csvHeader + csvRows;
}