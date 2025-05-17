/*
  # Initial Schema Setup
  
  1. New Tables
    - clients (user's clients)
    - invoices (invoice records)
    - invoice_items (line items for invoices)
    - payment_info (user's payment details)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
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

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Users can manage their own clients'
  ) THEN
    CREATE POLICY "Users can manage their own clients"
      ON clients
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

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

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'invoices' AND policyname = 'Users can manage their own invoices'
  ) THEN
    CREATE POLICY "Users can manage their own invoices"
      ON invoices
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

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

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'invoice_items' AND policyname = 'Users can manage invoice items through their invoices'
  ) THEN
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
  END IF;
END $$;

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

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payment_info' AND policyname = 'Users can manage their own payment info'
  ) THEN
    CREATE POLICY "Users can manage their own payment info"
      ON payment_info
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;