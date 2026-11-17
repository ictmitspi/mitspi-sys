-- Step 3: who may read and write each table. Run after 01-tables.sql.

-- True when the signed-in user is an admin.
CREATE FUNCTION is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM admin_user WHERE id = auth.uid())
$$;

-- School lists: everyone reads, the admin adds and changes. No delete (hide, not delete).
CREATE POLICY read_all     ON room FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY admin_add    ON room FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY admin_change ON room FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY read_all     ON school_class FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY admin_add    ON school_class FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY admin_change ON school_class FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY read_all     ON subject FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY admin_add    ON subject FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY admin_change ON subject FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Holidays and events: everyone reads, the admin does all.
CREATE POLICY read_all  ON calendar_entry FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY admin_all ON calendar_entry FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Bookings and history: only the admin reads. The booking functions do all writes.
-- booking_slot: no policy. Only the functions use it.
CREATE POLICY admin_read ON booking         FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY admin_read ON booking_history FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY own_row    ON admin_user      FOR SELECT TO authenticated USING (id = auth.uid());

-- Keeps the old row on every booking change, also on a fix in the SQL editor.
CREATE FUNCTION log_booking_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO booking_history (booking_id, action, old_values, changed_by)
  VALUES (
    OLD.id,
    CASE WHEN NEW.status = 'CANCELLED' AND OLD.status = 'ACTIVE' THEN 'CANCEL' ELSE 'EDIT' END,
    to_jsonb(OLD),
    auth.uid()
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER booking_history_trg
AFTER UPDATE ON booking
FOR EACH ROW EXECUTE FUNCTION log_booking_change();
