package com.broiler_monitoring.entity;


import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.*;


@Entity
@Getter
@Setter
@Table(name = "tasks")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank
    @Column(name = "nametask",nullable = false)
    private String nameTask;

    @NotBlank
    @Column(name = "descriptiontask",nullable = false)
    private String descriptionTask;

    @NotBlank
    @Column(name = "nameindicator",nullable = false)
    private String nameIndicator;

    @NotBlank
    @Column(name = "valueindicator",nullable = false)
    private String valueIndicator;

    @NotBlank
    @Column(name = "measure",nullable = false)
    private String measure;

    @NotBlank
    @Column(name = "priority",nullable = false)
    private String priority;

    @NotBlank
    @Column(name = "responsible",nullable = false)
    private String responsible;

    @NotBlank
    @Column(name = "status",nullable = false)
    private String status;


    @NotNull
    @Column(name = "createtask", nullable = false)
    private  LocalDateTime createTask;

    @NotNull
    @Column(name = "termtask",nullable = false)
    private  LocalDateTime termTask;

    @PrePersist
    public void PrePersist(){
        createTask = LocalDateTime.now();

    }




}
