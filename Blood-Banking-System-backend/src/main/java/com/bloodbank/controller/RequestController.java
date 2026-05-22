package com.bloodbank.controller;

import com.bloodbank.entity.BloodRequest;
import com.bloodbank.service.BloodRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
public class RequestController {

    private final BloodRequestService requestService;

    public RequestController(BloodRequestService requestService) {
        this.requestService = requestService;
    }

    @GetMapping
    public ResponseEntity<List<BloodRequest>> getAllRequests() {
        return ResponseEntity.ok(requestService.getAllRequests());
    }

    @PostMapping
    public ResponseEntity<?> createRequest(@RequestBody BloodRequest request) {
        if (request.getName() == null || request.getBloodGroup() == null || request.getPhone() == null || request.getEmail() == null || request.getLocation() == null || request.getReason() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "All request fields are required"));
        }
        BloodRequest saved = requestService.createRequest(request);
        return ResponseEntity.status(201).body(saved);
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<?> acceptRequest(@PathVariable("id") Long id, @RequestBody Map<String, Object> payload) {
        Object donorIdObj = payload.get("donorId");
        if (donorIdObj == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "donorId is required"));
        }
        Long donorId;
        if (donorIdObj instanceof Number) {
            donorId = ((Number) donorIdObj).longValue();
        } else {
            try {
                donorId = Long.parseLong(donorIdObj.toString());
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid donorId format"));
            }
        }
        try {
            BloodRequest updatedRequest = requestService.acceptRequest(id, donorId);
            return ResponseEntity.ok(updatedRequest);
        } catch (Exception e) {
            e.printStackTrace(); // Log the error to the console
            String msg = e.getMessage() != null ? e.getMessage() : e.toString();
            return ResponseEntity.status(500).body(Map.of("error", msg));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRequest(@PathVariable("id") Long id) {
        try {
            requestService.deleteRequest(id);
            return ResponseEntity.ok(Map.of("message", "Request deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error deleting request"));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateRequestStatus(@PathVariable("id") Long id, @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        if (status == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "status is required"));
        }
        try {
            BloodRequest updated = requestService.updateRequestStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Error updating status"));
        }
    }
}
