package com.faysal.Elect.config;

import com.faysal.Elect.entity.User;
import com.faysal.Elect.enums.Role;
import com.faysal.Elect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * DEV ONLY — creates a single admin login on startup if one doesn't already
 * exist, purely so we have someone to test /api/auth/login against before
 * any real registration flow exists. Remove this class (or gate it behind
 * a "dev" profile) before deploying — a hardcoded default admin password
 * has no business existing in production.
 */
@Profile("dev")
@Component
@RequiredArgsConstructor
public class DevDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String adminEmail = "admin@elect.ng";
        if (userRepository.existsByEmail(adminEmail)) {
            return; // already seeded, don't duplicate on every restart
        }

        User admin = User.builder()
                .email(adminEmail)
                .passwordHash(passwordEncoder.encode("Admin123!"))
                .role(Role.ADMIN)
                .enabled(true)
                .build();

        userRepository.save(admin);
        System.out.println(">>> Seeded dev admin: " + adminEmail + " / Admin123!");
    }
}
