package com.example.sampleApp.features.conversation;

import java.util.Date;
import java.util.List;

public class ConversationDetailDto {
    private Long id;
    private Long adInfoId;
    private String adTitle;
    private List<MessageDto> messages;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAdInfoId() { return adInfoId; }
    public void setAdInfoId(Long adInfoId) { this.adInfoId = adInfoId; }
    public String getAdTitle() { return adTitle; }
    public void setAdTitle(String adTitle) { this.adTitle = adTitle; }
    public List<MessageDto> getMessages() { return messages; }
    public void setMessages(List<MessageDto> messages) { this.messages = messages; }
}
