package com.jobportal.dto.chatbot;

import com.fasterxml.jackson.annotation.JsonProperty;

public final class IndexResponse {

    private final boolean success;
    private final String message;
    
    @JsonProperty("indexed_count")
    private final int indexedCount;
    
    @JsonProperty("files_processed")
    private final int filesProcessed;

    public IndexResponse(
            @JsonProperty("success") boolean success,
            @JsonProperty("message") String message,
            @JsonProperty("indexed_count") Integer indexedCount,
            @JsonProperty("files_processed") Integer filesProcessed
    ) {
        this.success = success;
        this.message = message != null ? message : "";
        this.indexedCount = indexedCount != null ? Math.max(0, indexedCount) : 0;
        this.filesProcessed = filesProcessed != null ? Math.max(0, filesProcessed) : 0;
    }

    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public int getIndexedCount() { return indexedCount; }
    public int getFilesProcessed() { return filesProcessed; }
}
