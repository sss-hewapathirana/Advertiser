package com.example.sampleApp.features.review;

import com.example.sampleApp.features.AdFeature.AdEntity;
import com.example.sampleApp.features.userRegister.UserEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "ad_reviews", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"ad_info_id", "consumer_id"})
})
public class ReviewEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ad_info_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private AdEntity ad;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consumer_id", nullable = false)
    @JsonIgnoreProperties({"password", "ads", "hibernateLazyInitializer", "handler"})
    private UserEntity user;

    @Column(nullable = false)
    private int rating;

    @Column(length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String reviewText;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at", nullable = false, updatable = false)
    private Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "updated_at")
    private Date updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public AdEntity getAd() { return ad; }
    public void setAd(AdEntity ad) { this.ad = ad; }
    public UserEntity getUser() { return user; }
    public void setUser(UserEntity user) { this.user = user; }
    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getReviewText() { return reviewText; }
    public void setReviewText(String reviewText) { this.reviewText = reviewText; }
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }
}
