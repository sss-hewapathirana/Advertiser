package com.example.sampleApp.features.review;

import com.example.sampleApp.features.AdFeature.AdEntity;
import com.example.sampleApp.features.AdFeature.AdRepository;
import com.example.sampleApp.features.userRegister.UserEntity;
import com.example.sampleApp.features.userRegister.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final AdRepository adRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository, AdRepository adRepository, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.adRepository = adRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ReviewDto createOrUpdateReview(Long adInfoId, Long consumerId, int rating, String title, String reviewText) {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        AdEntity ad = adRepository.findById(adInfoId)
                .orElseThrow(() -> new RuntimeException("Ad not found"));

        ReviewEntity review = reviewRepository
                .findByAd_AdInfoIdAndUser_ConsumerId(adInfoId, consumerId)
                .orElseGet(() -> {
                    ReviewEntity r = new ReviewEntity();
                    r.setAd(ad);
                    r.setUser(userRepository.getReferenceById(consumerId));
                    return r;
                });

        review.setRating(rating);
        review.setTitle(title);
        review.setReviewText(reviewText);
        review = reviewRepository.save(review);
        updateAdRating(adInfoId);

        return toDto(review);
    }

    @Transactional
    public void deleteReview(Long reviewId, Long consumerId) {
        ReviewEntity review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        if (!review.getUser().getConsumerId().equals(consumerId)) {
            throw new RuntimeException("You can only delete your own review");
        }
        Long adInfoId = review.getAd().getAdInfoId();
        reviewRepository.delete(review);
        updateAdRating(adInfoId);
    }

    @Transactional(readOnly = true)
    public Page<ReviewDto> getReviewsByAd(Long adInfoId, Pageable pageable) {
        Page<ReviewEntity> page = reviewRepository.findByAd_AdInfoIdOrderByCreatedAtDesc(adInfoId, pageable);
        List<ReviewDto> dtos = page.getContent().stream().map(this::toDto).collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public ReviewStatsDto getReviewStats(Long adInfoId) {
        long count = reviewRepository.countByAdId(adInfoId);
        double avg = reviewRepository.averageRatingByAdId(adInfoId);
        ReviewStatsDto dto = new ReviewStatsDto();
        dto.setAverageRating(Math.round(avg * 10.0) / 10.0);
        dto.setReviewCount((int) count);
        return dto;
    }

    @Transactional(readOnly = true)
    public ReviewDto getReviewByUserAndAd(Long adInfoId, Long consumerId) {
        return reviewRepository.findByAd_AdInfoIdAndUser_ConsumerId(adInfoId, consumerId)
                .map(this::toDto)
                .orElse(null);
    }

    private void updateAdRating(Long adInfoId) {
        long count = reviewRepository.countByAdId(adInfoId);
        double avg = reviewRepository.averageRatingByAdId(adInfoId);
        adRepository.findById(adInfoId).ifPresent(ad -> {
            ad.setReviewCount((int) count);
            ad.setAverageRating(Math.round(avg * 10.0) / 10.0);
            adRepository.save(ad);
        });
    }

    private ReviewDto toDto(ReviewEntity entity) {
        ReviewDto dto = new ReviewDto();
        dto.setId(entity.getId());
        dto.setAdInfoId(entity.getAd().getAdInfoId());
        dto.setConsumerId(entity.getUser().getConsumerId());
        dto.setUserName(entity.getUser().getName() != null ? entity.getUser().getName() : entity.getUser().getEmail());
        dto.setRating(entity.getRating());
        dto.setTitle(entity.getTitle());
        dto.setReviewText(entity.getReviewText());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
