package com.broiler_monitoring.repository;

import com.broiler_monitoring.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.*;


@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {

    List<Task> findByStatus(String status);
    List<Task> findByPriority(String priority);
    List<Task> findByResponsible(String responsible);
    List<Task> findByNameIndicator(String nameIndicator);
    List<Task> findByCreateTaskBefore(LocalDateTime date);
    List<Task> findByCreateTaskAfter(LocalDateTime date);

    @Query("SELECT t FROM Task t WHERE " +
            "(:status IS NULL OR t.status = :status) AND " +
            "(:priority IS NULL OR t.priority = :priority) AND " +
            "(:responsible IS NULL OR t.responsible = :responsible) AND " +
            "(:nameIndicator IS NULL OR t.nameIndicator = :nameIndicator) AND " +
            "(:dateFrom IS NULL OR t.createTask >= :dateFrom) AND " +
            "(:dateTo IS NULL OR t.createTask <= :dateTo)")
    List<Task> filterTasks(
            @Param("status") String status,
            @Param("priority") String priority,
            @Param("responsible") String responsible,
            @Param("nameIndicator") String nameIndicator,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo
    );
}
