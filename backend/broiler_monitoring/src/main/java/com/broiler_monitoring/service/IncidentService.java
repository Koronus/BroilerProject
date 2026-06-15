package com.broiler_monitoring.service;


import com.broiler_monitoring.dto.AssignIncidentRequest;
import com.broiler_monitoring.entity.AppUser;
import com.broiler_monitoring.entity.Incident;
import com.broiler_monitoring.entity.IncidentHistory;
import com.broiler_monitoring.entity.Notification;
import com.broiler_monitoring.enumerated.IncidentPriority;
import com.broiler_monitoring.enumerated.IncidentSource;
import com.broiler_monitoring.enumerated.IncidentStatus;
import com.broiler_monitoring.enumerated.IncidentType;
import com.broiler_monitoring.enumerated.NotificationStatus;
import com.broiler_monitoring.repository.AppUserRepository;
import com.broiler_monitoring.repository.IncidentHistoryRepository;
import com.broiler_monitoring.repository.IncidentRepository;
import com.broiler_monitoring.repository.NotificationRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class IncidentService {

    private static final DateTimeFormatter INCIDENT_CODE_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private static final UUID DEFAULT_USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private static final String DEFAULT_USER_NAME = "Павел Романов";
    private static final String DEFAULT_USER_ROLE = "Директор по качеству";

    private final IncidentRepository repository;
    private final NotificationRepository notificationRepository;
    private final AppUserRepository userRepository;
    private final IncidentHistoryRepository historyRepository;

    public IncidentService(
            IncidentRepository repository,
            NotificationRepository notificationRepository,
            AppUserRepository userRepository,
            IncidentHistoryRepository historyRepository
    ){
        this.repository = repository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.historyRepository = historyRepository;
    }

    public List<Incident> findAll(){
        return repository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public Incident getById(UUID id){
        return repository.findById(id)
                .orElseThrow(()->new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Incident with id '%s' not found".formatted(id)));
    }
    public Incident getByCode(String code){
        return repository.findByCode(code)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Incidetn with code '%s' not found".formatted(code)));
    }
    public Incident create(Incident incidentRequest){
        Incident request = incidentRequest != null ? incidentRequest : new Incident();
        Incident incident = new Incident();

        incident.setCode(firstNotBlank(request.getCode(), generateIncidentCode()));
        incident.setType(request.getType() != null ? request.getType() : IncidentType.OTHER);
        incident.setWorkshop(blankToNull(request.getWorkshop()));
        incident.setHouse(blankToNull(request.getHouse()));
        incident.setZone(blankToNull(request.getZone()));
        incident.setTitle(firstNotBlank(request.getTitle(), buildIncidentTitle(incident)));
        incident.setDescription(request.getDescription());
        incident.setPriority(request.getPriority() != null ? request.getPriority() : IncidentPriority.MEDIUM);
        incident.setSource(request.getSource() != null ? request.getSource() : IncidentSource.MANUAL);
        incident.setStatus(request.getStatus() != null ? request.getStatus() : IncidentStatus.OPEN);
        incident.setResponsible(blankToNull(request.getResponsible()));
        incident.setDecisionComment(blankToNull(request.getDecisionComment()));
        incident.setDetectedAt(request.getDetectedAt());

        return repository.save(incident);
    }

    @Transactional
    public Incident createFromNotification(UUID notificationId, Incident incidentRequest){
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Notification with id '%s' not found".formatted(notificationId)));

        if (!repository.findByNotificationId(notificationId).isEmpty()){
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Incident for notification with id '%s' already exists".formatted(notificationId));
        }

        Incident incident = new Incident();
        Incident request = incidentRequest != null ? incidentRequest : new Incident();

        incident.setCode(firstNotBlank(request.getCode(), generateIncidentCode()));
        incident.setTitle(firstNotBlank(request.getTitle(), notification.getTitle()));
        incident.setDescription(firstNotBlank(request.getDescription(), notification.getDescription()));
        incident.setPriority(request.getPriority() != null ? request.getPriority() : mapNotificationPriority(notification));
        incident.setType(request.getType() != null ? request.getType() : IncidentType.OTHER);
        incident.setWorkshop(blankToNull(request.getWorkshop()));
        incident.setHouse(blankToNull(request.getHouse()));
        incident.setZone(blankToNull(request.getZone()));
        incident.setSource(IncidentSource.NOTIFICATION);
        incident.setStatus(IncidentStatus.OPEN);
        incident.setNotificationId(notification.getId());
        incident.setResponsible(blankToNull(request.getResponsible()));
        incident.setDecisionComment(blankToNull(request.getDecisionComment()));
        incident.setDetectedAt(request.getDetectedAt() != null ? request.getDetectedAt() : notification.getCreatedAt());

        notification.setStatus(NotificationStatus.INCIDENT_CREATED);
        notificationRepository.save(notification);

        return repository.save(incident);
    }

    public Incident update(UUID id, Incident updatedIncident){
        Incident incident = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Incident with id '%s' not found".formatted(id)));

        incident.setTitle(updatedIncident.getTitle());
        incident.setDescription(updatedIncident.getDescription());
        incident.setCode(updatedIncident.getCode());
        incident.setPriority(updatedIncident.getPriority());
        incident.setSource(updatedIncident.getSource());
        if (updatedIncident.getType() != null) {
            incident.setType(updatedIncident.getType());
        }
        incident.setWorkshop(blankToNull(updatedIncident.getWorkshop()));
        incident.setHouse(blankToNull(updatedIncident.getHouse()));
        incident.setZone(blankToNull(updatedIncident.getZone()));
        incident.setStatus(updatedIncident.getStatus());
        incident.setDetectedAt(updatedIncident.getDetectedAt());
        incident.setClosedAt(updatedIncident.getClosedAt());
        incident.setResolvedAt(updatedIncident.getResolvedAt());
        incident.setResponsible(updatedIncident.getResponsible());
        incident.setNotificationId(updatedIncident.getNotificationId());
        incident.setDecisionComment(updatedIncident.getDecisionComment());

        return repository.save(incident);

    }

    public Incident changeStatus(UUID id, IncidentStatus newStatus){
        Incident incident = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Incident with id '%s' not found".formatted(id)));
        incident.setStatus(newStatus);

        return repository.save(incident);
    }

    @Transactional
    public Incident assign(UUID id, AssignIncidentRequest request){
        Incident incident = getById(id);

        if (incident.getStatus() == IncidentStatus.IN_PROGRESS || incident.getStatus() == IncidentStatus.CLOSED || incident.getStatus() == IncidentStatus.RESOLVED){
            String assignee = firstNotBlank(incident.getResponsible(), "другим пользователем");
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Этот инцидент уже взят в работу пользователем %s".formatted(assignee));
        }

        UUID userId = request != null && request.getUserId() != null ? request.getUserId() : DEFAULT_USER_ID;
        String userName = request != null ? firstNotBlank(request.getUserName(), DEFAULT_USER_NAME) : DEFAULT_USER_NAME;
        String role = request != null ? firstNotBlank(request.getRole(), DEFAULT_USER_ROLE) : DEFAULT_USER_ROLE;

        validateRoleForIncident(incident, role);

        AppUser user = userRepository.findById(userId)
                .map(existingUser -> {
                    existingUser.setFullName(userName);
                    existingUser.setRole(role);
                    return existingUser;
                })
                .orElseGet(() -> new AppUser(userId, userName, role));
        userRepository.save(user);

        LocalDateTime startedAt = LocalDateTime.now();
        incident.setStatus(IncidentStatus.IN_PROGRESS);
        incident.setAssigneeId(user.getId());
        incident.setAssigneeRole(user.getRole());
        incident.setResponsible(user.getFullName());
        incident.setStartedAt(startedAt);

        if (incident.getCreatedAt() != null){
            incident.setReactionMinutes(Duration.between(incident.getCreatedAt(), startedAt).toMinutes());
        }

        Incident savedIncident = repository.save(incident);
        historyRepository.save(new IncidentHistory(
                savedIncident.getId(),
                "ASSIGNED",
                user.getId(),
                user.getFullName(),
                "Пользователь %s взял инцидент в работу".formatted(user.getFullName())
        ));

        return savedIncident;
    }

    private String firstNotBlank(String value, String defaultValue){
        return value != null && !value.isBlank() ? value : defaultValue;
    }

    private String blankToNull(String value){
        return value != null && !value.isBlank() ? value : null;
    }

    private String buildIncidentTitle(Incident incident){
        List<String> locationParts = new ArrayList<>();

        addIfNotBlank(locationParts, incident.getWorkshop());
        addIfNotBlank(locationParts, incident.getHouse());
        addIfNotBlank(locationParts, incident.getZone());

        String title = incident.getType() != null
                ? incident.getType().getDisplayName()
                : IncidentType.OTHER.getDisplayName();

        if (!locationParts.isEmpty()){
            title += ": " + String.join(" / ", locationParts);
        }

        return title;
    }

    private void addIfNotBlank(List<String> values, String value){
        if (value != null && !value.isBlank()){
            values.add(value);
        }
    }

    private String generateIncidentCode(){
        String datePart = LocalDateTime.now().format(INCIDENT_CODE_DATE_FORMAT);
        String randomPart = UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        return "INC-" + datePart + "-" + randomPart;
    }

    private IncidentPriority mapNotificationPriority(Notification notification){
        return IncidentPriority.valueOf(notification.getPriority().name());
    }

    private void validateRoleForIncident(Incident incident, String role){
        Set<String> allowedRoles = getAllowedRoles(incident);

        if (!allowedRoles.contains(role)){
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Роль '%s' не может взять этот тип инцидента в работу".formatted(role));
        }
    }

    private Set<String> getAllowedRoles(Incident incident){
        String payload = "%s %s".formatted(
                firstNotBlank(incident.getTitle(), ""),
                firstNotBlank(incident.getDescription(), "")
        ).toLowerCase(Locale.ROOT);

        if (payload.contains("падеж") || payload.contains("вет")){
            return Set.of("Ветврач", "Ветеринарная служба", "Директор по качеству");
        }

        if (payload.contains("оборуд") || payload.contains("вентил") || payload.contains("температур")){
            return Set.of("Главный инженер", "Техническая служба", "Директор по качеству");
        }

        if (payload.contains("корм")){
            return Set.of("Зоотехник", "Старший смены", "Директор по качеству");
        }

        return Set.of("Старший смены", "Оператор", "Директор по качеству");
    }

}
