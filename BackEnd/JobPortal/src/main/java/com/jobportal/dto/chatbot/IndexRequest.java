package com.jobportal.dto.chatbot;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

public final class IndexRequest {

    @JsonProperty("file_paths")
    private final List<String> filePaths;
    
    @JsonProperty("collection_name")
    private final String collectionName;
    
    @JsonProperty("chunk_size")
    private final int chunkSize;
    
    @JsonProperty("chunk_overlap")
    private final int chunkOverlap;

    public IndexRequest(
            List<String> filePaths,
            String collectionName,
            Integer chunkSize,
            Integer chunkOverlap
    ) {
        this.filePaths = Collections.unmodifiableList(
                Objects.requireNonNull(filePaths, "filePaths must not be null")
        );

        this.collectionName = collectionName != null ? collectionName : "documents";
        this.chunkSize = chunkSize != null && chunkSize > 0 ? chunkSize : 1000;
        this.chunkOverlap = chunkOverlap != null && chunkOverlap >= 0 ? chunkOverlap : 200;
    }

    public List<String> getFilePaths() { return filePaths; }
    public String getCollectionName() { return collectionName; }
    public int getChunkSize() { return chunkSize; }
    public int getChunkOverlap() { return chunkOverlap; }
    

    public static IndexRequest of(List<String> filePaths) {
        return new IndexRequest(filePaths, null, null, null);
    }
}
