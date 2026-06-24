package com.bloodbank.controller;

import com.bloodbank.entity.Donor;
import com.bloodbank.service.DonorService;
import com.bloodbank.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/donors")
public class DonorController {

    private final DonorService donorService;
    private final JwtUtil jwtUtil;

    public DonorController(DonorService donorService, JwtUtil jwtUtil) {
        this.donorService = donorService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping
    public ResponseEntity<List<Donor>> getAllDonors() {
        return ResponseEntity.ok(donorService.getAllDonors());
    }

    @PostMapping
    public ResponseEntity<?> registerDonor(@RequestBody Donor donor) {
        if (donor.getName() == null || donor.getLocation() == null || donor.getPhone() == null || donor.getBloodGroup() == null || donor.getUsername() == null || donor.getPassword() == null || donor.getEmail() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "All donor fields are required"));
        }

        if (donorService.usernameExists(donor.getUsername())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Username already exists"));
        }

        if (donorService.emailExists(donor.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Email already registered"));
        }

        if (donorService.registerDonor(donor).isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Username or email already exists"));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Registration successful. Please verify your email."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username and password are required"));
        }

        Optional<Donor> donorOptional = donorService.findByUsername(username);
        if (donorOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials"));
        }

        Donor donor = donorOptional.get();
        if (!donor.isEmailVerified()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Email not verified. Please check your inbox."));
        }

        return donorService.login(username, password)
                .map(found -> {
                    String token = jwtUtil.generateToken(found.getUsername());
                    Map<String, Object> response = new java.util.HashMap<>();
                    response.put("token", token);
                    response.put("id", found.getId());
                    response.put("name", found.getName());
                    response.put("location", found.getLocation());
                    response.put("phone", found.getPhone());
                    response.put("bloodGroup", found.getBloodGroup());
                    response.put("username", found.getUsername());
                    response.put("email", found.getEmail());
                    response.put("role", found.getRole());
                    response.put("credits", found.getCredits());
                    response.put("walletBalance", found.getWalletBalance());
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials")));
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestParam("token") String token) {
        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Verification token is missing."));
        }
        token = token.trim();
        boolean verified = donorService.verifyEmail(token);
        if (verified) {
            return ResponseEntity.ok(Map.of("message", "Email successfully verified."));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid or expired verification token."));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required."));
        }
        boolean resent = donorService.resendVerificationEmail(email);
        if (!resent) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Unable to resend verification. Email may already be verified or not registered."));
        }
        return ResponseEntity.ok(Map.of("message", "Verification email resent. Please check your inbox."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDonor(@PathVariable("id") Long id) {
        try {
            donorService.deleteDonor(id);
            return ResponseEntity.ok(Map.of("message", "Donor deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Error deleting donor"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDonor(@PathVariable("id") Long id, @RequestBody Donor donor) {
        try {
            return donorService.updateDonor(id, donor)
                    .map(updated -> ResponseEntity.ok(Map.of(
                            "id", updated.getId(),
                            "name", updated.getName(),
                            "location", updated.getLocation(),
                            "phone", updated.getPhone(),
                            "bloodGroup", updated.getBloodGroup(),
                            "username", updated.getUsername(),
                            "email", updated.getEmail(),
                            "role", updated.getRole()
                    )))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Username or email already in use")));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Error updating donor"));
        }
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            org.springframework.security.core.Authentication authentication = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
            }
            String username = authentication.getName();
            return ResponseEntity.ok(donorService.getDashboardStats(username));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Error fetching dashboard statistics"));
        }
    }

    @PostMapping("/redeem")
    public ResponseEntity<?> redeemReward(@RequestBody Map<String, String> payload) {
        try {
            org.springframework.security.core.Authentication authentication = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
            }
            String username = authentication.getName();
            String rewardType = payload.get("rewardType");
            if (rewardType == null || rewardType.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "rewardType is required"));
            }
            Map<String, Object> result = donorService.redeemReward(username, rewardType);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Error redeeming reward"));
        }
    }
}
