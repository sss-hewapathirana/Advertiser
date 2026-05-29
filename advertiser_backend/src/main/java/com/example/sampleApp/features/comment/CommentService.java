package com.example.sampleApp.features.comment;

import com.example.sampleApp.features.AdFeature.AdEntity;
import com.example.sampleApp.features.AdFeature.AdRepository;
import com.example.sampleApp.features.userRegister.UserEntity;
import com.example.sampleApp.features.userRegister.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final AdRepository adRepository;
    private final UserRepository userRepository;

    public CommentService(CommentRepository commentRepository, AdRepository adRepository, UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.adRepository = adRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CommentDto createComment(Long adInfoId, Long consumerId, String body, Long parentId) {
        if (body == null || body.trim().isEmpty()) {
            throw new IllegalArgumentException("Comment body is required");
        }

        AdEntity ad = adRepository.findById(adInfoId)
                .orElseThrow(() -> new RuntimeException("Ad not found"));

        CommentEntity comment = new CommentEntity();
        comment.setAd(ad);
        comment.setUser(userRepository.getReferenceById(consumerId));
        comment.setBody(body.trim());

        if (parentId != null) {
            CommentEntity parent = commentRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            comment.setParent(parent);
        }

        comment = commentRepository.save(comment);
        return toDto(comment);
    }

    @Transactional(readOnly = true)
    public Page<CommentDto> getComments(Long adInfoId, Pageable pageable) {
        Page<CommentEntity> page = commentRepository.findByAd_AdInfoIdAndParentIsNullOrderByCreatedAtDesc(adInfoId, pageable);
        List<CommentDto> dtos = page.getContent().stream().map(this::toDtoWithReplies).collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, page.getTotalElements());
    }

    @Transactional
    public void deleteComment(Long commentId, Long consumerId) {
        CommentEntity comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!comment.getUser().getConsumerId().equals(consumerId)) {
            throw new RuntimeException("You can only delete your own comment");
        }
        commentRepository.delete(comment);
    }

    private CommentDto toDto(CommentEntity entity) {
        CommentDto dto = new CommentDto();
        dto.setId(entity.getId());
        dto.setAdInfoId(entity.getAd().getAdInfoId());
        dto.setConsumerId(entity.getUser().getConsumerId());
        dto.setUserName(entity.getUser().getName() != null ? entity.getUser().getName() : entity.getUser().getEmail());
        dto.setParentId(entity.getParent() != null ? entity.getParent().getId() : null);
        dto.setBody(entity.getBody());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    private CommentDto toDtoWithReplies(CommentEntity entity) {
        CommentDto dto = toDto(entity);
        List<CommentEntity> replies = commentRepository.findByAd_AdInfoIdAndParent_IdOrderByCreatedAtAsc(
                entity.getAd().getAdInfoId(), entity.getId());
        dto.setReplies(replies.stream().map(this::toDto).collect(Collectors.toList()));
        return dto;
    }
}
