package com.example.sampleApp.features.conversation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<ConversationEntity, Long> {

    Optional<ConversationEntity> findByAdInfoIdAndIdIn(Long adInfoId, List<Long> ids);

    @Query(value = "SELECT c.* FROM conversations c " +
           "JOIN conversation_members cm ON cm.conversation_id = c.id " +
           "WHERE cm.user_id = :userId " +
           "ORDER BY c.updated_at DESC", nativeQuery = true)
    List<ConversationEntity> findByMemberUserId(@Param("userId") Long userId);

    @Query(value = "SELECT c.id FROM conversations c " +
           "JOIN conversation_members cm ON cm.conversation_id = c.id " +
           "WHERE c.ad_info_id = :adInfoId AND cm.user_id IN (:userIds) " +
           "GROUP BY c.id HAVING COUNT(DISTINCT cm.user_id) = :count", nativeQuery = true)
    List<Long> findExistingConversation(@Param("adInfoId") Long adInfoId,
                                         @Param("userIds") List<Long> userIds,
                                         @Param("count") int count);
}
