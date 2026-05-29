package com.example.sampleApp.features.auth;

import com.example.sampleApp.features.userRegister.UserEntity;

public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private UserResponse user;

    public AuthResponse() {}

    public AuthResponse(String accessToken, String refreshToken, UserEntity user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.user = new UserResponse(user);
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public UserResponse getUser() {
        return user;
    }

    public void setUser(UserResponse user) {
        this.user = user;
    }

    public static class UserResponse {
        private Long id;
        private String email;
        private String name;
        private String role;
        private boolean advancedOrNot;
        private int level;
        private int noOfAd;
        private int telNumber;

        public UserResponse() {}

        public UserResponse(UserEntity entity) {
            this.id = entity.getConsumerId();
            this.email = entity.getEmail();
            this.name = entity.getName();
            this.role = entity.getRole();
            this.advancedOrNot = entity.isAdvancedOrNot();
            this.level = entity.getLevel();
            this.noOfAd = entity.getNoOfAd();
            this.telNumber = entity.getTelNumber();
        }

        public Long getId() {
            return id;
        }

        public String getEmail() {
            return email;
        }

        public String getName() {
            return name;
        }

        public String getRole() {
            return role;
        }

        public boolean isAdvancedOrNot() {
            return advancedOrNot;
        }

        public int getLevel() {
            return level;
        }

        public int getNoOfAd() {
            return noOfAd;
        }

        public int getTelNumber() {
            return telNumber;
        }
    }
}
