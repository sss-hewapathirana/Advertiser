package com.example.sampleApp.features.userRegister;

import com.example.sampleApp.features.userRegister.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserRepository
        extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByEmail(String email);

    @Modifying
    @Query("UPDATE UserEntity u SET u.noOfAd = u.noOfAd + 1 WHERE u.consumerId = :userId")
    int incrementAdCount(Long userId);

    @Modifying
    @Query("UPDATE UserEntity u SET u.noOfAd = GREATEST(0, u.noOfAd - 1) WHERE u.consumerId = :userId")
    int decrementAdCount(Long userId);
}