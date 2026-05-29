package com.example.sampleApp;

import com.example.sampleApp.features.auth.*;
import com.example.sampleApp.features.userRegister.UserEntity;
import com.example.sampleApp.features.userRegister.UserRepository;
import com.example.sampleApp.features.userRegister.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    public AuthController(
            UserService userService,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository) {

        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<?> register(
            @RequestBody UserEntity user) {

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email already registered"));
        }

        user.setPassword(
                passwordEncoder.encode(user.getPassword()));
        user.setRole("ROLE_USER");

        UserEntity saved = userService.saveUser(user);

        String accessToken = jwtService.generateAccessToken(
                saved.getConsumerId(), saved.getEmail(), saved.getRole());
        String refreshToken = createAndSaveRefreshToken(saved.getConsumerId());

        return ResponseEntity.ok(new AuthResponse(accessToken, refreshToken, saved));
    }

    @PostMapping("/login")
    @Transactional
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        UserEntity user = userRepository
                .findByEmail(request.getEmail())
                .orElse(null);

        if (user == null ||
                !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password"));
        }

        String accessToken = jwtService.generateAccessToken(
                user.getConsumerId(), user.getEmail(), user.getRole());
        String refreshToken = createAndSaveRefreshToken(user.getConsumerId());

        return ResponseEntity.ok(new AuthResponse(accessToken, refreshToken, user));
    }

    @PostMapping("/refresh")
    @Transactional
    public ResponseEntity<?> refresh(
            @RequestBody Map<String, String> body) {

        String token = body.get("refreshToken");

        if (token == null) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", "refreshToken is required"));
        }

        RefreshTokenEntity stored = refreshTokenRepository.findByToken(token).orElse(null);

        if (stored == null || stored.isRevoked() ||
                stored.getExpiryDate().before(new Date())) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired refresh token"));
        }

        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        UserEntity user = userService.getUserById(stored.getUserId());

        String newAccessToken = jwtService.generateAccessToken(
                user.getConsumerId(), user.getEmail(), user.getRole());
        String newRefreshToken = createAndSaveRefreshToken(user.getConsumerId());

        return ResponseEntity.ok(new AuthResponse(newAccessToken, newRefreshToken, user));
    }

    @PostMapping("/logout")
    @Transactional
    public ResponseEntity<?> logout(
            @RequestBody Map<String, String> body) {

        String token = body.get("refreshToken");
        if (token != null) {
            RefreshTokenEntity stored = refreshTokenRepository.findByToken(token).orElse(null);
            if (stored != null) {
                stored.setRevoked(true);
                refreshTokenRepository.save(stored);
            }
        }

        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }

    @PutMapping("/profile")
    @Transactional
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserEntity currentUser)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        UserEntity user = userRepository.findById(currentUser.getConsumerId()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        }

        if (body.containsKey("name")) {
            user.setName(body.get("name"));
        }
        if (body.containsKey("telNumber")) {
            try {
                user.setTelNumber(Integer.parseInt(body.get("telNumber")));
            } catch (NumberFormatException ignored) {}
        }
        if (body.containsKey("avatarUrl")) {
            user.setAvatarUrl(body.get("avatarUrl"));
        }

        userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(user.getConsumerId(), user.getEmail(), user.getRole());
        String refreshToken = createAndSaveRefreshToken(user.getConsumerId());
        return ResponseEntity.ok(new AuthResponse(accessToken, refreshToken, user));
    }

    @PutMapping("/password")
    @Transactional
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserEntity currentUser)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        if (currentPassword == null || newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid password. Minimum 6 characters."));
        }

        UserEntity user = userRepository.findById(currentUser.getConsumerId()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        }

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Current password is incorrect"));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @PostMapping("/upgrade")
    @Transactional
    public ResponseEntity<?> upgrade() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserEntity currentUser)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }

        if (currentUser.isAdvancedOrNot()) {
            return ResponseEntity.ok(new AuthResponse(
                    jwtService.generateAccessToken(currentUser.getConsumerId(), currentUser.getEmail(), currentUser.getRole()),
                    createAndSaveRefreshToken(currentUser.getConsumerId()),
                    currentUser));
        }

        currentUser.setAdvancedOrNot(true);
        if (currentUser.getLevel() < 1) {
            currentUser.setLevel(1);
        }
        userRepository.save(currentUser);

        String accessToken = jwtService.generateAccessToken(
                currentUser.getConsumerId(), currentUser.getEmail(), currentUser.getRole());
        String refreshToken = createAndSaveRefreshToken(currentUser.getConsumerId());

        return ResponseEntity.ok(new AuthResponse(accessToken, refreshToken, currentUser));
    }

    private String createAndSaveRefreshToken(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);

        long refreshExpMs = 7 * 24 * 60 * 60 * 1000L;
        String token = jwtService.generateRefreshToken(userId);

        RefreshTokenEntity entity = new RefreshTokenEntity(
                userId, token, new Date(System.currentTimeMillis() + refreshExpMs));

        refreshTokenRepository.save(entity);
        return token;
    }
}
