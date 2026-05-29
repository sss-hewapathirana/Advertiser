package com.example.sampleApp.features.conversation;

import com.example.sampleApp.features.AdFeature.AdEntity;
import com.example.sampleApp.features.AdFeature.AdService;
import com.example.sampleApp.features.userRegister.UserEntity;
import com.example.sampleApp.features.userRegister.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/conversations")
public class ConversationController {

    private final ConversationRepository conversationRepository;
    private final ConversationMemberRepository memberRepository;
    private final MessageRepository messageRepository;
    private final AdService adService;
    private final UserRepository userRepository;

    public ConversationController(ConversationRepository conversationRepository,
                                   ConversationMemberRepository memberRepository,
                                   MessageRepository messageRepository,
                                   AdService adService,
                                   UserRepository userRepository) {
        this.conversationRepository = conversationRepository;
        this.memberRepository = memberRepository;
        this.messageRepository = messageRepository;
        this.adService = adService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> createConversation(
            @AuthenticationPrincipal UserEntity currentUser,
            @RequestBody Map<String, String> body) {
        String adInfoIdStr = body.get("adInfoId");
        String messageBody = body.get("body");

        if (adInfoIdStr == null || messageBody == null || messageBody.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "adInfoId and body are required"));
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

        Long senderId = currentUser.getConsumerId();
        Long publisherId = ad.getUser().getConsumerId();

        if (senderId.equals(publisherId)) {
            return ResponseEntity.badRequest().body(Map.of("error", "You cannot message your own ad"));
        }

        List<Long> userIds = Arrays.asList(senderId, publisherId);
        List<Long> existingIds = conversationRepository.findExistingConversation(adInfoId, userIds, 2);

        Long conversationId;
        if (!existingIds.isEmpty()) {
            conversationId = existingIds.get(0);
        } else {
            ConversationEntity conv = new ConversationEntity();
            conv.setAdInfoId(adInfoId);
            conv = conversationRepository.save(conv);
            conversationId = conv.getId();

            ConversationMemberEntity member1 = new ConversationMemberEntity();
            member1.setConversationId(conversationId);
            member1.setUserId(senderId);
            member1.setLastReadAt(new Date());
            memberRepository.save(member1);

            ConversationMemberEntity member2 = new ConversationMemberEntity();
            member2.setConversationId(conversationId);
            member2.setUserId(publisherId);
            memberRepository.save(member2);
        }

        MessageEntity msg = new MessageEntity();
        msg.setConversationId(conversationId);
        msg.setSenderId(senderId);
        msg.setBody(messageBody.trim());
        messageRepository.save(msg);

        conversationRepository.findById(conversationId).ifPresent(conv -> {
            conv.setUpdatedAt(new Date());
            conversationRepository.save(conv);
        });

        return ResponseEntity.ok(Map.of(
            "conversationId", conversationId,
            "message", "Message sent"
        ));
    }

    @GetMapping
    public ResponseEntity<?> getConversations() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserEntity currentUser)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        List<ConversationEntity> conversations = conversationRepository.findByMemberUserId(currentUser.getConsumerId());
        List<ConversationListDto> dtos = new ArrayList<>();

        for (ConversationEntity conv : conversations) {
            ConversationListDto dto = new ConversationListDto();
            dto.setId(conv.getId());
            dto.setAdInfoId(conv.getAdInfoId());

            try {
                AdEntity ad = adService.getAdById(conv.getAdInfoId());
                dto.setAdTitle(ad.getAdTitle());
            } catch (RuntimeException e) {
                dto.setAdTitle("Unknown");
            }

            MessageEntity lastMsg = messageRepository.findTopByConversationIdOrderByCreatedAtDesc(conv.getId());
            if (lastMsg != null) {
                dto.setLastMessage(lastMsg.getBody());
                dto.setLastMessageAt(lastMsg.getCreatedAt());
            }

            ConversationMemberEntity myMembership = memberRepository
                .findByConversationIdAndUserId(conv.getId(), currentUser.getConsumerId())
                .orElse(null);

            if (myMembership != null && myMembership.getLastReadAt() != null) {
                dto.setUnreadCount(
                    messageRepository.countByConversationIdAndCreatedAtAfter(conv.getId(), myMembership.getLastReadAt())
                );
            } else {
                dto.setUnreadCount(messageRepository.findByConversationIdOrderByCreatedAtAsc(conv.getId()).size());
            }

            List<ConversationMemberEntity> members = memberRepository.findByConversationId(conv.getId());
            members.stream()
                .filter(m -> !m.getUserId().equals(currentUser.getConsumerId()))
                .findFirst()
                .ifPresent(other -> userRepository.findById(other.getUserId())
                    .ifPresent(u -> dto.setOtherUserName(u.getName())));

            dtos.add(dto);
        }

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getConversationDetail(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserEntity currentUser)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        ConversationEntity conv = conversationRepository.findById(id).orElse(null);
        if (conv == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Conversation not found"));
        }

        boolean isMember = memberRepository.findByConversationIdAndUserId(id, currentUser.getConsumerId()).isPresent();
        if (!isMember) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Not a member of this conversation"));
        }

        ConversationDetailDto dto = new ConversationDetailDto();
        dto.setId(conv.getId());
        dto.setAdInfoId(conv.getAdInfoId());

        try {
            AdEntity ad = adService.getAdById(conv.getAdInfoId());
            dto.setAdTitle(ad.getAdTitle());
        } catch (RuntimeException e) {
            dto.setAdTitle("Unknown");
        }

        List<MessageEntity> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(id);
        List<MessageDto> messageDtos = messages.stream().map(msg -> {
            MessageDto md = new MessageDto();
            md.setId(msg.getId());
            md.setSenderId(msg.getSenderId());
            md.setBody(msg.getBody());
            md.setCreatedAt(msg.getCreatedAt());
            userRepository.findById(msg.getSenderId())
                .ifPresent(u -> md.setSenderName(u.getName()));
            return md;
        }).collect(Collectors.toList());
        dto.setMessages(messageDtos);

        memberRepository.findByConversationIdAndUserId(id, currentUser.getConsumerId())
            .ifPresent(m -> {
                m.setLastReadAt(new Date());
                memberRepository.save(m);
            });

        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<?> sendMessage(
            @PathVariable Long id,
            @AuthenticationPrincipal UserEntity currentUser,
            @RequestBody Map<String, String> body) {
        String messageBody = body.get("body");
        if (messageBody == null || messageBody.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "body is required"));
        }

        ConversationEntity conv = conversationRepository.findById(id).orElse(null);
        if (conv == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Conversation not found"));
        }

        boolean isMember = memberRepository.findByConversationIdAndUserId(id, currentUser.getConsumerId()).isPresent();
        if (!isMember) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Not a member of this conversation"));
        }

        MessageEntity msg = new MessageEntity();
        msg.setConversationId(id);
        msg.setSenderId(currentUser.getConsumerId());
        msg.setBody(messageBody.trim());
        messageRepository.save(msg);

        conv.setUpdatedAt(new Date());
        conversationRepository.save(conv);

        MessageDto md = new MessageDto();
        md.setId(msg.getId());
        md.setSenderId(msg.getSenderId());
        md.setSenderName(currentUser.getName());
        md.setBody(msg.getBody());
        md.setCreatedAt(msg.getCreatedAt());

        return ResponseEntity.ok(md);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserEntity currentUser)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        memberRepository.findByConversationIdAndUserId(id, currentUser.getConsumerId())
            .ifPresent(m -> {
                m.setLastReadAt(new Date());
                memberRepository.save(m);
            });

        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }
}
