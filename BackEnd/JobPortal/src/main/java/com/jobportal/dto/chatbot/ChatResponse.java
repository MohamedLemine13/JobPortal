package com.jobportal.dto.chatbot;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

public final class ChatResponse {

        private final String answer;
        private final List<Source> sources;

        @JsonProperty("documents_retrieved")
        private final int documentsRetrieved;

        @JsonProperty("documents_used")
        private final int documentsUsed;

        private final boolean error;

        @JsonProperty("error_message")
        private final String errorMessage;

        public ChatResponse(
                        @JsonProperty("answer") String answer,
                        @JsonProperty("sources") List<Source> sources,
                        @JsonProperty("documents_retrieved") Integer documentsRetrieved,
                        @JsonProperty("documents_used") Integer documentsUsed,
                        @JsonProperty("error") Boolean error,
                        @JsonProperty("error_message") String errorMessage) {
                this.answer = answer != null ? answer : "";

                this.sources = Collections.unmodifiableList(
                                Objects.requireNonNullElse(sources, List.of()));

                this.documentsRetrieved = documentsRetrieved != null ? documentsRetrieved : 0;

                this.documentsUsed = documentsUsed != null ? documentsUsed : 0;

                this.error = error != null && error;
                this.errorMessage = errorMessage;
        }

        public String getAnswer() {
                return answer;
        }

        public List<Source> getSources() {
                return sources;
        }

        public int getDocumentsRetrieved() {
                return documentsRetrieved;
        }

        public int getDocumentsUsed() {
                return documentsUsed;
        }

        public boolean isError() {
                return error;
        }

        public String getErrorMessage() {
                return errorMessage;
        }
}
