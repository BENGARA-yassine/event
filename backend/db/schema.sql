CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(10) NOT NULL CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  location VARCHAR(180) NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  max_participants INTEGER NOT NULL CHECK (max_participants > 0),
  status VARCHAR(12) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled')),
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(40),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  status VARCHAR(12) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, participant_id)
);

CREATE INDEX idx_events_status_date ON events(status, event_date);
CREATE INDEX idx_participants_search ON participants (lower(full_name), lower(email));
CREATE INDEX idx_registrations_event_status ON registrations(event_id, status);
CREATE INDEX idx_registrations_created_at ON registrations(created_at);

-- An event cancellation automatically cancels its active registrations.
CREATE OR REPLACE FUNCTION cancel_event_registrations() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status <> 'cancelled' THEN
    UPDATE registrations SET status = 'cancelled', updated_at = NOW()
    WHERE event_id = NEW.id AND status <> 'cancelled';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER event_cancellation AFTER UPDATE OF status ON events
FOR EACH ROW EXECUTE FUNCTION cancel_event_registrations();
