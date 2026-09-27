package com.faysal.Elect.enums;
/**
 * The three kinds of logins in the system. Every User row has exactly one
 * Role, which becomes a Spring Security authority ("ROLE_ADMIN" etc.) and
 * is what SecurityConfig will use to lock down /api/admin/**, /api/party/**,
 * and /api/voter/** respectively (we'll wire that up on Day 2).
 */

public enum Role {
    ADMIN,
    PARTY,
    VOTER
}
