package com.faysal.Elect.repository;

import com.faysal.Elect.entity.Election;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface ElectionRepository extends JpaRepository<Election, UUID> {

    List<Election> findByStatus(Election.ElectionStatus status);

    // "Active" = we're currently within the voting window (startTime <= now <= endTime).
    // This is a case where the method name alone can't express the query cleanly
    // (two different fields compared against the same "now" value), so the two
    // params are named to match — Spring still generates it from the name.
    List<Election> findByStartTimeBeforeAndEndTimeAfter(Instant now1, Instant now2);
}
