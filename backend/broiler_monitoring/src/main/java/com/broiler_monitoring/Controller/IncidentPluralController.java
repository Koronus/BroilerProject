package com.broiler_monitoring.Controller;

import com.broiler_monitoring.dto.AssignIncidentRequest;
import com.broiler_monitoring.entity.Incident;
import com.broiler_monitoring.service.IncidentService;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/incidents")
public class IncidentPluralController {

    private final IncidentService service;

    public IncidentPluralController(IncidentService service) {
        this.service = service;
    }

    @PatchMapping("/{id}/assign")
    public Incident assign(
            @PathVariable UUID id,
            @RequestBody(required = false) AssignIncidentRequest request
    ){
        return service.assign(id, request);
    }
}
