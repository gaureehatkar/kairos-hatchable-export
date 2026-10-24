CREATE OR REPLACE FUNCTION kairos_reject_raw_event_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'kairos_raw_events is append-only; raw source artifacts cannot be updated or deleted';
END;
$$;
DROP TRIGGER IF EXISTS kairos_raw_events_immutable ON kairos_raw_events;
CREATE TRIGGER kairos_raw_events_immutable
BEFORE UPDATE OR DELETE ON kairos_raw_events
FOR EACH ROW EXECUTE FUNCTION kairos_reject_raw_event_mutation();