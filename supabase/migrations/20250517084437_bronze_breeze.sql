/*
  # Add payment information to invoices

  1. Changes
    - Add payment information columns to invoices table:
      - payment_info_account_name
      - payment_info_account_number
      - payment_info_ifsc
    
  2. Purpose
    - Store payment information with each invoice to preserve historical payment details
    - Ensure old invoices maintain their original payment information
*/

-- Add payment information columns to invoices table
ALTER TABLE invoices 
ADD COLUMN payment_info_account_name text,
ADD COLUMN payment_info_account_number text,
ADD COLUMN payment_info_ifsc text;