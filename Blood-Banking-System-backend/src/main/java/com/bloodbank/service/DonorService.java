package com.bloodbank.service;

import com.bloodbank.entity.Donor;
import com.bloodbank.repository.DonorRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.bloodbank.repository.BloodRequestRepository;
import com.bloodbank.entity.BloodRequest;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@Service
public class DonorService {

    private final DonorRepository donorRepository;
    private final BloodRequestRepository bloodRequestRepository;
    private final EmailService emailService;
    private final String frontendUrl;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public DonorService(DonorRepository donorRepository, BloodRequestRepository bloodRequestRepository, 
                        EmailService emailService, @Value("${frontend.url:http://localhost:5173}") String frontendUrl) {
        this.donorRepository = donorRepository;
        this.bloodRequestRepository = bloodRequestRepository;
        this.emailService = emailService;
        this.frontendUrl = frontendUrl;
    }

    public List<Donor> getAllDonors() {
        return donorRepository.findAll();
    }

    public Optional<Donor> registerDonor(Donor donor) {
        if (donorRepository.existsByUsername(donor.getUsername()) || donorRepository.existsByEmail(donor.getEmail())) {
            return Optional.empty();
        }
        donor.setPassword(passwordEncoder.encode(donor.getPassword()));
        donor.setEmailVerified(false);
        donor.setVerificationToken(UUID.randomUUID().toString());
        Donor saved = donorRepository.save(donor);
        sendVerificationEmail(saved);
        return Optional.of(saved);
    }

    public Optional<Donor> updateDonor(Long id, Donor donor) {
        return donorRepository.findById(id).map(existing -> {
            if (!existing.getUsername().equals(donor.getUsername()) && donorRepository.existsByUsername(donor.getUsername())) {
                return null;
            }
            if (!existing.getEmail().equals(donor.getEmail()) && donorRepository.existsByEmail(donor.getEmail())) {
                return null;
            }
            existing.setName(donor.getName());
            existing.setLocation(donor.getLocation());
            existing.setPhone(donor.getPhone());
            existing.setBloodGroup(donor.getBloodGroup());
            existing.setUsername(donor.getUsername());
            existing.setEmail(donor.getEmail());
            if (donor.getPassword() != null && !donor.getPassword().isBlank()) {
                existing.setPassword(passwordEncoder.encode(donor.getPassword()));
            }
            return donorRepository.save(existing);
        });
    }

    public Optional<Donor> findByUsername(String username) {
        return donorRepository.findByUsername(username);
    }

    public Optional<Donor> findByVerificationToken(String token) {
        return donorRepository.findByVerificationToken(token);
    }

    public boolean verifyEmail(String token) {
        if (token == null) {
            return false;
        }
        token = token.trim();
        return donorRepository.findByVerificationToken(token).map(donor -> {
            donor.setEmailVerified(true);
            donor.setVerificationToken(null);
            donorRepository.save(donor);
            return true;
        }).orElse(false);
    }

    public boolean resendVerificationEmail(String email) {
        return donorRepository.findByEmail(email).map(donor -> {
            if (donor.isEmailVerified()) {
                return false;
            }
            donor.setVerificationToken(UUID.randomUUID().toString());
            donorRepository.save(donor);
            sendVerificationEmail(donor);
            return true;
        }).orElse(false);
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

    public boolean isEmailVerified(String username) {
        return donorRepository.findByUsername(username).map(Donor::isEmailVerified).orElse(false);
    }

    public void deleteDonor(Long id) {
        donorRepository.deleteById(id);
    }

    private void sendVerificationEmail(Donor donor) {
        String verifyLink = frontendUrl + "/verify-email?token=" + donor.getVerificationToken();
        String subject = "Verify your Blood Bank account";
        String body = "Hello " + donor.getName() + ",\n\n"
                + "Thank you for registering with the Blood Bank platform. Please verify your email address by clicking the link below:\n\n"
                + verifyLink + "\n\n"
                + "If you did not register, please ignore this message.\n\n"
                + "Thank you,\nBlood Bank Team";
        emailService.sendEmail(donor.getEmail(), subject, body);
    }

    public Map<String, Object> getDashboardStats(String username) {
        Donor donor = donorRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Donor not found"));

        List<BloodRequest> history = bloodRequestRepository.findByAcceptedByDonorIdOrderByAcceptedAtDesc(donor.getId());

        int totalDonations = history.size();
        int livesSaved = totalDonations * 3;

        boolean isEligible = true;
        LocalDateTime nextEligibleDate = null;
        long daysRemaining = 0;

        if (totalDonations > 0) {
            BloodRequest latestDonation = history.get(0);
            if (latestDonation.getAcceptedAt() != null) {
                LocalDateTime lastDonationDate = latestDonation.getAcceptedAt();
                LocalDateTime eligibleDate = lastDonationDate.plusDays(56);
                nextEligibleDate = eligibleDate;

                LocalDateTime now = LocalDateTime.now();
                if (now.isBefore(eligibleDate)) {
                    isEligible = false;
                    daysRemaining = ChronoUnit.DAYS.between(now, eligibleDate);
                    if (daysRemaining <= 0) {
                        daysRemaining = 1;
                    }
                }
            }
        }

        List<Map<String, Object>> badges = new ArrayList<>();
        badges.add(createBadge("First Gift", "Awarded for your first donation.", totalDonations >= 1));
        badges.add(createBadge("Life Saver", "Awarded for 3 donations.", totalDonations >= 3));
        badges.add(createBadge("Guardian Angel", "Awarded for 5 donations.", totalDonations >= 5));
        badges.add(createBadge("Century Hero", "Awarded for 10 donations.", totalDonations >= 10));

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalDonations", totalDonations);
        stats.put("livesSaved", livesSaved);
        stats.put("isEligible", isEligible);
        stats.put("nextEligibleDate", nextEligibleDate != null ? nextEligibleDate.toString() : null);
        stats.put("daysRemaining", daysRemaining);
        stats.put("badges", badges);
        stats.put("donationHistory", history);
        stats.put("credits", donor.getCredits());
        stats.put("walletBalance", donor.getWalletBalance());

        return stats;
    }

    public Map<String, Object> redeemReward(String username, String rewardType) {
        Donor donor = donorRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Donor not found"));

        int cost = 0;
        if ("CERTIFICATE".equalsIgnoreCase(rewardType)) {
            cost = 100;
        } else if ("CASH".equalsIgnoreCase(rewardType)) {
            cost = 300;
        } else {
            throw new IllegalArgumentException("Invalid reward type: " + rewardType);
        }

        if (donor.getCredits() < cost) {
            throw new IllegalStateException("Insufficient credits for redemption");
        }

        donor.setCredits(donor.getCredits() - cost);
        if ("CASH".equalsIgnoreCase(rewardType)) {
            donor.setWalletBalance(donor.getWalletBalance() + 15.0);
        }

        Donor saved = donorRepository.save(donor);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("credits", saved.getCredits());
        response.put("walletBalance", saved.getWalletBalance());
        response.put("message", "Redeemed " + rewardType + " successfully!");
        return response;
    }

    private Map<String, Object> createBadge(String title, String description, boolean unlocked) {
        Map<String, Object> badge = new HashMap<>();
        badge.put("title", title);
        badge.put("description", description);
        badge.put("unlocked", unlocked);
        return badge;
    }
}
