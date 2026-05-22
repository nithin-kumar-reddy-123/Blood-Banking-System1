package com.bloodbank.repository;

import com.bloodbank.entity.Donor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DonorRepository extends JpaRepository<Donor, Long> {
    Optional<Donor> findByUsername(String username);
    Optional<Donor> findByUsernameAndPassword(String username, String password);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    java.util.List<Donor> findByBloodGroupAndLocationIgnoreCase(String bloodGroup, String location);
}
