package com.broiler_monitoring.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "incident.attachments")
public class IncidentAttachmentStorageProperties {

    private long maxFileSizeBytes = 314572800L;

    private S3 s3 = new S3();

    @Getter
    @Setter
    public static class S3 {
        private String endpoint = "http://localhost:9000";
        private String region = "us-east-1";
        private String bucket = "broiler-incident-attachments";
        private String accessKey = "minioadmin";
        private String secretKey = "minioadmin";
        private boolean pathStyleAccess = true;
    }
}
