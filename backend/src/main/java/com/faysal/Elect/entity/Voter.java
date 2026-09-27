package com.faysal.Elect.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "voters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Voter {

    @Id
    @GeneratedValue
    private UUID id;

    // Null until the voter completes self-registration and gets a login
    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    // Simulated VIN/NIN — the identifier admins load from the official roll
    @Column(nullable = false, unique = true)
    private String voterRegNumber;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private LocalDate dateOfBirth;

    // Determines which candidates this voter is allowed to see/vote for
    @ManyToOne
    @JoinColumn(name = "constituency_id", nullable = false)
    private Constituency constituency;

    @Column(nullable = false)
    private boolean registrationComplete;
}
