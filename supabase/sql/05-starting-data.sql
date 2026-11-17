-- Step 5: the school's starting lists (20 Oct 2026).
-- Run once, after 04-admin-functions.sql. Later the admin keeps them on "School lists".

INSERT INTO room (name) VALUES
  ('Makmal Komputer 1'),
  ('Makmal Komputer 2');

INSERT INTO school_class (name, short_name) VALUES
  ('1 Al Biruni', '1B'), ('1 Al Khawarizmi', '1K'),
  ('2 Al Biruni', '2B'), ('2 Al Khawarizmi', '2K'),
  ('3 Al Biruni', '3B'), ('3 Al Khawarizmi', '3K'),
  ('4 Al Biruni', '4B'), ('4 Al Khawarizmi', '4K'),
  ('5 Al Biruni', '5B'), ('5 Al Khawarizmi', '5K');

INSERT INTO subject (name, short_name) VALUES
  ('Bahasa Melayu', 'BM'),
  ('Bahasa Inggeris', 'BI'),
  ('Matematik', 'MT'),
  ('Sains', 'SC'),
  ('Sejarah', 'SEJ'),
  ('Bahasa Arab', 'BA'),
  ('Al Lughah Al Arabiah Al Muasirah', 'LAM'),
  ('Al Quran wa As Sunnah', 'QS'),
  ('Al Syariah', 'SYA'),
  ('Dirasah Al Islamiyah', 'DI'),
  ('Ekonomi', 'EKO'),
  ('Geografi', 'GEO'),
  ('Hifz Al Quran', 'AQH'),
  ('Lughatul Arabiah', 'LA'),
  ('Maharat Al Quran', 'MQ'),
  ('Matematik Tambahan', 'ADM'),
  ('Pend Jasmani dan Pend Kesihatan', 'PJPK'),
  ('Pendidikan Al Quran dan As Sunnah', 'PQS'),
  ('Pendidikan Islam', 'PI'),
  ('Pendidikan Seni Visual', 'PSV'),
  ('Pendidikan Syariah Islamiyah', 'PSI'),
  ('Prinsip Perakaunan', 'AKAUN'),
  ('Reka Bentuk Teknologi', 'RBT'),
  ('Ulum Al Quran', 'UM'),
  ('Usul Al Din', 'USL');
