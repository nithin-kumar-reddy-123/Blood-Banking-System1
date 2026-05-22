package com.bloodbank;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BloodBankingSystemApplication {
    public static void main(String[] args) {
        SpringApplication.run(BloodBankingSystemApplication.class, args);
        System.out.println("its working");
    }
}
