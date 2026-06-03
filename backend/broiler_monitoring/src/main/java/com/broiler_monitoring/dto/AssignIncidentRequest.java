package com.broiler_monitoring.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class AssignIncidentRequest {
    private UUID userId;
    private String userName;
    private String role;
}
