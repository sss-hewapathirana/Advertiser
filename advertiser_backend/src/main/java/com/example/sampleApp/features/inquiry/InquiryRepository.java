package com.example.sampleApp.features.inquiry;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InquiryRepository extends JpaRepository<InquiryEntity, Long> {
    List<InquiryEntity> findAllByPublisherIdOrderByCreatedAtDesc(Long publisherId);
    List<InquiryEntity> findAllByAdInfoIdAndPublisherIdOrderByCreatedAtDesc(Long adInfoId, Long publisherId);
}
