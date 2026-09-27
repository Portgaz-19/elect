package com.faysal.Elect.dto;

import java.util.List;
import java.util.UUID;

public record ElectionResultResponse(
        UUID electionId,
        String electionName,
        long totalVotesCast,
        List<CandidateTally> tallies
) {
    public record CandidateTally(UUID candidateId, String candidateName, String partyAcronym, long votes) {}
}
