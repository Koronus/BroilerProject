package com.broiler_monitoring.Controller;


import com.broiler_monitoring.entity.Notification;
import com.broiler_monitoring.enumerated.NotificationStatus;
import com.broiler_monitoring.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notification")
public class NotificationController {
   private final NotificationService service;

    public NotificationController (NotificationService service){
        this.service = service;
    }

    @GetMapping
    public List<Notification> getAll(){
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Notification getById(@PathVariable UUID id){
        return service.getById(id);
    }

    @GetMapping("/code/{code}")
    public Notification getByCode(@PathVariable String code){
        return service.getByCode(code);
    }

    @PostMapping()
    public Notification create(@RequestBody Notification notification){
        return service.create(notification);
    }

    @PutMapping("/{id}")
    public Notification update(
            @PathVariable UUID id,
            @RequestBody Notification notification
    ){
        return service.update(id, notification);
    }

    @PatchMapping("/{id}/status")
    public Notification changeStatus(
            @PathVariable UUID id,
            @RequestBody NotificationStatus status
            ){
        return service.changeStatus(id, status);
    }


}
