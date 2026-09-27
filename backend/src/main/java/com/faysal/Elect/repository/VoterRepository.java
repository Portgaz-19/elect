package com.faysal.Elect.repository;

import com.faysal.Elect.entity.Voter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface VoterRepository extends JpaRepository<Voter, UUID> {

    // Matches a self-registering voter against the pre-loaded roll (used in AuthService on Day 2)
    Optional<Voter> findByVoterRegNumber(String voterRegNumber);

    Optional<Voter> findByUserId(UUID userId);

    // Walks Voter -> user -> email, same property-path trick as PartyRepository above
    Optional<Voter> findByUserEmail(String email);
}
