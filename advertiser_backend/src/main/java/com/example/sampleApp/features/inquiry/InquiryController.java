package com.example.sampleApp.features.inquiry;

import com.example.sampleApp.features.AdFeature.AdEntity;
import com.example.sampleApp.features.AdFeature.AdService;
import com.example.sampleApp.features.userRegister.UserEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/inquiries")
public class InquiryController {

    private final InquiryRepository inquiryRepository;
    private final AdService adService;

    public InquiryController(InquiryRepository inquiryRepository, AdService adService) {
        this.inquiryRepository = inquiryRepository;
        this.adService = adService;
    }

    @PostMapping
    public ResponseEntity<?> sendInquiry(
            @AuthenticationPrincipal UserEntity currentUser,
            @RequestBody Map<String, String> body) {
        String adInfoIdStr = body.get("adInfoId");
        String message = body.get("message");

        if (adInfoIdStr == null || message == null || message.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ad ID and message are required"));
        }

        Long adInfoId;
        try {
            adInfoId = Long.parseLong(adInfoIdStr);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid ad ID"));
        }

        AdEntity ad;
        try {
            ad = adService.getAdById(adInfoId);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Advertisement not found"));
        }

        InquiryEntity inquiry = new InquiryEntity();
        inquiry.setAdInfoId(adInfoId);
        inquiry.setPublisherId(ad.getUser().getConsumerId());
        inquiry.setSenderId(currentUser.getConsumerId());
        inquiry.setSenderName(currentUser.getName());
        inquiry.setSenderEmail(currentUser.getEmail());
        inquiry.setMessage(message.trim());
        inquiry.setCreatedAt(new Date());
        inquiry.setRead(false);

        inquiryRepository.save(inquiry);

        return ResponseEntity.ok(Map.of("message", "Inquiry sent successfully"));
    }

    @GetMapping
    public ResponseEntity<?> getInquiries(@RequestParam(required = false) Long adId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserEntity currentUser)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        List<InquiryEntity> inquiries;
        if (adId != null) {
            inquiries = inquiryRepository.findAllByAdInfoIdAndPublisherIdOrderByCreatedAtDesc(adId, currentUser.getConsumerId());
        } else {
            inquiries = inquiryRepository.findAllByPublisherIdOrderByCreatedAtDesc(currentUser.getConsumerId());
        }

        List<InquiryDto> dtos = new ArrayList<>();
        for (InquiryEntity inq : inquiries) {
            InquiryDto dto = new InquiryDto();
            dto.setId(inq.getId());
            dto.setAdInfoId(inq.getAdInfoId());
            try {
                AdEntity ad = adService.getAdById(inq.getAdInfoId());
                dto.setAdTitle(ad.getAdTitle());
            } catch (RuntimeException e) {
                dto.setAdTitle("Unknown");
            }
            dto.setPublisherId(inq.getPublisherId());
            dto.setSenderId(inq.getSenderId());
            dto.setSenderName(inq.getSenderName());
            dto.setSenderEmail(inq.getSenderEmail());
            dto.setMessage(inq.getMessage());
            dto.setReply(inq.getReply());
            dto.setRead(inq.isRead());
            dto.setCreatedAt(inq.getCreatedAt());
            dto.setRepliedAt(inq.getRepliedAt());
            dtos.add(dto);
        }

        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/{id}/reply")
    public ResponseEntity<?> replyToInquiry(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserEntity currentUser)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        InquiryEntity inquiry = inquiryRepository.findById(id).orElse(null);
        if (inquiry == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Inquiry not found"));
        }

        if (!inquiry.getPublisherId().equals(currentUser.getConsumerId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Not your inquiry"));
        }

        String reply = body.get("reply");
        if (reply == null || reply.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Reply cannot be empty"));
        }

        inquiry.setReply(reply.trim());
        inquiry.setRepliedAt(new Date());
        inquiry.setRead(true);
        inquiryRepository.save(inquiry);

        return ResponseEntity.ok(Map.of("message", "Reply sent"));
    }
}
