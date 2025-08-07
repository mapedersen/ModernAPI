-- Initial database setup script for ModernAPI
-- This script runs when the PostgreSQL container starts for the first time

-- Create any additional databases if needed
-- The main database is already created via POSTGRES_DB environment variable

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'ModernAPI PostgreSQL database initialized successfully';
END $$;