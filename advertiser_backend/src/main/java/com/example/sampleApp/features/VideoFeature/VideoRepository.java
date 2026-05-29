package com.example.sampleApp.features.VideoFeature;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VideoRepository
        extends JpaRepository <VideoEntity, Long> {
}
