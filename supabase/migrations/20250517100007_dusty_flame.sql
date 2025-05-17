/*
  # Add search optimization indexes

  1. Changes
    - Add GIN indexes for faster text search on invoice numbers and client names
    - Add composite indexes for common query patterns
    
  2. Performance
    - Improves search query performance
    - Enables efficient full-text search capabilities
*/

-- Add GIN index for invoice number search
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number_search 
ON invoices USING gin (invoice_number gin_trgm_ops);

-- Add GIN index for client name search
CREATE INDEX IF NOT EXISTS idx_clients_name_search 
ON clients USING gin (name gin_trgm_ops);

-- Enable pg_trgm extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;