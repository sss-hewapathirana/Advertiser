package com.example.sampleApp.features.inquiry;

import java.util.Date;

public class InquiryDto {
    private Long id;
    private Long adInfoId;
    private String adTitle;
    private Long publisherId;
    private Long senderId;
    private String senderName;
    private String senderEmail;
    private String message;
    private String reply;
    private boolean read;
    private Date createdAt;
    private Date repliedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAdInfoId() { return adInfoId; }
    public void setAdInfoId(Long adInfoId) { this.adInfoId = adInfoId; }
    public String getAdTitle() { return adTitle; }
    public void setAdTitle(String adTitle) { this.adTitle = adTitle; }
    public Long getPublisherId() { return publisherId; }
    public void setPublisherId(Long publisherId) { this.publisherId = publisherId; }
    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }
    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }
    public String getSenderEmail() { return senderEmail; }
    public void setSenderEmail(String senderEmail) { this.senderEmail = senderEmail; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getReply() { return reply; }
    public void setReply(String reply) { this.reply = reply; }
    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    public Date getRepliedAt() { return repliedAt; }
    public void setRepliedAt(Date repliedAt) { this.repliedAt = repliedAt; }
}
