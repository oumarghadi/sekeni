-- 05 SEED DATA

-- Seed Cities (Mauritania)
INSERT INTO public.cities (name_fr, name_ar, slug) VALUES
('Nouakchott', 'نواكشوط', 'nouakchott'),
('Nouadhibou', 'نواذيبو', 'nouadhibou'),
('Kiffa', 'كيفه', 'kiffa'),
('Atar', 'أطار', 'atar'),
('Rosso', 'روصو', 'rosso');

-- Seed Categories
INSERT INTO public.property_categories (name_fr, name_ar, slug, icon_name) VALUES
('Villa', 'فيلا', 'villa', 'home'),
('Appartement', 'شقة', 'apartment', 'building'),
('Terrain', 'أرض', 'land', 'map'),
('Bureau', 'مكتب', 'office', 'briefcase'),
('Commerce', 'محل تجاري', 'shop', 'shopping-bag'),
('Service de Construction', 'خدمة بناء', 'construction', 'hammer');
