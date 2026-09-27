package com.faysal.Elect.repository;

import com.faysal.Elect.entity.Constituency;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

// No custom queries yet — constituencies are simple lookup/reference data,
// the inherited findAll()/findById()/save() cover everything we need so far.
public interface ConstituencyRepository extends JpaRepository<Constituency, UUID> {
}
