package com.broiler_monitoring.dto;

import java.util.List;

public record BatchSummaryDto(
        String status,
        List<String> risks,
        List<String> recommendations
) {}
