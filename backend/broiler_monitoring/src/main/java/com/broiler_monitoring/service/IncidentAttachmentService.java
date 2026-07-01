package com.broiler_monitoring.service;

import com.broiler_monitoring.config.IncidentAttachmentStorageProperties;
import com.broiler_monitoring.dto.IncidentAttachmentResponse;
import com.broiler_monitoring.entity.IncidentAttachment;
import com.broiler_monitoring.repository.IncidentAttachmentRepository;
import com.broiler_monitoring.repository.IncidentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
public class IncidentAttachmentService {

    private final IncidentRepository incidentRepository;
    private final IncidentAttachmentRepository attachmentRepository;
    private final S3Client s3Client;
    private final IncidentAttachmentStorageProperties properties;

    public IncidentAttachmentService(
            IncidentRepository incidentRepository,
            IncidentAttachmentRepository attachmentRepository,
            S3Client incidentAttachmentS3Client,
            IncidentAttachmentStorageProperties properties
    ) {
        this.incidentRepository = incidentRepository;
        this.attachmentRepository = attachmentRepository;
        this.s3Client = incidentAttachmentS3Client;
        this.properties = properties;
    }

    public List<IncidentAttachmentResponse> findByIncidentId(UUID incidentId) {
        ensureIncidentExists(incidentId);
        return attachmentRepository.findByIncidentIdOrderByCreatedAtDesc(incidentId)
                .stream()
                .map(IncidentAttachmentResponse::from)
                .toList();
    }

    public List<IncidentAttachmentResponse> upload(UUID incidentId, List<MultipartFile> files) {
        ensureIncidentExists(incidentId);

        if (files == null || files.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one file is required");
        }

        return files.stream()
                .map(file -> uploadOne(incidentId, file))
                .map(IncidentAttachmentResponse::from)
                .toList();
    }

    public AttachmentDownload openAttachment(UUID incidentId, UUID attachmentId) {
        ensureIncidentExists(incidentId);

        IncidentAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Attachment with id '%s' not found".formatted(attachmentId)));

        if (!incidentId.equals(attachment.getIncidentId())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Attachment with id '%s' not found for incident '%s'".formatted(attachmentId, incidentId));
        }

        try {
            ResponseInputStream<GetObjectResponse> s3Object = s3Client.getObject(GetObjectRequest.builder()
                    .bucket(attachment.getBucket())
                    .key(attachment.getStorageKey())
                    .build());

            StreamingResponseBody body = outputStream -> {
                try (s3Object) {
                    s3Object.transferTo(outputStream);
                }
            };

            return new AttachmentDownload(
                    attachment.getOriginalFileName(),
                    attachment.getContentType(),
                    attachment.getSizeBytes(),
                    body);
        } catch (SdkException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to read attachment from S3", exception);
        }
    }

    private IncidentAttachment uploadOne(UUID incidentId, MultipartFile file) {
        validateFile(file);

        String originalFileName = sanitizeFileName(file.getOriginalFilename());
        String contentType = normalizeContentType(file.getContentType());
        String mediaType = resolveMediaType(contentType);
        String storageKey = "incidents/%s/%s-%s".formatted(incidentId, UUID.randomUUID(), originalFileName);
        String bucket = properties.getS3().getBucket();

        try {
            ensureBucketExists(bucket);

            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(storageKey)
                    .contentType(contentType)
                    .contentLength(file.getSize())
                    .build();

            try (var inputStream = file.getInputStream()) {
                s3Client.putObject(request, RequestBody.fromInputStream(inputStream, file.getSize()));
            }
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to read attachment file", exception);
        } catch (SdkException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to upload attachment to S3", exception);
        }

        IncidentAttachment attachment = new IncidentAttachment();
        attachment.setIncidentId(incidentId);
        attachment.setOriginalFileName(originalFileName);
        attachment.setStorageKey(storageKey);
        attachment.setBucket(bucket);
        attachment.setContentType(contentType);
        attachment.setSizeBytes(file.getSize());
        attachment.setMediaType(mediaType);

        return attachmentRepository.save(attachment);
    }

    private void ensureBucketExists(String bucket) {
        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(bucket).build());
        } catch (S3Exception exception) {
            if (exception.statusCode() != 404) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Failed to access S3 bucket '%s'".formatted(bucket),
                        exception);
            }

            createBucket(bucket);
        } catch (SdkException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Failed to access S3 bucket '%s'".formatted(bucket),
                    exception);
        }
    }

    private void createBucket(String bucket) {
        try {
            s3Client.createBucket(CreateBucketRequest.builder().bucket(bucket).build());
        } catch (S3Exception exception) {
            if (exception.statusCode() != 409) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Failed to create S3 bucket '%s'".formatted(bucket),
                        exception);
            }
        } catch (SdkException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Failed to create S3 bucket '%s'".formatted(bucket),
                    exception);
        }
    }

    private void ensureIncidentExists(UUID incidentId) {
        if (!incidentRepository.existsById(incidentId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Incident with id '%s' not found".formatted(incidentId));
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Attachment file is empty");
        }

        if (file.getSize() > properties.getMaxFileSizeBytes()) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Attachment file is too large");
        }

        String contentType = normalizeContentType(file.getContentType());
        if (!contentType.startsWith("image/") && !contentType.startsWith("video/")) {
            throw new ResponseStatusException(
                    HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "Only image and video attachments are supported");
        }
    }

    private String normalizeContentType(String contentType) {
        return contentType != null && !contentType.isBlank()
                ? contentType
                : MediaType.APPLICATION_OCTET_STREAM_VALUE;
    }

    private String resolveMediaType(String contentType) {
        if (contentType.startsWith("image/")) {
            return "IMAGE";
        }

        if (contentType.startsWith("video/")) {
            return "VIDEO";
        }

        return "UNKNOWN";
    }

    private String sanitizeFileName(String fileName) {
        String safeName = fileName != null && !fileName.isBlank() ? fileName : "attachment";
        safeName = safeName
                .replaceAll("[\\\\/\\r\\n\\t]", "_")
                .replaceAll("[^A-Za-z0-9._-]", "_");

        if (safeName.length() > 140) {
            return safeName.substring(safeName.length() - 140);
        }

        return safeName;
    }

    public record AttachmentDownload(
            String fileName,
            String contentType,
            long sizeBytes,
            StreamingResponseBody body
    ) {
    }
}
