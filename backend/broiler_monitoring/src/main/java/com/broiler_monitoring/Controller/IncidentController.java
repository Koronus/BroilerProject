package com.broiler_monitoring.Controller;

import com.broiler_monitoring.entity.Incident;
import com.broiler_monitoring.enumerated.IncidentStatus;
import com.broiler_monitoring.service.IncidentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/incident")
public class IncidentController {

    private IncidentService service;
    public IncidentController(IncidentService service){
        this.service = service;
    }
    @GetMapping
    public List<Incident> getIncident(){
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Incident getById(@PathVariable UUID id){
        return service.getById(id);
    }

    @GetMapping("code/{code}")
    public Incident getByCode(@PathVariable String code){
        return service.getByCode(code);
    }

    @PostMapping
    public Incident create(@RequestBody Incident incident){
        return service.create(incident);
    }

    @PostMapping("/from-notification/{notificationId}")
    public Incident createFromNotification(
            @PathVariable UUID notificationId,
            @RequestBody(required = false) Incident incident
    ){
        return service.createFromNotification(notificationId, incident);
    }

    @PatchMapping("/{id}/status")
    public Incident changeStatus(
            @PathVariable UUID id,
            @RequestBody IncidentStatus status){
        return service.changeStatus(id, status);
    }


    @PutMapping("/{id}")
    public Incident update(
            @PathVariable UUID id,
            @RequestBody Incident incident
    ){
        return service.update(id, incident);
    }


}
