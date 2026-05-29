package com.example.sampleApp.features.conversation;

import java.util.Date;

public class ConversationListDto {
    private Long id;
    private Long adInfoId;
    private String adTitle;
    private String lastMessage;
    private Date lastMessageAt;
    private long unreadCount;
    private String otherUserName;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAdInfoId() { return adInfoId; }
    public void setAdInfoId(Long adInfoId) { this.adInfoId = adInfoId; }
    public String getAdTitle() { return adTitle; }
    public void setAdTitle(String adTitle) { this.adTitle = adTitle; }
    public String getLastMessage() { return lastMessage; }
    public void setLastMessage(String lastMessage) { this.lastMessage = lastMessage; }
    public Date getLastMessageAt() { return lastMessageAt; }
    public void setLastMessageAt(Date lastMessageAt) { this.lastMessageAt = lastMessageAt; }
    public long getUnreadCount() { return unreadCount; }
    public void setUnreadCount(long unreadCount) { this.unreadCount = unreadCount; }
    public String getOtherUserName() { return otherUserName; }
    public void setOtherUserName(String otherUserName) { this.otherUserName = otherUserName; }
}
