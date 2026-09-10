-- database/reset-development.sql
-- DEVELOPMENT ONLY — destroys all data. Never run on a client database.
-- Drops and recreates the full schema. Then run with: psql $DATABASE_URL -f server/schema.sql
-- Or keep using server/schema.sql directly for dev.

\i database/fresh-install.sql
-- DROP version lives in server/schema.sql when needed for local reset.
