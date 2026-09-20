package com.broiler_monitoring.Controller;

import com.broiler_monitoring.dto.analytics.IncidentAnalyticsResponse;
import com.broiler_monitoring.service.IncidentAnalyticsService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/incidents/analytics")
public class IncidentAnalyticsController {

    private final IncidentAnalyticsService service;

    public IncidentAnalyticsController(IncidentAnalyticsService service) {
        this.service = service;
    }

    @GetMapping
    public IncidentAnalyticsResponse getAnalytics(
            @RequestParam(defaultValue = "7") int periodDays,
            @RequestParam(required = false) String workshop,
            @RequestParam(required = false) String house,
            @RequestParam(defaultValue = "30") int slaMinutes
    ) {
        if (periodDays != 7 && periodDays != 30) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "periodDays must be 7 or 30");
        }
        if (slaMinutes != 30) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "slaMinutes must be 30");
        }
        return service.calculate(periodDays, workshop, house, slaMinutes);
    }
}