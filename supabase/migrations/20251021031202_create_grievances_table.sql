/*
  # Create grievances table

  1. New Tables
    - `grievances`
      - `id` (uuid, primary key) - Auto-generated unique identifier
      - `submitted_language` (text) - Language selected when submitting (e.g., 'English', 'Afrikaans')
      - `submitter_name` (text, nullable) - Optional name of person submitting
      - `submitter_contact` (text, nullable) - Optional contact information
      - `location_text` (text, nullable) - Location description or GPS coordinates
      - `latitude` (numeric, nullable) - GPS latitude if captured
      - `longitude` (numeric, nullable) - GPS longitude if captured
      - `location_method` (text, nullable) - How location was provided: 'browser_auto', 'manual', or null
      - `content` (text, required) - The grievance description
      - `category` (text) - Category of grievance
      - `urgency` (text) - Urgency level: 'high', 'medium', or 'low'
      - `status` (text) - Current status: 'new', 'in_progress', 'resolved', etc.
      - `created_at` (timestamptz) - Timestamp when grievance was submitted
      - `updated_at` (timestamptz) - Timestamp when record was last updated

  2. Security
    - Enable RLS on `grievances` table
    - Add policy to allow anyone to insert grievances (anonymous submissions)
    - Add policy to allow authenticated users to view all grievances
*/

CREATE TABLE IF NOT EXISTS grievances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_language text NOT NULL DEFAULT 'English',
  submitter_name text,
  submitter_contact text,
  location_text text,
  latitude numeric,
  longitude numeric,
  location_method text,
  content text NOT NULL,
  category text DEFAULT 'other',
  urgency text NOT NULL DEFAULT 'low',
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous submissions"
  ON grievances
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public to read grievances"
  ON grievances
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated users to read grievances"
  ON grievances
  FOR SELECT
  TO authenticated
  USING (true);