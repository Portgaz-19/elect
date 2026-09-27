package com.faysal.Elect.repository;

import com.faysal.Elect.entity.Party;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PartyRepository extends JpaRepository<Party, UUID> {

    // Look up a party by its logged-in user's id — how "GET /api/party/me" will work.
    // Spring Data JPA reaches through the relationship: Party -> user -> id
    Optional<Party> findByUserId(UUID userId);

    List<Party> findByStatus(Party.PartyStatus status);
}
