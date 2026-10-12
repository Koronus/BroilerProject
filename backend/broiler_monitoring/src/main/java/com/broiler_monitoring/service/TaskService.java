package com.broiler_monitoring.service;

import com.broiler_monitoring.entity.Task;
import com.broiler_monitoring.repository.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskService {
    private TaskRepository taskRepository;
    private final BatchReferenceValidator batchReferences;

    public TaskService(TaskRepository taskRepository, BatchReferenceValidator batchReferences){
        this.taskRepository = taskRepository;
        this.batchReferences = batchReferences;
    }

    public List<Task> findAll(){
        return taskRepository.findAll();
    }

    public Task create(Task task){
        batchReferences.validate(task.getBatchId());
        return taskRepository.save(task);
    }

    public Task updateTask(Task task) {

        Task existing = taskRepository.findById(task.getId()).orElseThrow(() ->
                new EntityNotFoundException("Task not found with id: " + task.getId()));
        if (task.getBatchId() == null) task.setBatchId(existing.getBatchId());
        batchReferences.validate(task.getBatchId());

        return taskRepository.save(task);
    }

    public List<Task> findByStatus(String status){
        return taskRepository.findByStatus(status);
    }

    public List<Task> findByPriority(String priority){
        return taskRepository.findByPriority(priority);
    }

    public List<Task> findByResponsible(String responsible){
        return taskRepository.findByResponsible(responsible);
    }

    public List<Task> findByNameIndicator(String nameIndicator){
        return taskRepository.findByNameIndicator(nameIndicator);
    }

    public List<Task> findByCreateTaskBefore(LocalDateTime date){
        return taskRepository.findByCreateTaskBefore(date);
    }

    public List<Task> findByCreateTaskAfter(LocalDateTime date){
        return taskRepository.findByCreateTaskAfter(date);
    }

    public List<Task> findByFilterTask(String status,String priority,String responsible,String nameIndicator,LocalDateTime dateFrom,LocalDateTime dateTo){
        return taskRepository.filterTasks(status,priority,responsible,nameIndicator,dateFrom,dateTo);
    }
}
