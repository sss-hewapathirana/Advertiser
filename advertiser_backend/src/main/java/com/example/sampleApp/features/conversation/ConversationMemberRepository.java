package com.example.sampleApp.features.conversation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationMemberRepository extends JpaRepository<ConversationMemberEntity, Long> {

    List<ConversationMemberEntity> findByConversationId(Long conversationId);

    Optional<ConversationMemberEntity> findByConversationIdAndUserId(Long conversationId, Long userId);

    List<ConversationMemberEntity> findByUserId(Long userId);
}
