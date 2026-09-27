package com.faysal.Elect.dto;

// What every login/registration endpoint hands back: the token to put in
// the Authorization header on future requests, plus the role so the
// frontend knows which UI to show without decoding the JWT itself.
public record AuthResponse(String token, String role) {}
