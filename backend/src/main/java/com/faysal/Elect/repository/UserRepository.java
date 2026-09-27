package com.faysal.Elect.repository;

import com.faysal.Elect.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    // Email doubles as the "username" for Spring Security's UserDetailsService
    Optional<User> findByEmail(String email);

    // Used at registration time to reject duplicate emails before hitting the DB unique constraint
    boolean existsByEmail(String email);



}
