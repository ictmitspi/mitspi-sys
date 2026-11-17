-- Step 8a: availability returns the same columns as the booking table,
-- so the app changes both into a Booking with one function.
-- The return columns change, so the old function must be dropped first.
DROP FUNCTION availability(SMALLINT, DATE);

CREATE FUNCTION availability(p_room_id SMALLINT, p_date DATE)
RETURNS TABLE (
  id UUID, room_id SMALLINT, booking_date DATE, start_time TIME, end_time TIME,
  class_id SMALLINT, subject_id SMALLINT, teacher_name VARCHAR
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT b.id, b.room_id, b.booking_date, b.start_time, b.end_time, b.class_id, b.subject_id, b.teacher_name
  FROM booking b
  WHERE b.room_id = p_room_id AND b.booking_date = p_date AND b.status = 'ACTIVE'
  ORDER BY b.start_time
$$;

REVOKE EXECUTE ON FUNCTION availability FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION availability TO anon, authenticated;
