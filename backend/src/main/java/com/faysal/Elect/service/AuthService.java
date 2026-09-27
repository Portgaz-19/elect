package com.faysal.Elect.service;

import com.faysal.Elect.dto.AuthRequest;
import com.faysal.Elect.dto.AuthResponse;
import com.faysal.Elect.dto.VoterRegisterRequest;
import com.faysal.Elect.entity.User;
import com.faysal.Elect.entity.Voter;
import com.faysal.Elect.enums.Role;
import com.faysal.Elect.exception.DuplicateResourceException;
import com.faysal.Elect.exception.InvalidVoterRollException;
import com.faysal.Elect.repository.UserRepository;
import com.faysal.Elect.repository.VoterRepository;
import com.faysal.Elect.security.JwtService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Handles login (shared across all three roles). Party and admin account
 * creation live elsewhere — parties self-register via PartyService (Day 3),
 * admins are seeded directly since there's no legitimate "sign up as
 * election admin" flow. Voter self-registration (matching against the
 * pre-loaded roll) comes next, once Voter/roll logic exists.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final VoterRepository voterRepository;
    private final PasswordEncoder passwordEncoder;

    // Delegates the actual email/password check to Spring Security's
    // AuthenticationManager, which under the hood calls our
    // DaoAuthenticationProvider -> UserDetailsServiceImpl -> BCrypt check.
    // We never compare password hashes ourselves.
    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        // If authenticate() didn't throw, credentials are valid — now just
        // load the user again to generate their token
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getRole().name());
    }

    @Transactional
    public AuthResponse registerVoter(VoterRegisterRequest request) {
        Voter voter = voterRepository.findByVoterRegNumber(request.voterRegNumber())
                .orElseThrow(() -> new InvalidVoterRollException("No matching voter record found"));

        // Both the reg number AND date of birth must match — reg number alone
        // isn't enough proof of identity, since it's not exactly a secret.
        if (!voter.getDateOfBirth().equals(request.dateOfBirth())) {
            throw new InvalidVoterRollException("No matching voter record found");
        }

        if (voter.getUser() != null) {
            throw new DuplicateResourceException("This voter has already completed registration");
        }

        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Email already in use");
        }

        User user = userRepository.save(User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(Role.VOTER)
                .build());

        voter.setUser(user);
        voter.setRegistrationComplete(true);
        voterRepository.save(voter);

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getRole().name());
    }
}
