package com.bloodbank.service;

import com.bloodbank.entity.BloodRequest;
import com.bloodbank.entity.Donor;
import com.bloodbank.repository.BloodRequestRepository;
import com.bloodbank.repository.DonorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BloodRequestService {

    private final BloodRequestRepository requestRepository;
    private final DonorRepository donorRepository;
    private final EmailService emailService;

    public BloodRequestService(BloodRequestRepository requestRepository, DonorRepository donorRepository, EmailService emailService) {
        this.requestRepository = requestRepository;
        this.donorRepository = donorRepository;
        this.emailService = emailService;
    }

    public List<BloodRequest> getAllRequests() {
        return requestRepository.findAll();
    }

    public BloodRequest createRequest(BloodRequest request) {
        BloodRequest savedRequest = requestRepository.save(request);
        
        List<Donor> matchingDonors = donorRepository.findByBloodGroupAndLocationIgnoreCase(savedRequest.getBloodGroup(), savedRequest.getLocation());
        emailService.notifyMatchingDonors(savedRequest, matchingDonors);
        
        return savedRequest;
    }

    public BloodRequest acceptRequest(Long requestId, Long donorId) {
        return requestRepository.findById(requestId).map(request -> {
            Donor donor = donorRepository.findById(donorId)
                    .orElseThrow(() -> new RuntimeException("Donor not found"));
            
            if (!donor.getBloodGroup().equalsIgnoreCase(request.getBloodGroup())) {
                throw new RuntimeException("Blood type is not matched");
            }
            
            request.setStatus("ACCEPTED");
            request.setAcceptedByDonorId(donorId);
            request.setAcceptedAt(java.time.LocalDateTime.now());
            BloodRequest updatedRequest = requestRepository.save(request);
            
            emailService.sendAcceptanceEmail(updatedRequest, donor);
            
            return updatedRequest;
        }).orElseThrow(() -> new RuntimeException("Blood request not found"));
    }

    public void deleteRequest(Long id) {
        requestRepository.deleteById(id);
    }

    public BloodRequest updateRequestStatus(Long id, String status) {
        return requestRepository.findById(id).map(request -> {
            String oldStatus = request.getStatus();
            request.setStatus(status);
            BloodRequest saved = requestRepository.save(request);
            
            if ("FULFILLED".equalsIgnoreCase(status) && !"FULFILLED".equalsIgnoreCase(oldStatus)) {
                if (request.getAcceptedByDonorId() != null) {
                    donorRepository.findById(request.getAcceptedByDonorId()).ifPresent(donor -> {
                        donor.setCredits(donor.getCredits() + 100);
                        donorRepository.save(donor);
                    });
                }
            }
            return saved;
        }).orElseThrow(() -> new RuntimeException("Blood request not found"));
    }
}
