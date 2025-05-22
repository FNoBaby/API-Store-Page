-- Add stock column to products table
ALTER TABLE products ADD COLUMN stock INT NOT NULL DEFAULT 0;
