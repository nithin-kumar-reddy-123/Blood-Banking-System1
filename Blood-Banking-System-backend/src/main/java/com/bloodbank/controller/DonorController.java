package com.bloodbank.controller;

import com.bloodbank.entity.Donor;
import com.bloodbank.service.DonorService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/donors")
public class DonorController {

    private final DonorService donorService;

    public DonorController(DonorService donorService) {
        this.donorService = donorService;
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
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Donor registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username and password are required"));
        }

        return donorService.login(username, password)
                .map(donor -> {
                    Map<String, Object> response = new java.util.HashMap<>();
                    response.put("id", donor.getId());
                    response.put("name", donor.getName());
                    response.put("location", donor.getLocation());
                    response.put("phone", donor.getPhone());
                    response.put("bloodGroup", donor.getBloodGroup());
                    response.put("username", donor.getUsername());
                    response.put("email", donor.getEmail());
                    response.put("role", donor.getRole());
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials")));
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
}
