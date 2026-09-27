CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email          VARCHAR(255) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    role           VARCHAR(20)  NOT NULL,
    enabled        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TABLE constituencies (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name           VARCHAR(255) NOT NULL,
    level          VARCHAR(30)  NOT NULL,
    parent_id      UUID REFERENCES constituencies(id)
);

CREATE TABLE elections (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name               VARCHAR(255) NOT NULL,
    type               VARCHAR(30)  NOT NULL,
    constituency_id    UUID NOT NULL REFERENCES constituencies(id),
    start_time         TIMESTAMPTZ NOT NULL,
    end_time           TIMESTAMPTZ NOT NULL,
    status             VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    CHECK (end_time > start_time)
);

CREATE TABLE parties (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID NOT NULL UNIQUE REFERENCES users(id),
    name               VARCHAR(255) NOT NULL UNIQUE,
    acronym            VARCHAR(30)  NOT NULL UNIQUE,
    logo_url           VARCHAR(500),
    chairman_name      VARCHAR(255),
    status             VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    applied_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE voters (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                UUID UNIQUE REFERENCES users(id),
    voter_reg_number       VARCHAR(50)  NOT NULL UNIQUE,
    full_name              VARCHAR(255) NOT NULL,
    date_of_birth          DATE NOT NULL,
    constituency_id        UUID NOT NULL REFERENCES constituencies(id),
    registration_complete  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE candidates (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    party_id            UUID NOT NULL REFERENCES parties(id),
    election_id         UUID NOT NULL REFERENCES elections(id),
    constituency_id     UUID NOT NULL REFERENCES constituencies(id),
    full_name           VARCHAR(255) NOT NULL,
    bio                 TEXT,
    manifesto           TEXT,
    running_mate_name   VARCHAR(255),
    photo_url           VARCHAR(500),
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING'
);

CREATE TABLE votes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voter_id        UUID NOT NULL REFERENCES voters(id),
    election_id     UUID NOT NULL REFERENCES elections(id),
    candidate_id    UUID NOT NULL REFERENCES candidates(id),
    cast_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_vote_voter_election UNIQUE (voter_id, election_id)
);

CREATE INDEX idx_candidates_election_constituency_status
    ON candidates (election_id, constituency_id, status);

CREATE INDEX idx_votes_election_candidate
    ON votes (election_id, candidate_id);