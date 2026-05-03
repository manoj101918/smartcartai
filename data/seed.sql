CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  budget NUMERIC DEFAULT 500,
  diet_goal TEXT DEFAULT 'balanced',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  barcode TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  price NUMERIC NOT NULL,
  price_benchmark NUMERIC,
  category TEXT,
  aisle INT,
  calories INT,
  protein_g INT,
  fat_g INT,
  sugar_g INT,
  tags TEXT[],
  combo_pairs TEXT[]
);

CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  barcode TEXT REFERENCES products(barcode),
  quantity INT DEFAULT 1,
  scanned_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_item_id UUID REFERENCES cart_items(id),
  warning TEXT,
  swap_name TEXT,
  swap_price NUMERIC,
  swap_reason TEXT,
  swap_aisle INT,
  combo_offer TEXT,
  deal_alert TEXT,
  reminder TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE cart_items;
EXCEPTION
  WHEN SQLSTATE '42710' THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE ai_suggestions;
EXCEPTION
  WHEN SQLSTATE '42710' THEN NULL;
END $$;

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_suggestions DISABLE ROW LEVEL SECURITY;

INSERT INTO products (barcode, name, brand, price, price_benchmark, category, aisle, calories, protein_g, fat_g, sugar_g, tags, combo_pairs) VALUES
('1000000000001', 'Lays Classic Chips', 'Lays', 100, 72, 'Snacks', 3, 536, 7, 34, 2, ARRAY['junk', 'high-salt', 'fried'], ARRAY['Coca Cola 750ml']),
('1000000000002', 'Coca Cola 750ml', 'Coca Cola', 60, 42, 'Beverages', 7, 270, 0, 0, 65, ARRAY['high-sugar', 'junk'], ARRAY['Lays Classic Chips']),
('1000000000003', 'Britannia Bread', 'Britannia', 45, 32, 'Bakery', 4, 246, 8, 3, 5, ARRAY['carbs'], ARRAY['Sundrop Peanut Butter', 'Amul Butter']),
('1000000000004', 'Amul Full Cream Milk', 'Amul', 68, 52, 'Dairy', 2, 150, 8, 8, 12, ARRAY['dairy', 'calcium'], ARRAY['Yoga Bar Protein Oats', 'Quaker Oats', 'Tata Tea Gold']),
('1000000000005', 'Yoga Bar Protein Oats', 'Yoga Bar', 180, 135, 'Breakfast', 1, 380, 14, 8, 8, ARRAY['healthy', 'protein', 'high-fiber'], ARRAY['Amul Full Cream Milk']),
('1000000000006', 'Munch Chocolate', 'Nestle', 20, 14, 'Snacks', 3, 110, 2, 6, 10, ARRAY['high-sugar', 'junk'], ARRAY[]::TEXT[]),
('1000000000007', 'Maggi Noodles', 'Nestle', 14, 10, 'Instant', 5, 348, 9, 14, 2, ARRAY['junk', 'high-sodium'], ARRAY[]::TEXT[]),
('1000000000008', 'Amul Butter', 'Amul', 56, 40, 'Dairy', 2, 720, 1, 80, 1, ARRAY['dairy', 'high-fat'], ARRAY['Britannia Bread']),
('1000000000009', 'Farm Fresh Eggs (6)', 'Farm Fresh', 48, 36, 'Dairy', 2, 420, 36, 28, 2, ARRAY['protein', 'healthy'], ARRAY[]::TEXT[]),
('1000000000010', 'Epigamia Greek Yogurt', 'Epigamia', 90, 65, 'Dairy', 2, 120, 10, 5, 6, ARRAY['healthy', 'protein'], ARRAY[]::TEXT[]),
('1000000000011', 'Quaker Oats', 'Quaker', 189, 140, 'Breakfast', 1, 370, 13, 7, 1, ARRAY['healthy', 'fiber'], ARRAY['Amul Full Cream Milk']),
('1000000000012', 'Kellogg''s Muesli', 'Kellogg''s', 295, 210, 'Breakfast', 1, 420, 10, 8, 22, ARRAY['healthy'], ARRAY['Amul Full Cream Milk']),
('1000000000013', 'Sundrop Peanut Butter', 'Sundrop', 220, 165, 'Spreads', 4, 600, 25, 50, 9, ARRAY['protein'], ARRAY['Britannia Bread']),
('1000000000014', 'Barilla Pasta', 'Barilla', 185, 130, 'Pantry', 5, 350, 12, 2, 3, ARRAY['carbs'], ARRAY['Del Monte Pasta Sauce']),
('1000000000015', 'Del Monte Pasta Sauce', 'Del Monte', 120, 85, 'Pantry', 5, 80, 2, 2, 12, ARRAY['sauce'], ARRAY['Barilla Pasta']),
('1000000000016', 'Britannia Marie Biscuits', 'Britannia', 35, 25, 'Snacks', 3, 450, 7, 15, 18, ARRAY['snack', 'high-sugar'], ARRAY['Amul Full Cream Milk']),
('1000000000017', 'Amul Cheese Slices', 'Amul', 135, 98, 'Dairy', 2, 300, 18, 24, 2, ARRAY['dairy', 'protein'], ARRAY['Britannia Bread']),
('1000000000018', 'India Gate Basmati Rice', 'India Gate', 185, 135, 'Staples', 6, 350, 7, 1, 0, ARRAY['staple'], ARRAY[]::TEXT[]),
('1000000000019', 'Tata Tea Gold', 'Tata', 285, 200, 'Beverages', 7, 0, 0, 0, 0, ARRAY['beverage'], ARRAY['Amul Full Cream Milk']),
('1000000000020', 'Nescafe Classic Coffee', 'Nescafe', 420, 300, 'Beverages', 7, 0, 0, 0, 0, ARRAY['beverage'], ARRAY['Amul Full Cream Milk']),
('1000000000021', 'Cadbury Dairy Milk', 'Cadbury', 80, 55, 'Snacks', 3, 530, 7, 30, 48, ARRAY['high-sugar', 'junk'], ARRAY[]::TEXT[]),
('1000000000022', 'Apple (per kg)', 'Fresh', 220, 160, 'Produce', 8, 52, 0, 0, 10, ARRAY['healthy', 'fruit'], ARRAY[]::TEXT[]),
('1000000000023', 'Banana (per dozen)', 'Fresh', 60, 45, 'Produce', 8, 1050, 13, 3, 140, ARRAY['healthy', 'fruit'], ARRAY[]::TEXT[]),
('1000000000024', 'Fortune Sunflower Oil 1L', 'Fortune', 185, 130, 'Cooking', 6, 8840, 0, 1000, 0, ARRAY['cooking'], ARRAY[]::TEXT[]),
('1000000000025', 'Tata Sampann Moong Dal', 'Tata Sampann', 142, 100, 'Staples', 6, 347, 24, 1, 2, ARRAY['protein', 'healthy'], ARRAY[]::TEXT[])
ON CONFLICT (barcode) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  price_benchmark = EXCLUDED.price_benchmark,
  category = EXCLUDED.category,
  aisle = EXCLUDED.aisle,
  calories = EXCLUDED.calories,
  protein_g = EXCLUDED.protein_g,
  fat_g = EXCLUDED.fat_g,
  sugar_g = EXCLUDED.sugar_g,
  tags = EXCLUDED.tags,
  combo_pairs = EXCLUDED.combo_pairs;
