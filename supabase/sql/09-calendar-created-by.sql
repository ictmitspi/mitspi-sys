-- Step 10: the database fills calendar_entry.created_by with the signed-in admin.
-- Run after 08-setting.sql. Run it once. Safe at any time: it changes no existing rows.

-- Before this, the app never sent created_by, so it was always null.
-- auth.uid() is the admin who adds the entry, or who runs "Update from Google"
-- (replace_public_holidays keeps the caller's sign-in). It is null in the SQL editor.
ALTER TABLE calendar_entry ALTER COLUMN created_by SET DEFAULT auth.uid();
