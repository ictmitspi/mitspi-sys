-- Step 4a: teacher functions. Run after 02-policies.sql.
-- Supabase grants new functions to anon and authenticated by default,
-- so each function revokes those grants before it grants its own.

-- Booked times for one room and day. Teachers see only these columns.
CREATE FUNCTION availability(p_room_id SMALLINT, p_date DATE)
RETURNS TABLE (start_time TIME, end_time TIME, class_id SMALLINT, subject_id SMALLINT, teacher_name VARCHAR)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT b.start_time, b.end_time, b.class_id, b.subject_id, b.teacher_name
  FROM booking b
  WHERE b.room_id = p_room_id AND b.booking_date = p_date AND b.status = 'ACTIVE'
  ORDER BY b.start_time
$$;

REVOKE EXECUTE ON FUNCTION availability FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION availability TO anon, authenticated;

-- Saves one booking and its 30-minute slots. A taken slot raises unique_violation (23505)
-- and undoes the whole booking. Only the create-booking Edge Function calls it, after Turnstile.
CREATE FUNCTION create_booking(
  p_room_id SMALLINT, p_date DATE, p_start TIME, p_end TIME,
  p_class_id SMALLINT, p_subject_id SMALLINT, p_teacher_name TEXT
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_id   uuid;
  v_name text := trim(p_teacher_name);
BEGIN
  IF v_name IS NULL OR length(v_name) NOT BETWEEN 1 AND 80 THEN RAISE EXCEPTION 'bad_name'; END IF;
  IF extract(minute FROM p_start) NOT IN (0, 30) OR extract(minute FROM p_end) NOT IN (0, 30) THEN
    RAISE EXCEPTION 'bad_time';
  END IF;
  IF p_date + p_start < (now() AT TIME ZONE 'Asia/Kuala_Lumpur') THEN RAISE EXCEPTION 'in_past'; END IF;
  IF NOT EXISTS (SELECT 1 FROM room WHERE id = p_room_id AND is_active) THEN RAISE EXCEPTION 'bad_room'; END IF;
  IF NOT EXISTS (SELECT 1 FROM school_class WHERE id = p_class_id AND is_active) THEN RAISE EXCEPTION 'bad_class'; END IF;
  IF NOT EXISTS (SELECT 1 FROM subject WHERE id = p_subject_id AND is_active) THEN RAISE EXCEPTION 'bad_subject'; END IF;

  -- Abuse limits (architecture.md section 6). The numbers are a first guess.
  IF (SELECT count(*) FROM booking WHERE created_at > now() - interval '1 minute') >= 10 THEN
    RAISE EXCEPTION 'too_many';
  END IF;
  IF (SELECT coalesce(sum(end_time - start_time), '0') FROM booking
      WHERE booking_date = p_date AND status = 'ACTIVE' AND lower(teacher_name) = lower(v_name))
     + (p_end - p_start) > interval '4 hours' THEN
    RAISE EXCEPTION 'too_long';
  END IF;

  INSERT INTO booking (room_id, booking_date, start_time, end_time, class_id, subject_id, teacher_name)
  VALUES (p_room_id, p_date, p_start, p_end, p_class_id, p_subject_id, v_name)
  RETURNING id INTO v_id;

  INSERT INTO booking_slot (room_id, slot_date, slot_start, booking_id)
  SELECT p_room_id, p_date, t::time, v_id
  FROM generate_series(p_date + p_start, p_date + p_end - interval '30 minutes', interval '30 minutes') AS t;

  RETURN v_id;
END $$;

REVOKE EXECUTE ON FUNCTION create_booking FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION create_booking TO service_role;
