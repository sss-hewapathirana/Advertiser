package com.example.sampleApp.features.AdFeature;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface AdRepository
        extends JpaRepository<AdEntity, Long> {

    @Query("SELECT a FROM AdEntity a WHERE " +
           "LOWER(a.adTitle) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(a.adInfo) LIKE LOWER(CONCAT('%', :q, '%'))")
    Page<AdEntity> search(@Param("q") String q, Pageable pageable);

    Page<AdEntity> findAll(Pageable pageable);

    @Query("SELECT a FROM AdEntity a WHERE a.expireDate > CURRENT_TIMESTAMP")
    Page<AdEntity> findActiveAds(Pageable pageable);

    @Query("SELECT a FROM AdEntity a WHERE a.expireDate > CURRENT_TIMESTAMP AND (" +
           "LOWER(a.adTitle) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(a.adInfo) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<AdEntity> searchActive(@Param("q") String q, Pageable pageable);

    @Query("SELECT a FROM AdEntity a WHERE a.published IS NULL OR a.published = true")
    Page<AdEntity> findByPublishedTrue(Pageable pageable);
    Page<AdEntity> findByPublishedFalse(Pageable pageable);

    @Query("SELECT a FROM AdEntity a WHERE (a.published IS NULL OR a.published = true) AND (" +
           "LOWER(a.adTitle) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(a.adInfo) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<AdEntity> searchPublished(@Param("q") String q, Pageable pageable);

    @Query("SELECT a FROM AdEntity a WHERE a.expireDate < CURRENT_TIMESTAMP")
    Page<AdEntity> findExpiredAds(Pageable pageable);

    @Query("SELECT a FROM AdEntity a WHERE a.expireDate BETWEEN CURRENT_TIMESTAMP AND :withinDate")
    Page<AdEntity> findExpiringSoon(@Param("withinDate") Date withinDate, Pageable pageable);

    @Query("SELECT a FROM AdEntity a WHERE a.expireDate BETWEEN :from AND :to")
    Page<AdEntity> findByExpireDateBetween(@Param("from") Date from, @Param("to") Date to, Pageable pageable);

    @Query("SELECT a FROM AdEntity a WHERE a.numberOfPicture > 0")
    Page<AdEntity> findAdsWithImages(Pageable pageable);

    @Query("SELECT a FROM AdEntity a WHERE a.numberOfVideos > 0")
    Page<AdEntity> findAdsWithVideos(Pageable pageable);

    @Query("SELECT a FROM AdEntity a WHERE a.numberOfPicture = 0 AND a.numberOfVideos = 0")
    Page<AdEntity> findTextOnlyAds(Pageable pageable);

    Page<AdEntity> findByCategory(String category, Pageable pageable);

    @Query("SELECT a FROM AdEntity a WHERE (a.published IS NULL OR a.published = true) AND a.category = :cat")
    Page<AdEntity> findByCategoryAndPublishedTrue(@Param("cat") String category, Pageable pageable);

    @Query("SELECT a FROM AdEntity a WHERE (LOWER(a.adTitle) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(a.adInfo) LIKE LOWER(CONCAT('%', :q, '%'))) AND a.category = :cat")
    Page<AdEntity> searchByCategory(@Param("q") String q, @Param("cat") String cat, Pageable pageable);

    @Query("SELECT a FROM AdEntity a WHERE (a.published IS NULL OR a.published = true) AND (LOWER(a.adTitle) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(a.adInfo) LIKE LOWER(CONCAT('%', :q, '%'))) AND a.category = :cat")
    Page<AdEntity> searchPublishedByCategory(@Param("q") String q, @Param("cat") String cat, Pageable pageable);

    @Query("SELECT DISTINCT a.category FROM AdEntity a WHERE a.category IS NOT NULL")
    List<String> findDistinctCategories();

    Page<AdEntity> findByCategoryAndPublishedFalse(String category, Pageable pageable);

    @Query("SELECT a FROM AdEntity a WHERE (a.price IS NULL OR a.price >= COALESCE(:priceMin, a.price)) " +
           "AND (a.price IS NULL OR a.price <= COALESCE(:priceMax, a.price))")
    Page<AdEntity> findAllByPriceRange(@Param("priceMin") Double priceMin,
                                       @Param("priceMax") Double priceMax,
                                       Pageable pageable);

    @Query("SELECT a FROM AdEntity a WHERE a.category = :cat " +
           "AND (a.price IS NULL OR a.price >= COALESCE(:priceMin, a.price)) " +
           "AND (a.price IS NULL OR a.price <= COALESCE(:priceMax, a.price))")
    Page<AdEntity> findByCategoryAndPriceRange(@Param("cat") String category,
                                                @Param("priceMin") Double priceMin,
                                                @Param("priceMax") Double priceMax,
                                                Pageable pageable);

    @Query("SELECT a FROM AdEntity a WHERE (a.published IS NULL OR a.published = true) " +
           "AND a.category IN :cats " +
           "AND (a.createDate IS NULL OR a.createDate >= COALESCE(:dateFrom, a.createDate)) " +
           "AND (a.createDate IS NULL OR a.createDate <= COALESCE(:dateTo, a.createDate)) " +
           "AND (a.price IS NULL OR a.price >= COALESCE(:priceMin, a.price)) " +
           "AND (a.price IS NULL OR a.price <= COALESCE(:priceMax, a.price))")
    Page<AdEntity> findPublishedFilteredByCategory(@Param("cats") List<String> cats,
                                                    @Param("dateFrom") Date dateFrom,
                                                    @Param("dateTo") Date dateTo,
                                                    @Param("priceMin") Double priceMin,
                                                    @Param("priceMax") Double priceMax,
                                                    Pageable pageable);

    @Query("SELECT a FROM AdEntity a WHERE (a.published IS NULL OR a.published = true) " +
           "AND (a.createDate IS NULL OR a.createDate >= COALESCE(:dateFrom, a.createDate)) " +
           "AND (a.createDate IS NULL OR a.createDate <= COALESCE(:dateTo, a.createDate)) " +
           "AND (a.price IS NULL OR a.price >= COALESCE(:priceMin, a.price)) " +
           "AND (a.price IS NULL OR a.price <= COALESCE(:priceMax, a.price))")
    Page<AdEntity> findPublishedFiltered(
                                         @Param("dateFrom") Date dateFrom,
                                         @Param("dateTo") Date dateTo,
                                         @Param("priceMin") Double priceMin,
                                         @Param("priceMax") Double priceMax,
                                         Pageable pageable);

    @Query("SELECT a FROM AdEntity a WHERE (a.published IS NULL OR a.published = true) " +
           "AND (LOWER(a.adTitle) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(a.adInfo) LIKE LOWER(CONCAT('%', :q, '%'))) " +
           "AND a.category IN :cats " +
           "AND (a.createDate IS NULL OR a.createDate >= COALESCE(:dateFrom, a.createDate)) " +
           "AND (a.createDate IS NULL OR a.createDate <= COALESCE(:dateTo, a.createDate)) " +
           "AND (a.price IS NULL OR a.price >= COALESCE(:priceMin, a.price)) " +
           "AND (a.price IS NULL OR a.price <= COALESCE(:priceMax, a.price))")
    Page<AdEntity> searchPublishedFilteredByCategory(@Param("q") String q,
                                                      @Param("cats") List<String> cats,
                                                      @Param("dateFrom") Date dateFrom,
                                                      @Param("dateTo") Date dateTo,
                                                      @Param("priceMin") Double priceMin,
                                                      @Param("priceMax") Double priceMax,
                                                      Pageable pageable);

    @Query("SELECT a FROM AdEntity a WHERE (a.published IS NULL OR a.published = true) " +
           "AND (LOWER(a.adTitle) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(a.adInfo) LIKE LOWER(CONCAT('%', :q, '%'))) " +
           "AND (a.createDate IS NULL OR a.createDate >= COALESCE(:dateFrom, a.createDate)) " +
           "AND (a.createDate IS NULL OR a.createDate <= COALESCE(:dateTo, a.createDate)) " +
           "AND (a.price IS NULL OR a.price >= COALESCE(:priceMin, a.price)) " +
           "AND (a.price IS NULL OR a.price <= COALESCE(:priceMax, a.price))")
    Page<AdEntity> searchPublishedFiltered(@Param("q") String q,
                                           @Param("dateFrom") Date dateFrom,
                                           @Param("dateTo") Date dateTo,
                                           @Param("priceMin") Double priceMin,
                                           @Param("priceMax") Double priceMax,
                                           Pageable pageable);

    @Query("SELECT a FROM AdEntity a WHERE (a.published IS NULL OR a.published = true) " +
           "AND a.latitude BETWEEN :south AND :north " +
           "AND a.longitude BETWEEN :west AND :east " +
           "AND a.category IN :cats " +
           "AND (a.createDate IS NULL OR a.createDate >= COALESCE(:dateFrom, a.createDate)) " +
           "AND (a.createDate IS NULL OR a.createDate <= COALESCE(:dateTo, a.createDate)) " +
           "AND (a.price IS NULL OR a.price >= COALESCE(:priceMin, a.price)) " +
           "AND (a.price IS NULL OR a.price <= COALESCE(:priceMax, a.price))")
    Page<AdEntity> findPublishedInBoundsByCategory(@Param("north") Double north,
                                                    @Param("south") Double south,
                                                    @Param("east") Double east,
                                                    @Param("west") Double west,
                                                    @Param("cats") List<String> cats,
                                                    @Param("dateFrom") Date dateFrom,
                                                    @Param("dateTo") Date dateTo,
                                                    @Param("priceMin") Double priceMin,
                                                    @Param("priceMax") Double priceMax,
                                                    Pageable pageable);

    @Query("SELECT a FROM AdEntity a WHERE (a.published IS NULL OR a.published = true) " +
           "AND a.latitude BETWEEN :south AND :north " +
           "AND a.longitude BETWEEN :west AND :east " +
           "AND (a.createDate IS NULL OR a.createDate >= COALESCE(:dateFrom, a.createDate)) " +
           "AND (a.createDate IS NULL OR a.createDate <= COALESCE(:dateTo, a.createDate)) " +
           "AND (a.price IS NULL OR a.price >= COALESCE(:priceMin, a.price)) " +
           "AND (a.price IS NULL OR a.price <= COALESCE(:priceMax, a.price))")
    Page<AdEntity> findPublishedInBounds(@Param("north") Double north,
                                         @Param("south") Double south,
                                         @Param("east") Double east,
                                         @Param("west") Double west,
                                         @Param("dateFrom") Date dateFrom,
                                         @Param("dateTo") Date dateTo,
                                         @Param("priceMin") Double priceMin,
                                         @Param("priceMax") Double priceMax,
                                         Pageable pageable);

    @Query("SELECT a FROM AdEntity a WHERE (a.published IS NULL OR a.published = true) " +
           "AND a.latitude BETWEEN :south AND :north " +
           "AND a.longitude BETWEEN :west AND :east " +
           "AND (LOWER(a.adTitle) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(a.adInfo) LIKE LOWER(CONCAT('%', :q, '%'))) " +
           "AND a.category IN :cats " +
           "AND (a.createDate IS NULL OR a.createDate >= COALESCE(:dateFrom, a.createDate)) " +
           "AND (a.createDate IS NULL OR a.createDate <= COALESCE(:dateTo, a.createDate)) " +
           "AND (a.price IS NULL OR a.price >= COALESCE(:priceMin, a.price)) " +
           "AND (a.price IS NULL OR a.price <= COALESCE(:priceMax, a.price))")
    Page<AdEntity> searchPublishedInBoundsByCategory(@Param("q") String q,
                                                      @Param("north") Double north,
                                                      @Param("south") Double south,
                                                      @Param("east") Double east,
                                                      @Param("west") Double west,
                                                      @Param("cats") List<String> cats,
                                                      @Param("dateFrom") Date dateFrom,
                                                      @Param("dateTo") Date dateTo,
                                                      @Param("priceMin") Double priceMin,
                                                      @Param("priceMax") Double priceMax,
                                                      Pageable pageable);

    @Query("SELECT a FROM AdEntity a WHERE (a.published IS NULL OR a.published = true) " +
           "AND a.latitude BETWEEN :south AND :north " +
           "AND a.longitude BETWEEN :west AND :east " +
           "AND (LOWER(a.adTitle) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(a.adInfo) LIKE LOWER(CONCAT('%', :q, '%'))) " +
           "AND (a.createDate IS NULL OR a.createDate >= COALESCE(:dateFrom, a.createDate)) " +
           "AND (a.createDate IS NULL OR a.createDate <= COALESCE(:dateTo, a.createDate)) " +
           "AND (a.price IS NULL OR a.price >= COALESCE(:priceMin, a.price)) " +
           "AND (a.price IS NULL OR a.price <= COALESCE(:priceMax, a.price))")
    Page<AdEntity> searchPublishedInBounds(@Param("q") String q,
                                           @Param("north") Double north,
                                           @Param("south") Double south,
                                           @Param("east") Double east,
                                           @Param("west") Double west,
                                           @Param("dateFrom") Date dateFrom,
                                           @Param("dateTo") Date dateTo,
                                           @Param("priceMin") Double priceMin,
                                           @Param("priceMax") Double priceMax,
                                           Pageable pageable);

    @Modifying
    @Query("DELETE FROM AdEntity a WHERE a.adInfoId IN :ids")
    int deleteByIdIn(@Param("ids") List<Long> ids);

    @Modifying
    @Query("UPDATE AdEntity a SET a.published = false WHERE a.expireDate < CURRENT_TIMESTAMP AND (a.published IS NULL OR a.published = true)")
    int expireOverdueAds();
}
