package com.example.sampleApp.features.review;

public class ReviewStatsDto {
    private double averageRating;
    private int reviewCount;

    public double getAverageRating() { return averageRating; }
    public void setAverageRating(double averageRating) { this.averageRating = averageRating; }
    public int getReviewCount() { return reviewCount; }
    public void setReviewCount(int reviewCount) { this.reviewCount = reviewCount; }
}
