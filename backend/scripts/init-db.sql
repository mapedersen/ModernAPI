-- ModernAPI Database Initialization Script
-- This script runs when the PostgreSQL container starts for the first time

-- Create additional databases if needed
-- CREATE DATABASE modernapi_test;

-- Create additional users if needed
-- CREATE USER modernapi_readonly WITH ENCRYPTED PASSWORD 'readonly_password';
-- GRANT CONNECT ON DATABASE modernapi TO modernapi_readonly;
-- GRANT USAGE ON SCHEMA public TO modernapi_readonly;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO modernapi_readonly;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO modernapi_readonly;

-- Set default privileges
ALTER DATABASE modernapi SET timezone TO 'UTC';

-- Create extensions if needed
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Log initialization
SELECT 'ModernAPI database initialization completed' AS status;