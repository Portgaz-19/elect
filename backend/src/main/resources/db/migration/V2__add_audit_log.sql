CREATE TABLE audit_logs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_email  VARCHAR(255) NOT NULL,
    action       VARCHAR(100) NOT NULL,
    target_id    VARCHAR(100),
    details      TEXT,
    timestamp    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_timestamp ON audit_logs (timestamp DESC);