/*
  # Add criteria column to reviews table

  1. Changes
    - Add criteria JSONB column to reviews table to store detailed review criteria
    - Update existing reviews to have empty criteria object
    - Add index for better performance

  2. Security
    - Maintain existing RLS policies
*/

-- Add criteria column to reviews table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'criteria'
  ) THEN
    ALTER TABLE reviews ADD COLUMN criteria jsonb DEFAULT '{}';
  END IF;
END $$;

-- Update existing reviews to have empty criteria object if null
UPDATE reviews SET criteria = '{}' WHERE criteria IS NULL;

-- Add index for criteria queries
CREATE INDEX IF NOT EXISTS idx_reviews_criteria ON reviews USING gin(criteria);

-- Add helpful comment
COMMENT ON COLUMN reviews.criteria IS 'Stores detailed review criteria like money_offered, response_time, authenticity, communication, overall_experience';