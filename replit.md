# FiveM Job Tracker - System Architecture

## Overview

This is a full-stack web application for tracking FiveM job profitability. The system allows users to log job sessions with duration, earnings, and expenses, then provides analytics and rankings to help identify the most profitable jobs. Built with a React frontend, Express.js backend, PostgreSQL database using Drizzle ORM, and Replit authentication.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with custom Discord-inspired dark theme
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful endpoints with proper error handling

### Database Schema
The application uses PostgreSQL with the following key tables:
- **sessions**: Session storage for Replit Auth (mandatory)
- **users**: User profiles with Replit integration (mandatory)
- **job_types**: Configurable job categories (e.g., "Cocaine Making", "Boosting")
- **job_sessions**: Individual work sessions with duration, earnings, expenses

## Key Components

### Authentication System
- Replit Auth integration with OpenID Connect
- Session-based authentication using PostgreSQL storage
- Automatic user profile management
- Protected routes with middleware validation

### Job Management
- Dynamic job type creation and management
- Session tracking with minute-precision duration
- Earnings and expenses tracking
- Real-time profit calculations

### Analytics Engine
- Job profitability rankings based on hourly rates
- User statistics including total earnings and best rates
- Community-wide job performance comparisons
- Visual charts using Chart.js

### Data Export
- CSV export functionality for all job sessions
- Comprehensive data including user info and job details
- Configurable data extraction for analysis

## Data Flow

1. **User Authentication**: Users authenticate via Replit Auth, creating/updating user profiles
2. **Job Session Creation**: Users select job types and log work sessions with duration/earnings
3. **Real-time Analytics**: System calculates hourly rates and updates rankings
4. **Data Visualization**: Frontend displays charts, stats, and session history
5. **Export Processing**: Users can export complete datasets as CSV files

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives
- **chart.js**: Data visualization
- **react-hook-form**: Form management
- **zod**: Schema validation

### Authentication
- **passport**: Authentication middleware
- **openid-client**: OpenID Connect implementation
- **connect-pg-simple**: PostgreSQL session storage

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling
- **tailwindcss**: Utility-first CSS framework
- **vite**: Development server and build tool

## Deployment Strategy

### Development Environment
- Replit-optimized with hot reload
- Vite development server with middleware mode
- PostgreSQL database provisioning
- Environment variable management

### Production Build
- Vite builds optimized client bundle to `dist/public`
- esbuild bundles server code to `dist/index.js`
- Static file serving for production assets
- Port 5000 with external port 80 mapping

### Environment Requirements
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `REPL_ID`: Replit environment identifier
- `ISSUER_URL`: OpenID Connect issuer (defaults to Replit)

## Changelog
- June 24, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.