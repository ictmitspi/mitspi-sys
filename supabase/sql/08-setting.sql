-- Step 9g: school settings that the admin changes in the app. Run after 07-calendar.sql. Run it once.

-- One row only (id is always 1).
-- admin_whatsapp: the number behind the teachers' WhatsApp button. Malaysian, country code first, digits only.
CREATE TABLE school_setting (
  id             SMALLINT    PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  admin_whatsapp VARCHAR(12) NOT NULL CHECK (admin_whatsapp ~ '^60[0-9]{8,10}$')
);

ALTER TABLE school_setting ENABLE ROW LEVEL SECURITY;

-- Teachers do not sign in, so everyone may read it. Only the admin changes it. No insert or delete.
CREATE POLICY read_all     ON school_setting FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY admin_change ON school_setting FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- The placeholder from src/data/school.ts. The admin puts the real number on "School lists".
INSERT INTO school_setting (admin_whatsapp) VALUES ('60123456789');
