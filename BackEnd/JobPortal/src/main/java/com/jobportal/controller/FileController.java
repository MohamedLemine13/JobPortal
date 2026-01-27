package com.jobportal.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FileController {

    @Value("${file.upload-dir}")
    private String uploadDir;

    /**
     * Download a file by its path
     * Example: /api/files/download?path=/uploads/cvs/user-id/file.pdf
     */
    @GetMapping("/download")
    public ResponseEntity<Resource> downloadFile(@RequestParam String path) {
        log.info("File download request for path: {}", path);
        try {
            // Security check: ensure path starts with /uploads/
            if (!path.startsWith("/uploads/")) {
                log.warn("Invalid path - doesn't start with /uploads/: {}", path);
                return ResponseEntity.badRequest().build();
            }

            // Remove /uploads/ prefix to get relative path
            String relativePath = path.substring("/uploads/".length());
            Path filePath = Paths.get(uploadDir).resolve(relativePath).normalize();

            // Security check: ensure the resolved path is within upload directory
            if (!filePath.startsWith(Paths.get(uploadDir).normalize())) {
                return ResponseEntity.badRequest().build();
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                log.error("File not found or not readable: {}", path);
                return ResponseEntity.notFound().build();
            }

            // Determine content type
            String contentType = determineContentType(path);

            // Get filename for Content-Disposition header
            String filename = filePath.getFileName().toString();

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);

        } catch (MalformedURLException e) {
            log.error("Error loading file: {}", path, e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * View a file in browser (for PDFs, images)
     */
    @GetMapping("/view")
    public ResponseEntity<Resource> viewFile(@RequestParam String path) {
        return downloadFile(path); // Same as download but with inline disposition
    }

    private String determineContentType(String path) {
        String lowerPath = path.toLowerCase();
        if (lowerPath.endsWith(".pdf")) {
            return "application/pdf";
        } else if (lowerPath.endsWith(".jpg") || lowerPath.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (lowerPath.endsWith(".png")) {
            return "image/png";
        } else if (lowerPath.endsWith(".webp")) {
            return "image/webp";
        } else if (lowerPath.endsWith(".doc")) {
            return "application/msword";
        } else if (lowerPath.endsWith(".docx")) {
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        }
        return "application/octet-stream";
    }
}
