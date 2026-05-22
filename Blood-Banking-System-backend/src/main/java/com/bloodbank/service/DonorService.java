package com.bloodbank.service;

import com.bloodbank.entity.Donor;
import com.bloodbank.repository.DonorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DonorService {

    private final DonorRepository donorRepository;

    public DonorService(DonorRepository donorRepository) {
        this.donorRepository = donorRepository;
    }

    public List<Donor> getAllDonors() {
        return donorRepository.findAll();
    }

    public Optional<Donor> registerDonor(Donor donor) {
        if (donorRepository.existsByUsername(donor.getUsername()) || donorRepository.existsByEmail(donor.getEmail())) {
            return Optional.empty();
        }
        return Optional.of(donorRepository.save(donor));
    }

    public boolean usernameExists(String username) {
        return donorRepository.existsByUsername(username);
    }

    public boolean emailExists(String email) {
        return donorRepository.existsByEmail(email);
    }

    public Optional<Donor> login(String username, String password) {
        return donorRepository.findByUsernameAndPassword(username, password);
    }

    public void deleteDonor(Long id) {
        donorRepository.deleteById(id);
    }
}
