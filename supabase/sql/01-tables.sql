-- Step 2: tables, then RLS on every table. Run once in the Supabase SQL Editor.

CREATE TABLE room (
  id        SMALLSERIAL PRIMARY KEY,
  name      VARCHAR(50) NOT NULL UNIQUE,
  is_active BOOLEAN     NOT NULL DEFAULT TRUE
);

CREATE TABLE school_class (
  id         SMALLSERIAL PRIMARY KEY,
  name       VARCHAR(50) NOT NULL UNIQUE,
  short_name VARCHAR(10) NOT NULL UNIQUE,   -- 1B, saved in capitals
  is_active  BOOLEAN     NOT NULL DEFAULT TRUE
);

CREATE TABLE subject (
  id         SMALLSERIAL PRIMARY KEY,
  name       VARCHAR(50) NOT NULL UNIQUE,
  short_name VARCHAR(10) NOT NULL UNIQUE,   -- BM, saved in capitals
  is_active  BOOLEAN     NOT NULL DEFAULT TRUE
);

-- Made by hand: create the user in Supabase Auth, then insert its id here.
CREATE TABLE admin_user (
  id         UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       VARCHAR(80) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE booking (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id      SMALLINT     NOT NULL REFERENCES room(id),
  booking_date DATE         NOT NULL,
  start_time   TIME         NOT NULL,
  end_time     TIME         NOT NULL,
  class_id     SMALLINT     NOT NULL REFERENCES school_class(id),
  subject_id   SMALLINT     NOT NULL REFERENCES subject(id),
  teacher_name VARCHAR(80)  NOT NULL,
  status       VARCHAR(10)  NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CANCELLED')),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_by   UUID         REFERENCES admin_user(id),
  CHECK (start_time >= '07:30' AND end_time <= '18:30' AND end_time > start_time)
);

-- Dashboard filters by month first.
CREATE INDEX booking_date_idx ON booking (booking_date);

CREATE TABLE booking_slot (
  room_id    SMALLINT NOT NULL REFERENCES room(id),
  slot_date  DATE     NOT NULL,
  slot_start TIME     NOT NULL,
  booking_id UUID     NOT NULL REFERENCES booking(id) ON DELETE CASCADE,
  PRIMARY KEY (room_id, slot_date, slot_start)     -- no double booking
);

-- Audit trail: the old booking row on each edit or cancel.
CREATE TABLE booking_history (
  id         BIGSERIAL   PRIMARY KEY,
  booking_id UUID        NOT NULL REFERENCES booking(id),
  action     VARCHAR(10) NOT NULL CHECK (action IN ('EDIT', 'CANCEL')),
  old_values JSONB       NOT NULL,
  changed_by UUID        REFERENCES admin_user(id),   -- null for a fix in the SQL editor
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX booking_history_booking_idx ON booking_history (booking_id);

CREATE TABLE calendar_entry (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  kind       VARCHAR(20) NOT NULL CHECK (kind IN ('PUBLIC_HOLIDAY', 'SCHOOL_HOLIDAY', 'EVENT')),
  name       VARCHAR(80) NOT NULL,
  start_date DATE        NOT NULL,
  end_date   DATE        NOT NULL,
  created_by UUID        REFERENCES admin_user(id),   -- null for public holidays from the feed
  CHECK (end_date >= start_date)
);

-- The booking page asks "what is on this day?"
CREATE INDEX calendar_entry_dates_idx ON calendar_entry (start_date, end_date);

ALTER TABLE room            ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_class    ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject         ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_user      ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking         ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_slot    ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_entry  ENABLE ROW LEVEL SECURITY;
