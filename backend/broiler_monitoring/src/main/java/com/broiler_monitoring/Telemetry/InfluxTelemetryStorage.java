package com.broiler_monitoring.Telemetry;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class InfluxTelemetryStorage {

    private static final Logger log = LoggerFactory.getLogger(InfluxTelemetryStorage.class);
    private static final String MEASUREMENT = "sensor_reading";

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String influxUrl;
    private final String database;

    public InfluxTelemetryStorage(
            @Value("${telemetry.influx.url:http://localhost:8086}") String influxUrl,
            @Value("${telemetry.influx.database:broiler_telemetry}") String database
    ) {
        this.influxUrl = trimTrailingSlash(influxUrl);
        this.database = database;
    }

    @PostConstruct
    public void ensureDatabaseOnStartup() {
        try {
            executeQuery("CREATE DATABASE \"" + escapeIdentifier(database) + "\"");
        } catch (Exception exception) {
            log.warn("InfluxDB database '{}' was not created on startup: {}", database, exception.getMessage());
        }
    }

    public void write(List<InfluxTelemetryPoint> points) {
        if (points.isEmpty()) {
            return;
        }

        String body = points.stream()
                .map(this::toLineProtocol)
                .reduce((left, right) -> left + "\n" + right)
                .orElse("");

        HttpRequest request = HttpRequest.newBuilder(writeUri())
                .timeout(Duration.ofSeconds(10))
                .header("Content-Type", "text/plain; charset=utf-8")
                .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> response = send(request);
        if (response.statusCode() >= 300) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "InfluxDB write failed: " + response.body()
            );
        }
    }

    public List<InfluxTelemetryPoint> findLatest(String sensorCode, int limit) {
        String query = "SELECT * FROM \"" + MEASUREMENT + "\""
                + " WHERE \"sensorCode\" = '" + escapeStringLiteral(sensorCode) + "'"
                + " ORDER BY time DESC"
                + " LIMIT " + limit;

        return executeSelect(query);
    }

    public List<InfluxTelemetryPoint> findByPeriod(String sensorCode, Instant from, Instant to) {
        String query = "SELECT * FROM \"" + MEASUREMENT + "\""
                + " WHERE \"sensorCode\" = '" + escapeStringLiteral(sensorCode) + "'"
                + " AND time >= '" + from + "'"
                + " AND time <= '" + to + "'"
                + " ORDER BY time DESC";

        return executeSelect(query);
    }

    private List<InfluxTelemetryPoint> executeSelect(String query) {
        HttpResponse<String> response = send(HttpRequest.newBuilder(queryUri(query))
                .timeout(Duration.ofSeconds(10))
                .GET()
                .build());

        if (response.statusCode() >= 300) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "InfluxDB query failed: " + response.body()
            );
        }

        try {
            return parsePoints(response.body());
        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "InfluxDB response parsing failed",
                    exception
            );
        }
    }

    private void executeQuery(String query) throws IOException, InterruptedException {
        HttpResponse<String> response = httpClient.send(
                HttpRequest.newBuilder(managementQueryUri(query))
                        .timeout(Duration.ofSeconds(10))
                        .GET()
                        .build(),
                HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8)
        );

        if (response.statusCode() >= 300) {
            throw new IOException(response.body());
        }
    }

    private HttpResponse<String> send(HttpRequest request) {
        try {
            return httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "InfluxDB is not available", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "InfluxDB request was interrupted", exception);
        }
    }

    private List<InfluxTelemetryPoint> parsePoints(String responseBody) throws IOException {
        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode series = root.path("results").path(0).path("series");
        if (!series.isArray() || series.isEmpty()) {
            return List.of();
        }

        JsonNode firstSeries = series.get(0);
        List<String> columns = new ArrayList<>();
        for (JsonNode column : firstSeries.path("columns")) {
            columns.add(column.asText());
        }

        List<InfluxTelemetryPoint> points = new ArrayList<>();
        for (JsonNode row : firstSeries.path("values")) {
            points.add(toPoint(columns, row));
        }

        return points;
    }

    private InfluxTelemetryPoint toPoint(List<String> columns, JsonNode row) {
        String time = text(columns, row, "time");
        String sensorId = text(columns, row, "sensorId");
        String sensorCode = text(columns, row, "sensorCode");
        String type = text(columns, row, "type");
        String farm = text(columns, row, "farm");
        String building = text(columns, row, "building");
        String gatewayId = text(columns, row, "gatewayId");
        String unit = text(columns, row, "unit");
        String receivedAt = text(columns, row, "receivedAt");
        Double value = number(columns, row, "value");

        return new InfluxTelemetryPoint(
                sensorId == null ? null : UUID.fromString(sensorId),
                sensorCode,
                SensorType.valueOf(type),
                farm,
                building,
                gatewayId,
                value,
                unit,
                Instant.parse(time),
                receivedAt == null ? Instant.parse(time) : Instant.parse(receivedAt)
        );
    }

    private String text(List<String> columns, JsonNode row, String column) {
        int index = columns.indexOf(column);
        if (index < 0 || index >= row.size() || row.get(index).isNull()) {
            return null;
        }

        return row.get(index).asText();
    }

    private Double number(List<String> columns, JsonNode row, String column) {
        int index = columns.indexOf(column);
        if (index < 0 || index >= row.size() || row.get(index).isNull()) {
            return null;
        }

        return row.get(index).asDouble();
    }

    private String toLineProtocol(InfluxTelemetryPoint point) {
        return MEASUREMENT
                + ",sensorCode=" + escapeTagValue(point.sensorCode())
                + ",sensorId=" + escapeTagValue(point.sensorId().toString())
                + ",type=" + escapeTagValue(point.type().name())
                + ",farm=" + escapeTagValue(point.farm())
                + ",building=" + escapeTagValue(point.building())
                + ",gatewayId=" + escapeTagValue(point.gatewayId())
                + " value=" + point.value()
                + ",unit=\"" + escapeFieldString(point.unit()) + "\""
                + ",receivedAt=\"" + escapeFieldString(point.receivedAt().toString()) + "\""
                + " " + toEpochNanos(point.measuredAt());
    }

    private URI writeUri() {
        return URI.create(influxUrl + "/write?db=" + encode(database) + "&precision=ns");
    }

    private URI queryUri(String query) {
        return URI.create(influxUrl + "/query?db=" + encode(database) + "&q=" + encode(query));
    }

    private URI managementQueryUri(String query) {
        return URI.create(influxUrl + "/query?q=" + encode(query));
    }

    private long toEpochNanos(Instant instant) {
        return Math.addExact(Math.multiplyExact(instant.getEpochSecond(), 1_000_000_000L), instant.getNano());
    }

    private String escapeTagValue(String value) {
        return value
                .replace("\\", "\\\\")
                .replace(" ", "\\ ")
                .replace(",", "\\,")
                .replace("=", "\\=");
    }

    private String escapeFieldString(String value) {
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"");
    }

    private String escapeIdentifier(String value) {
        return value.replace("\"", "\\\"");
    }

    private String escapeStringLiteral(String value) {
        return value.replace("'", "\\'");
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private String trimTrailingSlash(String value) {
        if (value.endsWith("/")) {
            return value.substring(0, value.length() - 1);
        }

        return value;
    }
    public void saveUniformity(String houseId, double minLux, double maxLux,
                               double avgLux, double uniformity, int sensorCount) {

        String lineProtocol = String.format(
                Locale.US,
                "lighting_uniformity,houseId=%s min_lux=%.2f,max_lux=%.2f,avg_lux=%.2f,uniformity_percent=%.2f,sensor_count=%di %d",
                escapeTagValue(houseId),
                minLux, maxLux, avgLux, uniformity, sensorCount,
                Instant.now().toEpochMilli() * 1000000L
        );

        HttpRequest request = HttpRequest.newBuilder(writeUri())
                .timeout(Duration.ofSeconds(10))
                .header("Content-Type", "text/plain; charset=utf-8")
                .POST(HttpRequest.BodyPublishers.ofString(lineProtocol, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> response = send(request);
        if (response.statusCode() >= 300) {
            log.error("Failed to save uniformity to InfluxDB: {}", response.body());
        } else {
            log.info("Saved uniformity: {}%, sensors: {}", uniformity, sensorCount);
        }
    }

    public void saveLightingScheduleCompliance(String houseId,
                                               int scheduledLightMinutes,
                                               int actualLightMinutes,
                                               int scheduledDarkMinutes,
                                               int actualDarkMinutes,
                                               int deviationMinutes,
                                               double compliancePercent,
                                               String status) {
        String lineProtocol = String.format(
                "lighting_schedule_compliance,houseId=%s,status=%s scheduled_light_minutes=%di,actual_light_minutes=%di,scheduled_dark_minutes=%di,actual_dark_minutes=%di,deviation_minutes_total=%di,compliance_percent=%.2f %d",
                escapeTagValue(houseId),
                escapeTagValue(status),
                scheduledLightMinutes,
                actualLightMinutes,
                scheduledDarkMinutes,
                actualDarkMinutes,
                deviationMinutes,
                compliancePercent,
                Instant.now().toEpochMilli() * 1000000L
        );

        HttpRequest request = HttpRequest.newBuilder(writeUri())
                .timeout(Duration.ofSeconds(10))
                .header("Content-Type", "text/plain; charset=utf-8")
                .POST(HttpRequest.BodyPublishers.ofString(lineProtocol, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> response = send(request);
        if (response.statusCode() >= 300) {
            log.error("Failed to save lighting schedule compliance to InfluxDB: {}", response.body());
        } else {
            log.info("Saved lighting schedule compliance: {}%, status: {}", compliancePercent, status);
        }
    }
}
