package com.example.sampleApp.features.comment;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class CommentDto {
    private Long id;
    private Long adInfoId;
    private Long consumerId;
    private String userName;
    private Long parentId;
    private String body;
    private Date createdAt;
    private List<CommentDto> replies = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAdInfoId() { return adInfoId; }
    public void setAdInfoId(Long adInfoId) { this.adInfoId = adInfoId; }
    public Long getConsumerId() { return consumerId; }
    public void setConsumerId(Long consumerId) { this.consumerId = consumerId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    public List<CommentDto> getReplies() { return replies; }
    public void setReplies(List<CommentDto> replies) { this.replies = replies; }
}
