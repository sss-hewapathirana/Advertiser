package com.example.sampleApp.features.AdFeature;

import com.example.sampleApp.features.userRegister.UserEntity;
import com.example.sampleApp.features.userRegister.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

@Service
public class AdService {

    private static final Logger log = LoggerFactory.getLogger(AdService.class);
    private static final int FREE_TIER_LIMIT = 5;

    private final AdRepository adRepository;
    private final UserRepository userRepository;

    public AdService(AdRepository adRepository, UserRepository userRepository) {
        this.adRepository = adRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public AdEntity saveAd(AdEntity ad) {
        UserEntity userRef = ad.getUser();
        if (userRef != null && userRef.getConsumerId() != null) {
            UserEntity managedUser = userRepository.findById(userRef.getConsumerId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!managedUser.isAdvancedOrNot() && managedUser.getNoOfAd() >= FREE_TIER_LIMIT) {
                throw new RuntimeException(
                        "Free tier limit reached (max " + FREE_TIER_LIMIT +
                        " ads). Upgrade to Advanced for unlimited ads.");
            }

            ad.setUser(managedUser);

            if (ad.getImages() != null) {
                ad.getImages().forEach(img -> img.setAd(ad));
                ad.setNumberOfPicture(ad.getImages().size());
            }
            if (ad.getVideos() != null) {
                ad.getVideos().forEach(vid -> vid.setAd(ad));
                ad.setNumberOfVideos(ad.getVideos().size());
            }

            AdEntity saved = adRepository.save(ad);

            int updated = userRepository.incrementAdCount(managedUser.getConsumerId());
            if (updated == 0) {
                throw new RuntimeException("Failed to update ad count");
            }

            return saved;
        }
        return adRepository.save(ad);
    }

    @Transactional(readOnly = true)
    public Page<AdEntity> getAllAds(Pageable pageable) {
        return adRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Page<AdEntity> searchAds(String q, Pageable pageable) {
        return adRepository.search(q, pageable);
    }

    @Transactional(readOnly = true)
    public Page<AdEntity> searchActiveAds(String q, Pageable pageable) {
        return adRepository.searchActive(q, pageable);
    }

    @Transactional(readOnly = true)
    public Page<AdEntity> getPublishedAds(Pageable pageable) {
        return adRepository.findByPublishedTrue(pageable);
    }

    @Transactional(readOnly = true)
    public Page<AdEntity> getPublishedAds(Pageable pageable, List<String> categories) {
        if (categories != null && !categories.isEmpty()) {
            if (categories.size() == 1) {
                return adRepository.findByCategoryAndPublishedTrue(categories.get(0), pageable);
            }
            return adRepository.findPublishedFilteredByCategory(categories, null, null, null, null, pageable);
        }
        return adRepository.findByPublishedTrue(pageable);
    }

    @Transactional(readOnly = true)
    public Page<AdEntity> searchPublishedAds(String q, Pageable pageable) {
        return adRepository.searchPublished(q, pageable);
    }

    @Transactional(readOnly = true)
    public Page<AdEntity> searchPublishedAds(String q, Pageable pageable, List<String> categories) {
        if (categories != null && !categories.isEmpty()) {
            if (categories.size() == 1) {
                return adRepository.searchPublishedByCategory(q, categories.get(0), pageable);
            }
            return adRepository.searchPublishedFilteredByCategory(q, categories, null, null, null, null, pageable);
        }
        return adRepository.searchPublished(q, pageable);
    }

    @Transactional(readOnly = true)
    public Page<AdEntity> getPublishedAds(Pageable pageable, List<String> categories, Double priceMin, Double priceMax, Date dateFrom, Date dateTo) {
        if (priceMin != null || priceMax != null || dateFrom != null || dateTo != null || (categories != null && categories.size() > 1)) {
            if (categories != null && !categories.isEmpty()) {
                return adRepository.findPublishedFilteredByCategory(categories, dateFrom, dateTo, priceMin, priceMax, pageable);
            }
            return adRepository.findPublishedFiltered(dateFrom, dateTo, priceMin, priceMax, pageable);
        }
        return getPublishedAds(pageable, categories);
    }

    @Transactional(readOnly = true)
    public Page<AdEntity> getPublishedAds(Pageable pageable, List<String> categories, Double priceMin, Double priceMax, Date dateFrom, Date dateTo,
                                          Double north, Double south, Double east, Double west) {
        if (north != null && south != null && east != null && west != null) {
            if (categories != null && !categories.isEmpty()) {
                return adRepository.findPublishedInBoundsByCategory(north, south, east, west, categories, dateFrom, dateTo, priceMin, priceMax, pageable);
            }
            return adRepository.findPublishedInBounds(north, south, east, west, dateFrom, dateTo, priceMin, priceMax, pageable);
        }
        return getPublishedAds(pageable, categories, priceMin, priceMax, dateFrom, dateTo);
    }

    @Transactional(readOnly = true)
    public Page<AdEntity> searchPublishedAds(String q, Pageable pageable, List<String> categories, Double priceMin, Double priceMax, Date dateFrom, Date dateTo) {
        if (priceMin != null || priceMax != null || dateFrom != null || dateTo != null || (categories != null && categories.size() > 1)) {
            if (categories != null && !categories.isEmpty()) {
                return adRepository.searchPublishedFilteredByCategory(q, categories, dateFrom, dateTo, priceMin, priceMax, pageable);
            }
            return adRepository.searchPublishedFiltered(q, dateFrom, dateTo, priceMin, priceMax, pageable);
        }
        return searchPublishedAds(q, pageable, categories);
    }

    @Transactional(readOnly = true)
    public Page<AdEntity> searchPublishedAds(String q, Pageable pageable, List<String> categories, Double priceMin, Double priceMax, Date dateFrom, Date dateTo,
                                              Double north, Double south, Double east, Double west) {
        if (north != null && south != null && east != null && west != null) {
            if (categories != null && !categories.isEmpty()) {
                return adRepository.searchPublishedInBoundsByCategory(q, north, south, east, west, categories, dateFrom, dateTo, priceMin, priceMax, pageable);
            }
            return adRepository.searchPublishedInBounds(q, north, south, east, west, dateFrom, dateTo, priceMin, priceMax, pageable);
        }
        return searchPublishedAds(q, pageable, categories, priceMin, priceMax, dateFrom, dateTo);
    }

    @Transactional(readOnly = true)
    public AdEntity getAdById(Long id) {
        return adRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ad not found"));
    }

    @Transactional
    public AdEntity updateAd(Long id, AdEntity updated) {
        AdEntity existing = getAdById(id);
        existing.setAdTitle(updated.getAdTitle());
        existing.setAdInfo(updated.getAdInfo());
        existing.setCategory(updated.getCategory());
        existing.setPrice(updated.getPrice());

        boolean userWantsPublished = updated.getPublished() != null && updated.getPublished();
        if (userWantsPublished) {
            existing.setPublished(true);
            if (existing.getExpireDate() != null && existing.getExpireDate().before(new Date())) {
                Date now = new Date();
                long originalDuration = existing.getExpireDate().getTime() - existing.getCreateDate().getTime();
                if (originalDuration <= 0) originalDuration = 30L * 24 * 60 * 60 * 1000;
                existing.setExpireDate(new Date(now.getTime() + originalDuration));
            } else if (existing.getExpireDate() == null) {
                Calendar cal = Calendar.getInstance();
                cal.add(Calendar.DAY_OF_YEAR, 30);
                existing.setExpireDate(cal.getTime());
            }
        } else {
            existing.setPublished(false);
            if (updated.getExpireDate() != null) {
                existing.setExpireDate(updated.getExpireDate());
            }
        }

        if (updated.getImages() != null) {
            existing.getImages().clear();
            updated.getImages().forEach(img -> {
                img.setAd(existing);
                existing.getImages().add(img);
            });
            existing.setNumberOfPicture(existing.getImages().size());
        }
        if (updated.getVideos() != null) {
            existing.getVideos().clear();
            updated.getVideos().forEach(vid -> {
                vid.setAd(existing);
                existing.getVideos().add(vid);
            });
            existing.setNumberOfVideos(existing.getVideos().size());
        }

        return adRepository.save(existing);
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void autoExpireAds() {
        int count = adRepository.expireOverdueAds();
        if (count > 0) {
            log.info("Auto-expired {} ad(s)", count);
        }
    }

    @Transactional
    public void deleteAd(Long id) {
        AdEntity ad = getAdById(id);
        UserEntity user = ad.getUser();
        if (user != null && user.getConsumerId() != null) {
            userRepository.decrementAdCount(user.getConsumerId());
        }
        adRepository.delete(ad);
    }

    @Transactional(readOnly = true)
    public List<String> getAllCategories() {
        List<String> fromDb = adRepository.findDistinctCategories();
        if (fromDb != null && !fromDb.isEmpty()) {
            return fromDb;
        }
        List<String> fallback = new ArrayList<>();
        fallback.add("Real Estate");
        fallback.add("Vehicles");
        fallback.add("Electronics");
        fallback.add("Jobs");
        fallback.add("Services");
        fallback.add("Furniture & Home");
        fallback.add("Fashion & Beauty");
        fallback.add("Books & Media");
        fallback.add("Sports & Outdoors");
        fallback.add("Pets & Animals");
        fallback.add("Food & Agriculture");
        fallback.add("Business & Industrial");
        fallback.add("Education & Classes");
        fallback.add("Other");
        return fallback;
    }

    @Transactional(readOnly = true)
    public Page<AdEntity> getFilteredAds(String status, String mediaType, Date dateFrom, Date dateTo, String category, Double priceMin, Double priceMax, Pageable pageable) {
        if (status != null) {
            switch (status) {
                case "active":
                    return adRepository.findActiveAds(pageable);
                case "published":
                    return adRepository.findByPublishedTrue(pageable);
                case "unpublished":
                    return adRepository.findByPublishedFalse(pageable);
                case "expired":
                    return adRepository.findExpiredAds(pageable);
                case "expiring":
                    Calendar cal = Calendar.getInstance();
                    cal.add(Calendar.DAY_OF_YEAR, 7);
                    return adRepository.findExpiringSoon(cal.getTime(), pageable);
            }
        }
        if (dateFrom != null && dateTo != null) {
            return adRepository.findByExpireDateBetween(dateFrom, dateTo, pageable);
        }
        if (mediaType != null) {
            switch (mediaType) {
                case "images":
                    return adRepository.findAdsWithImages(pageable);
                case "videos":
                    return adRepository.findAdsWithVideos(pageable);
                case "text":
                    return adRepository.findTextOnlyAds(pageable);
            }
        }
        if (priceMin != null || priceMax != null) {
            if (category != null && !category.isEmpty()) {
                return adRepository.findByCategoryAndPriceRange(category, priceMin, priceMax, pageable);
            }
            return adRepository.findAllByPriceRange(priceMin, priceMax, pageable);
        }
        if (category != null && !category.isEmpty()) {
            return adRepository.findByCategory(category, pageable);
        }
        return adRepository.findAll(pageable);
    }

    @Transactional
    public int bulkDelete(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return 0;
        return adRepository.deleteByIdIn(ids);
    }
}
