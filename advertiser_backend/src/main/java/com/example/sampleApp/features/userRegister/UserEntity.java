package com.example.sampleApp.features.userRegister;

import com.example.sampleApp.features.AdFeature.AdEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.util.Date;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "users")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "consumer_id")
    private Long consumerId;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String role;

    @Column(name = "user_name", nullable = false)
    private String name;

    @Column(name = "tel_no", nullable = false)
    private int telNumber;

    @Column(name = "age")
    private int age;

    @Column(name = "advanced_or_not", nullable = false)
    private boolean advancedOrNot;

    @Column(name = "level")
    private int level;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "register_date", nullable = false)
    private Date date;

    @Column(name = "no_of_advertisement")
    private int noOfAd;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "password", nullable = false)
    private String password;

    // ONE USER -> MANY ADS
    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AdEntity> ads;

    // Getters and the Setters

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getConsumerId() {
        return consumerId;
    }

    public void setConsumerId(Long consumerId) {
        this.consumerId = consumerId;
    }

    public int getTelNumber() {
        return telNumber;
    }

    public void setTelNumber(int telNumber) {
        this.telNumber = telNumber;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public boolean isAdvancedOrNot() {
        return advancedOrNot;
    }

    public void setAdvancedOrNot(boolean advancedOrNot) {
        this.advancedOrNot = advancedOrNot;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public int getNoOfAd() {
        return noOfAd;
    }

    public void setNoOfAd(int noOfAd) {
        this.noOfAd = noOfAd;
    }

    public List<AdEntity> getAds() {
        return ads;
    }

    public void setAds(List<AdEntity> ads) {
        this.ads = ads;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}