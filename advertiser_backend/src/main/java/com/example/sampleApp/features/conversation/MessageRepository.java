package com.example.sampleApp.features.conversation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<MessageEntity, Long> {

    List<MessageEntity> findByConversationIdOrderByCreatedAtAsc(Long conversationId);

    MessageEntity findTopByConversationIdOrderByCreatedAtDesc(Long conversationId);

    long countByConversationIdAndCreatedAtAfter(Long conversationId, java.util.Date after);
}
