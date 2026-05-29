package com.example.sampleApp;
import com.example.sampleApp.features.userRegister.UserEntity;
import com.example.sampleApp.features.userRegister.UserRepository;
import org.springframework.security.core.userdetails.*;

import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService
        implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(
            UserRepository userRepository) {

        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(
            String email)
            throws UsernameNotFoundException {

        UserEntity user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new UsernameNotFoundException(
                                        "User not found"));

        return User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole().replace("ROLE_", ""))
                .build();
    }
}