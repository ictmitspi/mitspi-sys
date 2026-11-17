-- Step 4b: admin functions. Run after 03-teacher-functions.sql.
-- Both refuse a booking that has started (it is read-only).

-- Changes all fields of one booking and moves its slots. A taken slot undoes the whole edit.
CREATE FUNCTION update_booking(
  p_id UUID, p_room_id SMALLINT, p_date DATE, p_start TIME, p_end TIME,
  p_class_id SMALLINT, p_subject_id SMALLINT, p_teacher_name TEXT
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_old  booking;
  v_name text := trim(p_teacher_name);
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'not_admin'; END IF;

  -- FOR UPDATE stops a second admin edit of this booking until this one ends.
  SELECT * INTO v_old FROM booking WHERE id = p_id AND status = 'ACTIVE' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'not_found'; END IF;
  IF v_old.booking_date + v_old.start_time <= (now() AT TIME ZONE 'Asia/Kuala_Lumpur') THEN
    RAISE EXCEPTION 'started';
  END IF;

  IF v_name IS NULL OR length(v_name) NOT BETWEEN 1 AND 80 THEN RAISE EXCEPTION 'bad_name'; END IF;
  IF extract(minute FROM p_start) NOT IN (0, 30) OR extract(minute FROM p_end) NOT IN (0, 30) THEN
    RAISE EXCEPTION 'bad_time';
  END IF;
  IF p_date + p_start < (now() AT TIME ZONE 'Asia/Kuala_Lumpur') THEN RAISE EXCEPTION 'in_past'; END IF;

  UPDATE booking SET
    room_id = p_room_id, booking_date = p_date, start_time = p_start, end_time = p_end,
    class_id = p_class_id, subject_id = p_subject_id, teacher_name = v_name,
    updated_at = now(), updated_by = auth.uid()
  WHERE id = p_id;

  DELETE FROM booking_slot WHERE booking_id = p_id;
  INSERT INTO booking_slot (room_id, slot_date, slot_start, booking_id)
  SELECT p_room_id, p_date, t::time, p_id
  FROM generate_series(p_date + p_start, p_date + p_end - interval '30 minutes', interval '30 minutes') AS t;
END $$;

REVOKE EXECUTE ON FUNCTION update_booking FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION update_booking TO authenticated;

-- Cancels one booking and frees its slots. The booking row stays for reports.
CREATE FUNCTION cancel_booking(p_id UUID) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_old booking;
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'not_admin'; END IF;

  SELECT * INTO v_old FROM booking WHERE id = p_id AND status = 'ACTIVE' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'not_found'; END IF;
  IF v_old.booking_date + v_old.start_time <= (now() AT TIME ZONE 'Asia/Kuala_Lumpur') THEN
    RAISE EXCEPTION 'started';
  END IF;

  UPDATE booking SET status = 'CANCELLED', updated_at = now(), updated_by = auth.uid() WHERE id = p_id;
  DELETE FROM booking_slot WHERE booking_id = p_id;
END $$;

REVOKE EXECUTE ON FUNCTION cancel_booking FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION cancel_booking TO authenticated;
