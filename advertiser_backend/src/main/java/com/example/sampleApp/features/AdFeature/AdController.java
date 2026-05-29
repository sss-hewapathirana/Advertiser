package com.example.sampleApp.features.AdFeature;

import com.example.sampleApp.features.userRegister.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import org.springframework.format.annotation.DateTimeFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ads")
public class AdController {

    private final AdService adService;

    public AdController(AdService adService) {
        this.adService = adService;
    }

    @PostMapping
    public AdEntity createAd(@RequestBody AdEntity ad) {
        return adService.saveAd(ad);
    }

    @GetMapping
    @Transactional(readOnly = true)
    public Page<AdEntity> getAds(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String mediaType,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double priceMin,
            @RequestParam(required = false) Double priceMax,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date dateTo,
            Pageable pageable) {
        if (q != null && !q.isBlank()) {
            return adService.searchAds(q, pageable);
        }
        if (status != null || mediaType != null || dateFrom != null || dateTo != null || (category != null && !category.isEmpty()) || priceMin != null || priceMax != null) {
            return adService.getFilteredAds(status, mediaType, dateFrom, dateTo, category, priceMin, priceMax, pageable);
        }
        return adService.getAllAds(pageable);
    }

    @GetMapping("/categories")
    public List<String> getCategories() {
        return adService.getAllCategories();
    }

    @GetMapping("/public")
    @Transactional(readOnly = true)
    public Page<AdEntity> getPublicAds(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) List<String> category,
            @RequestParam(required = false) Double priceMin,
            @RequestParam(required = false) Double priceMax,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date dateTo,
            @RequestParam(required = false) Double north,
            @RequestParam(required = false) Double south,
            @RequestParam(required = false) Double east,
            @RequestParam(required = false) Double west,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createDate") String sort,
            @RequestParam(defaultValue = "desc") String dir) {
        Sort sortObj = Sort.by(dir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sort);
        Pageable pageable = PageRequest.of(page, size, sortObj);
        if (q != null && !q.isBlank()) {
            return adService.searchPublishedAds(q, pageable, category, priceMin, priceMax, dateFrom, dateTo, north, south, east, west);
        }
        return adService.getPublishedAds(pageable, category, priceMin, priceMax, dateFrom, dateTo, north, south, east, west);
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public AdEntity getAd(@PathVariable Long id) {
        return adService.getAdById(id);
    }

    @GetMapping("/{id}/public")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getPublicAd(@PathVariable Long id) {
        AdEntity ad = adService.getAdById(id);
        if (ad.getPublished() != null && !ad.getPublished()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Ad not found"));
        }
        return ResponseEntity.ok(ad);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAd(@PathVariable Long id, @RequestBody AdEntity ad) {
        ResponseEntity<?> ownershipError = checkOwnership(id);
        if (ownershipError != null) return ownershipError;
        return ResponseEntity.ok(adService.updateAd(id, ad));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAd(@PathVariable Long id) {
        ResponseEntity<?> ownershipError = checkOwnership(id);
        if (ownershipError != null) return ownershipError;
        adService.deleteAd(id);
        return ResponseEntity.ok(Map.of("message", "Ad deleted"));
    }

    @PostMapping("/bulk-delete")
    public ResponseEntity<?> bulkDelete(@RequestBody List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No IDs provided"));
        }
        if (ids.size() > 100) {
            return ResponseEntity.badRequest().body(Map.of("error", "Max 100 ads per request"));
        }
        int deleted = adService.bulkDelete(ids);
        return ResponseEntity.ok(Map.of("message", deleted + " ad(s) deleted"));
    }

    @GetMapping("/export")
    @Transactional(readOnly = true)
    public ResponseEntity<String> exportAds(@RequestParam List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest().body("No IDs provided");
        }
        if (ids.size() > 100) {
            return ResponseEntity.badRequest().body("Max 100 ads per request");
        }
        StringBuilder csv = new StringBuilder("Title,Description,Category,Expiry Date,Images,Videos,Created\n");
        for (Long id : ids) {
            try {
                AdEntity ad = adService.getAdById(id);
                csv.append(String.format("\"%s\",\"%s\",\"%s\",%s,%d,%d,%s\n",
                    ad.getAdTitle() != null ? ad.getAdTitle().replace("\"", "\"\"") : "",
                    ad.getAdInfo() != null ? ad.getAdInfo().replace("\"", "\"\"") : "",
                    ad.getCategory() != null ? ad.getCategory() : "",
                    ad.getExpireDate() != null ? ad.getExpireDate().toString() : "",
                    ad.getNumberOfPicture(),
                    ad.getNumberOfVideos(),
                    ad.getCreateDate() != null ? ad.getCreateDate().toString() : ""));
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .header("Content-Disposition", "attachment; filename=ads-export.csv")
                .body(csv.toString());
    }

    private ResponseEntity<?> checkOwnership(Long adId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserEntity currentUser)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }
        AdEntity ad = adService.getAdById(adId);
        if (!ad.getUser().getConsumerId().equals(currentUser.getConsumerId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You can only modify your own advertisements"));
        }
        return null;
    }
}
