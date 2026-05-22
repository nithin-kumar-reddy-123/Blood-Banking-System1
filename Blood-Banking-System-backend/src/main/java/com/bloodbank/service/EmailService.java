package com.bloodbank.service;

import com.bloodbank.entity.BloodRequest;
import com.bloodbank.entity.Donor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String body) {
        try {
            if (mailSender != null) {
                SimpleMailMessage message = new SimpleMailMessage();
                // Let Gmail automatically set the "From" based on the authenticated user
                message.setTo(to);
                message.setSubject(subject);
                message.setText(body);
                mailSender.send(message);
                System.out.println("✅ REAL EMAIL SENT SUCCESSFULLY TO: " + to);
            } else {
                throw new MailException("JavaMailSender not configured") {};
            }
        } catch (Exception e) {
            System.err.println("❌ FAILED TO SEND REAL EMAIL. Reason: " + e.getMessage());
            e.printStackTrace();
            logSimulatedEmail(to, subject, body);
        }
    }

    private void logSimulatedEmail(String to, String subject, String body) {
        String logEntry = "==================================================\n" +
                "SIMULATED EMAIL SENT SUCCESSFULLY\n" +
                "From: noreply@bloodbank.com\n" +
                "To: " + to + "\n" +
                "Subject: " + subject + "\n" +
                "Body:\n" + body + "\n" +
                "==================================================\n";

        System.out.println(logEntry);

        try (PrintWriter out = new PrintWriter(new FileWriter("simulated_emails.log", true))) {
            out.println(logEntry);
        } catch (IOException ioException) {
            System.err.println("Failed to write to simulated_emails.log");
        }
    }

    public void notifyMatchingDonors(BloodRequest request, List<Donor> matchingDonors) {
        for (Donor donor : matchingDonors) {
            String subject = "Urgently Needed: Blood Donation in " + request.getLocation();
            String body = "Dear " + donor.getName() + ",\n\n" +
                    "A new blood request has been created matching your blood group (" + request.getBloodGroup() + ") and location (" + request.getLocation() + ").\n\n" +
                    "Patient: " + request.getName() + "\n" +
                    "Reason: " + request.getReason() + "\n" +
                    "Contact Phone: " + request.getPhone() + "\n\n" +
                    "Please log in to the system if you can accept this request and save a life.\n\n" +
                    "Thank you,\nBlood Bank Team";
            sendEmail(donor.getEmail(), subject, body);
        }
    }

    public void sendAcceptanceEmail(BloodRequest request, Donor donor) {
        String subject = "Good News: A Donor has accepted your Blood Request";
        String body = "Dear " + request.getName() + ",\n\n" +
                "We are glad to inform you that a donor has approved and accepted your blood request.\n\n" +
                "Donor Name: " + donor.getName() + "\n" +
                "Contact Phone: " + donor.getPhone() + "\n" +
                "Email: " + donor.getEmail() + "\n\n" +
                "Please contact them directly at the earliest.\n\n" +
                "Thank you,\nBlood Bank Team";
        sendEmail(request.getEmail(), subject, body);
    }
}
