package com.broiler_monitoring.Telemetry;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class SensorService {

    private final SensorRepository repository;

    public SensorService(SensorRepository repository){
        this.repository = repository;
    }
    public List<Sensor> findAll(){
        return repository.findAll();
    }
    public Sensor getById(UUID id){
        return repository.findById(id).orElseThrow(()-> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Sensor with id '%s' not found".formatted(id)));
    }
    public Sensor getByCode(String code){
        return repository.findByCode(code)
                .orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Sensor with code '%s' not found".formatted(code)));
    }
    public Sensor create(Sensor sensor){
        if (repository.existsByCode(sensor.getCode())){
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Sensor with code '%s' already exists".formatted(sensor.getCode()));
        }
        return repository.save(sensor);
    }
    public Sensor update(UUID id,Sensor updatedSensor){
        Sensor sensor = getById(id);

        sensor.setCode(updatedSensor.getCode());
        sensor.setName(updatedSensor.getName());
        sensor.setType(updatedSensor.getType());
        sensor.setFarm(updatedSensor.getFarm());
        sensor.setBuilding(updatedSensor.getBuilding());
        sensor.setUnit(updatedSensor.getUnit());
        sensor.setActive(updatedSensor.getActive());

        return repository.save(sensor);
    }



}
