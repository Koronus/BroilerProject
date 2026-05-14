package com.broiler_monitoring.Telemetry;


import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sensors")
public class SensorController {
    private final SensorService sensorService;
    public SensorController(SensorService sensorService){
        this.sensorService = sensorService;
    }

    @GetMapping()
    public List<Sensor> getAll(){
        return sensorService.findAll();
    }

    @GetMapping("/{id}")
    public Sensor getById(@PathVariable UUID id){
        return sensorService.getById(id);
    }
    @GetMapping("/code/{code}")
    public Sensor getByCode(@PathVariable String code){
        return sensorService.getByCode(code);
    }
    @PostMapping
    public Sensor create(@RequestBody Sensor sensor){
        return sensorService.create(sensor);
    }

    @PutMapping("/{id}")
    public Sensor update(
            @PathVariable UUID id,
            @RequestBody Sensor sensor
    ){
        return sensorService.update(id, sensor);
    }
}
