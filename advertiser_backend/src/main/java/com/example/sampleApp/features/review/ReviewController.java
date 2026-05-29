package com.example.sampleApp.features.review;

import com.example.sampleApp.features.userRegister.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/ads/{adId}/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<?> createOrUpdateReview(
            @PathVariable Long adId,
            @RequestBody Map<String, Object> body) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserEntity user)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }

        Object ratingObj = body.get("rating");
        if (ratingObj == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Rating is required"));
        }
        int rating = ((Number) ratingObj).intValue();
        String title = (String) body.get("title");
        String reviewText = (String) body.get("reviewText");

        try {
            ReviewDto dto = reviewService.createOrUpdateReview(adId, user.getConsumerId(), rating, title, reviewText);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<Page<ReviewDto>> getReviews(
            @PathVariable Long adId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(reviewService.getReviewsByAd(adId, pageable));
    }

    @GetMapping("/stats")
    public ResponseEntity<ReviewStatsDto> getStats(@PathVariable Long adId) {
        return ResponseEntity.ok(reviewService.getReviewStats(adId));
    }

    @GetMapping("/mine")
    public ResponseEntity<?> getMyReview(@PathVariable Long adId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserEntity user)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }
        ReviewDto dto = reviewService.getReviewByUserAndAd(adId, user.getConsumerId());
        if (dto == null) {
            return ResponseEntity.ok(Map.of());
        }
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping
    public ResponseEntity<?> deleteReview(@PathVariable Long adId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserEntity user)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }
        ReviewDto existing = reviewService.getReviewByUserAndAd(adId, user.getConsumerId());
        if (existing == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "No review found"));
        }
        reviewService.deleteReview(existing.getId(), user.getConsumerId());
        return ResponseEntity.ok(Map.of("message", "Review deleted"));
    }
}
