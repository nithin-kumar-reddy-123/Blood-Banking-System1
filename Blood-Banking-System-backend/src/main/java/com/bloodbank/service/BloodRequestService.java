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
            
            request.setStatus("ACCEPTED");
            request.setAcceptedByDonorId(donorId);
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
            request.setStatus(status);
            return requestRepository.save(request);
        }).orElseThrow(() -> new RuntimeException("Blood request not found"));
    }
}
