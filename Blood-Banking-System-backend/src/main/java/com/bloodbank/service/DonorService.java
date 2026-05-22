package com.bloodbank.service;

import com.bloodbank.entity.Donor;
import com.bloodbank.repository.DonorRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DonorService {

    private final DonorRepository donorRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

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
        donor.setPassword(passwordEncoder.encode(donor.getPassword()));
        return Optional.of(donorRepository.save(donor));
    }

    public boolean usernameExists(String username) {
        return donorRepository.existsByUsername(username);
    }

    public boolean emailExists(String email) {
        return donorRepository.existsByEmail(email);
    }

    public Optional<Donor> login(String username, String password) {
        return donorRepository.findByUsername(username)
                .filter(donor -> donor.getPassword() != null &&
                        (passwordEncoder.matches(password, donor.getPassword()) || donor.getPassword().equals(password)));
    }

    public void deleteDonor(Long id) {
        donorRepository.deleteById(id);
    }
}
