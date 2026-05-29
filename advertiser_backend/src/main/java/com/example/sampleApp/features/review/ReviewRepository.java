package com.example.sampleApp.features.review;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<ReviewEntity, Long> {

    Page<ReviewEntity> findByAd_AdInfoIdOrderByCreatedAtDesc(Long adInfoId, Pageable pageable);

    Optional<ReviewEntity> findByAd_AdInfoIdAndUser_ConsumerId(Long adInfoId, Long consumerId);

    @Query("SELECT COUNT(r) FROM ReviewEntity r WHERE r.ad.adInfoId = :adInfoId")
    long countByAdId(@Param("adInfoId") Long adInfoId);

    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM ReviewEntity r WHERE r.ad.adInfoId = :adInfoId")
    double averageRatingByAdId(@Param("adInfoId") Long adInfoId);
}
