-- Step 9a: holidays and events. Run after 06-availability-with-id.sql. Run it once.

-- "Update from Google": swaps all public holidays for the new list in one transaction.
-- If one row is bad, nothing changes and the old list stays.
CREATE FUNCTION replace_public_holidays(p_rows JSONB) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'not_admin';
  END IF;
  IF jsonb_array_length(p_rows) = 0 THEN
    RAISE EXCEPTION 'empty';
  END IF;

  DELETE FROM calendar_entry WHERE kind = 'PUBLIC_HOLIDAY';

  INSERT INTO calendar_entry (kind, name, start_date, end_date)
  SELECT 'PUBLIC_HOLIDAY', r.name, r."date", r."date"
  FROM jsonb_to_recordset(p_rows) AS r("date" DATE, name VARCHAR(80));
END;
$$;

REVOKE EXECUTE ON FUNCTION replace_public_holidays FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION replace_public_holidays TO authenticated;

-- Starting public holidays, the same as src/data/holidays.json (2026 and 2027).
INSERT INTO calendar_entry (kind, name, start_date, end_date) VALUES
  ('PUBLIC_HOLIDAY', 'New Year''s Day', '2026-01-01', '2026-01-01'),
  ('PUBLIC_HOLIDAY', 'Thaipusam', '2026-02-01', '2026-02-01'),
  ('PUBLIC_HOLIDAY', 'Day off for Thaipusam', '2026-02-02', '2026-02-02'),
  ('PUBLIC_HOLIDAY', 'Chinese New Year''s Day', '2026-02-17', '2026-02-17'),
  ('PUBLIC_HOLIDAY', 'Second Day of Chinese New Year', '2026-02-18', '2026-02-18'),
  ('PUBLIC_HOLIDAY', 'Nuzul Al-Quran', '2026-03-07', '2026-03-07'),
  ('PUBLIC_HOLIDAY', 'Hari Raya Puasa Holiday', '2026-03-20', '2026-03-20'),
  ('PUBLIC_HOLIDAY', 'Hari Raya Puasa', '2026-03-21', '2026-03-21'),
  ('PUBLIC_HOLIDAY', 'Labour Day', '2026-05-01', '2026-05-01'),
  ('PUBLIC_HOLIDAY', 'Hari Raya Haji', '2026-05-27', '2026-05-27'),
  ('PUBLIC_HOLIDAY', 'Wesak Day', '2026-05-31', '2026-05-31'),
  ('PUBLIC_HOLIDAY', 'The Yang di-Pertuan Agong''s Birthday', '2026-06-01', '2026-06-01'),
  ('PUBLIC_HOLIDAY', 'Muharram', '2026-06-17', '2026-06-17'),
  ('PUBLIC_HOLIDAY', 'The Prophet Muhammad''s Birthday', '2026-08-25', '2026-08-25'),
  ('PUBLIC_HOLIDAY', 'Malaysia''s National Day', '2026-08-31', '2026-08-31'),
  ('PUBLIC_HOLIDAY', 'Malaysia Day', '2026-09-16', '2026-09-16'),
  ('PUBLIC_HOLIDAY', 'Diwali', '2026-11-08', '2026-11-08'),
  ('PUBLIC_HOLIDAY', 'Hari Keputeraan Sultan Selangor', '2026-12-11', '2026-12-11'),
  ('PUBLIC_HOLIDAY', 'Christmas Day', '2026-12-25', '2026-12-25'),
  ('PUBLIC_HOLIDAY', 'New Year''s Day', '2027-01-01', '2027-01-01'),
  ('PUBLIC_HOLIDAY', 'Thaipusam', '2027-01-22', '2027-01-22'),
  ('PUBLIC_HOLIDAY', 'Chinese New Year''s Day', '2027-02-06', '2027-02-06'),
  ('PUBLIC_HOLIDAY', 'Second Day of Chinese New Year', '2027-02-07', '2027-02-07'),
  ('PUBLIC_HOLIDAY', 'Nuzul Al-Quran (tentative)', '2027-02-24', '2027-02-24'),
  ('PUBLIC_HOLIDAY', 'Labour Day', '2027-05-01', '2027-05-01'),
  ('PUBLIC_HOLIDAY', 'Wesak Day', '2027-05-20', '2027-05-20'),
  ('PUBLIC_HOLIDAY', 'The Yang di-Pertuan Agong''s Birthday', '2027-06-07', '2027-06-07'),
  ('PUBLIC_HOLIDAY', 'Malaysia''s National Day', '2027-08-31', '2027-08-31'),
  ('PUBLIC_HOLIDAY', 'Malaysia Day', '2027-09-16', '2027-09-16'),
  ('PUBLIC_HOLIDAY', 'Diwali', '2027-10-28', '2027-10-28'),
  ('PUBLIC_HOLIDAY', 'Hari Keputeraan Sultan Selangor', '2027-12-11', '2027-12-11'),
  ('PUBLIC_HOLIDAY', 'Christmas Day', '2027-12-25', '2027-12-25');
