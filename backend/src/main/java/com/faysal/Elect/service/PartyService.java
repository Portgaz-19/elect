package com.faysal.Elect.service;

import com.faysal.Elect.dto.AuthResponse;
import com.faysal.Elect.dto.CandidateRegisterRequest;
import com.faysal.Elect.dto.PartyRegisterRequest;
import com.faysal.Elect.entity.*;
import com.faysal.Elect.enums.Role;
import com.faysal.Elect.exception.DuplicateResourceException;
import com.faysal.Elect.exception.ResourceNotFoundException;
import com.faysal.Elect.repository.*;
import com.faysal.Elect.security.JwtService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * Self-service for parties: registering (which also creates their login),
 * viewing their own profile, and registering/listing their own candidates.
 * A party can only register candidates once an admin has approved the party
 * itself — enforced in registerCandidate below, not just at the UI level.
 */
@Service
@RequiredArgsConstructor
public class PartyService {

    private final PartyRepository partyRepository;
    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;
    private final ElectionRepository electionRepository;
    private final ConstituencyRepository constituencyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(PartyRegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Email already in use");
        }

        User user = userRepository.save(User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(Role.PARTY)
                .build());

        Party party = Party.builder()
                .user(user)
                .name(request.name())
                .acronym(request.acronym())
                .logoUrl(request.logoUrl())
                .chairmanName(request.chairmanName())
                .status(Party.PartyStatus.PENDING)
                .build();
        partyRepository.save(party);

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getRole().name());
    }

    public Party getUserById(UUID userId) {
        return partyRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Party profile not found"));
    }

    @Transactional
    public Candidate registerCandidate(UUID userId, CandidateRegisterRequest request) {
        Party party = getUserById(userId);
        if (party.getStatus() != Party.PartyStatus.APPROVED) {
            throw new IllegalArgumentException("Party must be approved before registering candidates");
        }

        Election election = electionRepository.findById(request.electionId())
                .orElseThrow(() -> new ResourceNotFoundException("Election not found"));
        Constituency constituency = constituencyRepository.findById(request.constituencyId())
                .orElseThrow(() -> new ResourceNotFoundException("Constituency not found"));

        Candidate candidate = Candidate.builder()
                .party(party)
                .election(election)
                .constituency(constituency)
                .fullName(request.fullName())
                .bio(request.bio())
                .manifesto(request.manifesto())
                .runningMateName(request.runningMateName())
                .photoUrl(request.photoUrl())
                .status(Candidate.CandidateStatus.PENDING)
                .build();
        return candidateRepository.save(candidate);
    }

    public List<Candidate> getMyCandidates(UUID userId) {
        Party party = getUserById(userId);
        return candidateRepository.findByPartyId(party.getId());
    }
}
