-- Add approved_stock column to requests table
ALTER TABLE requests ADD COLUMN IF NOT EXISTS approved_stock INTEGER DEFAULT NULL;

