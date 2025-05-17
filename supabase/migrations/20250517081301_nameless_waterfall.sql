/*
  # Initial Schema Setup

  1. Tables Created:
    - clients
      - id (uuid, primary key)
      - name (text)
      - address (text)
      - gstin (text, optional)
      - created_at (timestamp)
      - user_id (uuid, references auth.users)
    
    - invoices
      - id (uuid, primary key)
      - invoice_number (text)
      - date (date)
      - due_date (date)
      - client_id (uuid, references clients)
      - status (text, check constraint)
      - payment_type (text, check constraint)
      - discount_type (text, check constraint)
      - discount_value (numeric)
      - tax_mode (text, check constraint)
      - tax_rate (numeric)
      - remark (text)
      - subtotal (numeric)
      - tax_amount (numeric)
      - discount_amount (numeric)
      - total (numeric)
      - created_at (timestamp)
      - user_id (uuid, references auth.users)
    
    - invoice_items
      - id (uuid, primary key)
      - invoice_id (uuid, references invoices)
      - description (text)
      - quantity (numeric)
      - unit_price (numeric)
      - created_at (timestamp)
    
    - payment_info
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - account_name (text)
      - account_number (text)
      - ifsc (text)
      - created_at (timestamp)

  2. Security:
    - RLS enabled on all tables
    - Policies created for authenticated users
    - Foreign key constraints for data integrity
*/

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  gstin text,
  created_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id)
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own clients"
  ON clients
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text NOT NULL,
  date date NOT NULL,
  due_date date NOT NULL,
  client_id uuid NOT NULL REFERENCES clients(id),
  status text NOT NULL CHECK (status IN ('Paid', 'Unpaid')),
  payment_type text NOT NULL CHECK (payment_type IN ('Advance', 'Full Payment')),
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL DEFAULT 0,
  tax_mode text NOT NULL CHECK (tax_mode IN ('IGST', 'CGST-SGST', 'No GST')),
  tax_rate numeric NOT NULL DEFAULT 0,
  remark text,
  subtotal numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  discount_amount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id)
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own invoices"
  ON invoices
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage invoice items through their invoices"
  ON invoice_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

-- Create payment_info table
CREATE TABLE IF NOT EXISTS payment_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  account_name text NOT NULL,
  account_number text NOT NULL,
  ifsc text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE payment_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own payment info"
  ON payment_info
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);