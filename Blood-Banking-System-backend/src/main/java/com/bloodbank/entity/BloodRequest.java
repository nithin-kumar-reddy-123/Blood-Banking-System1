package com.bloodbank.entity;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "requests")
public class BloodRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @JsonAlias("bloodType")
    private String bloodGroup;
    private String phone;
    private String email;
    private String location;
    private String reason;
    private LocalDateTime createdAt;
    // Status of the request: PENDING, ACCEPTED, FULFILLED
    private String status = "PENDING";
    
    private Long acceptedByDonorId;
    private LocalDateTime acceptedAt;

    public BloodRequest() {
        this.createdAt = LocalDateTime.now();
    }

    public BloodRequest(String name, String bloodGroup, String phone, String email, String location, String reason) {
        this.name = name;
        this.bloodGroup = bloodGroup;
        this.phone = phone;
        this.email = email;
        this.location = location;
        this.reason = reason;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getAcceptedByDonorId() {
        return acceptedByDonorId;
    }

    public void setAcceptedByDonorId(Long acceptedByDonorId) {
        this.acceptedByDonorId = acceptedByDonorId;
    }

    public LocalDateTime getAcceptedAt() {
        return acceptedAt;
    }

    public void setAcceptedAt(LocalDateTime acceptedAt) {
        this.acceptedAt = acceptedAt;
    }
}
