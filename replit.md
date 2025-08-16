# Buy Me a Coffee - Web3 Donation Platform

## Overview

This is a full-stack web application built for cryptocurrency donations using USDC on the Base blockchain. The application integrates with the Herd API to create a "coffee donation" trail that enables users to send USDC donations to support data work. The platform features a modern React frontend with TypeScript, a Node.js/Express backend, and PostgreSQL database with Drizzle ORM.

## System Architecture

The application follows a full-stack architecture with clear separation between frontend, backend, and database layers:

- **Frontend**: React 18 with TypeScript, using Vite as the build tool
- **Backend**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Blockchain Integration**: Wagmi for Web3 wallet connections and Viem for Ethereum interactions
- **UI Framework**: Tailwind CSS with shadcn/ui components for consistent design
- **State Management**: TanStack Query for server state management

## Key Components

### Frontend Architecture
- **Component Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom coffee-themed color palette
- **Routing**: Wouter for lightweight client-side routing
- **Web3 Integration**: Wagmi v2 for wallet connection and blockchain interactions
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: TanStack Query for API state management

### Backend Architecture
- **Server Framework**: Express.js with TypeScript
- **Database Layer**: Drizzle ORM with PostgreSQL adapter
- **Session Management**: Express sessions with PostgreSQL session store
- **API Structure**: RESTful API with `/api` prefix
- **Error Handling**: Centralized error handling middleware

### Database Schema
- **Users Table**: Stores user authentication data with username/password
- **Schema Validation**: Zod schemas for type-safe data validation
- **Migrations**: Drizzle-kit for database schema migrations

### External Integrations
- **Herd API**: Trail-based blockchain transaction orchestration
- **Neon Database**: Serverless PostgreSQL hosting
- **Base Network**: Ethereum Layer 2 for USDC transactions
- **WalletConnect**: Multi-wallet connection support

## Data Flow

1. **User Authentication**: Users can register/login through the backend API
2. **Wallet Connection**: Frontend connects to Web3 wallets via Wagmi
3. **Donation Process**: 
   - User selects donation amount and adds message
   - Frontend calls Herd API to evaluate inputs and generate transaction calldata
   - User confirms transaction through their wallet
   - Transaction hash is recorded in Herd execution system
4. **History Tracking**: Donation history is retrieved from Herd API and displayed
5. **Real-time Updates**: TanStack Query manages cache invalidation and updates

## External Dependencies

### Core Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form
- **Web3 Stack**: Wagmi, Viem, WalletConnect
- **Database**: Drizzle ORM, Neon Database serverless driver
- **UI Framework**: Radix UI primitives, Tailwind CSS, Lucide icons
- **Build Tools**: Vite, TypeScript, ESBuild
- **API Client**: TanStack Query for data fetching

### Development Dependencies
- **TypeScript**: Full type safety across the stack
- **Drizzle Kit**: Database migration and introspection tools
- **PostCSS**: CSS processing with Tailwind CSS
- **TSX**: TypeScript execution for development

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with TypeScript execution via TSX
- **Database**: PostgreSQL 16 with automatic provisioning
- **Port Configuration**: Application runs on port 5000
- **Hot Reload**: Vite dev server with HMR support

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations applied via `npm run db:push`
- **Deployment**: Replit autoscale deployment with health checks

### Environment Configuration
- **Database URL**: Required environment variable for PostgreSQL connection
- **WalletConnect**: Project ID configuration for wallet connections
- **Replit Integration**: Runtime error overlay and development tools

## Changelog

- January 16, 2025. Fixed wallet connection state detection and decimal multiplication bug
  - Implemented proper Wagmi status checking using `status === 'connected'` instead of deprecated `isConnected`
  - Fixed decimal multiplication bug in donation submission by moving conversion to form level
  - Updated balance node ID to correct value: "01989ee5-c66c-7eb5-9728-faaa6ec696c9"
  - Enhanced wallet state logging for debugging connection issues
  - Fixed duplicate Wagmi providers causing connection conflicts
  - Identified WalletConnect Project ID requirement for proper wallet connections in Replit
- July 4, 2025. Updated donation platform to use new Herd API structure with real donation amounts
  - Implemented read API calls to fetch actual USDC donation amounts from blockchain
  - Updated both Community Donations and Your Donations sections to display real amounts
  - Replaced checkmark icons with colorful User icons for users without Farcaster profiles
  - Added randomized background colors for avatar icons
  - Fixed total donation amount in header to use actual amounts instead of placeholder data
- June 24, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.