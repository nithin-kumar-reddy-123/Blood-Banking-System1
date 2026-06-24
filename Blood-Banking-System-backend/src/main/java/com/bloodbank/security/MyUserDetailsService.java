package com.bloodbank.security;

import com.bloodbank.entity.Donor;
import com.bloodbank.repository.DonorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;

@Service
public class MyUserDetailsService implements UserDetailsService {

    @Autowired
    private DonorRepository donorRepository;

    @Override
    public UserDetails loadUserByUsername(String username) {
        Donor donor = donorRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        // In this simple setup, all donors have ROLE_DONOR; you can extend to admins.
        Collection<? extends GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_DONOR"));
        return new User(donor.getUsername(), donor.getPassword(), authorities);
    }
}
