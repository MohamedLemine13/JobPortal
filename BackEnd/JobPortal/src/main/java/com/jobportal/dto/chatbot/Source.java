package com.jobportal.dto.chatbot;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Source {

    @JsonProperty("file_name")
    private String fileName;

    @JsonProperty("page")
    private Integer page;

    @JsonProperty("chunk_index")
    private Integer chunkIndex;

    @JsonProperty("content")
    private String content;

    @JsonProperty("score")
    private Double score;

    // Default constructor for JSON deserialization
    public Source() {
    }

    public Source(String fileName, Integer page, Integer chunkIndex, String content, Double score) {
        this.fileName = fileName;
        this.page = page;
        this.chunkIndex = chunkIndex;
        this.content = content;
        this.score = score;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public Integer getPage() {
        return page;
    }

    public void setPage(Integer page) {
        this.page = page;
    }

    public Integer getChunkIndex() {
        return chunkIndex;
    }

    public void setChunkIndex(Integer chunkIndex) {
        this.chunkIndex = chunkIndex;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }
}
