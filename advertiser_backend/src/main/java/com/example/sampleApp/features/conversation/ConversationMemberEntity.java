package com.example.sampleApp.features.conversation;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "conversation_members")
public class ConversationMemberEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "conversation_id", nullable = false)
    private Long conversationId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "last_read_at")
    private Date lastReadAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Date getLastReadAt() { return lastReadAt; }
    public void setLastReadAt(Date lastReadAt) { this.lastReadAt = lastReadAt; }
}
