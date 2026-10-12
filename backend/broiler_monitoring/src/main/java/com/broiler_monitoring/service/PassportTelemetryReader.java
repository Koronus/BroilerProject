package com.broiler_monitoring.service;

import com.broiler_monitoring.Telemetry.SensorType;
import com.broiler_monitoring.dto.passport.PassportSections.Norm;
import com.broiler_monitoring.dto.passport.PassportSections.Schedule;
import com.broiler_monitoring.dto.passport.PassportSections.Status;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
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
import java.util.*;
import java.util.stream.Collectors;

/** Bounded result size: Influx computes aggregates, never sends the raw lifetime history. */
@Component
public class PassportTelemetryReader {
    public record MetricKey(SensorType type, String unit) {}
    public record MetricQuery(MetricKey key, Set<UUID> sensorIds, Norm norm) {}
    public record Values(long count, Double average, Double minimum, Double maximum,
                         Double latest, Instant latestAt, Long deviations) {}
    public record Snapshot(Map<MetricKey, Values> metrics, Schedule schedule) {}
    private final String url;
    private final String database;
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();
    private final ObjectMapper mapper = new ObjectMapper();

    public PassportTelemetryReader(
            @Value("${telemetry.influx.url:http://localhost:8086}") String url,
            @Value("${telemetry.influx.database:broiler_telemetry}") String database) {
        this.url = url.replaceAll("/+$", "");
        this.database = database;
    }

    public Snapshot read(List<MetricQuery> metrics, String lightingHouseId, Instant from, Instant to) {
        List<String> statements = new ArrayList<>();
        for (MetricQuery metric : metrics) {
            String where = metric.sensorIds().stream().sorted()
                    .map(id -> "\"sensorId\"=" + literal(id.toString()))
                    .collect(Collectors.joining(" OR ", "(", ")"));
            String source = " FROM \"sensor_reading\" WHERE " + where
                    + " AND \"type\"=" + literal(metric.key().type().name())
                    + " AND \"unit\"=" + literal(metric.key().unit()) + period(from, to);
            statements.add("SELECT COUNT(\"value\") AS \"count\", MEAN(\"value\") AS \"average\","
                    + " MIN(\"value\") AS \"minimum\", MAX(\"value\") AS \"maximum\"" + source);
            statements.add("SELECT LAST(\"value\") AS \"latest\"" + source);
            List<String> bounds = new ArrayList<>();
            if (metric.norm() != null) {
                if (metric.norm().minimum() != null) bounds.add("\"value\" < " + metric.norm().minimum());
                if (metric.norm().maximum() != null) bounds.add("\"value\" > " + metric.norm().maximum());
            }
            statements.add("SELECT COUNT(\"value\") AS \"deviations\"" + source
                    + (bounds.isEmpty() ? " AND \"value\" < 0 AND \"value\" > 0" : " AND (" + String.join(" OR ", bounds) + ")"));
        }
        boolean withSchedule = lightingHouseId != null && !lightingHouseId.isBlank();
        if (withSchedule) {
            String source = " FROM \"lighting_schedule_compliance\" WHERE \"houseId\"="
                    + literal(lightingHouseId) + period(from, to);
            statements.add("SELECT COUNT(\"compliance_percent\") AS \"count\","
                    + " MEAN(\"compliance_percent\") AS \"average\","
                    + " MIN(\"compliance_percent\") AS \"minimum\","
                    + " MAX(\"compliance_percent\") AS \"maximum\"" + source);
            statements.add("SELECT *" + source + " ORDER BY time DESC LIMIT 1");
        }
        if (statements.isEmpty()) return new Snapshot(Map.of(), emptySchedule());
        JsonNode results = query(String.join(";", statements));
        if (!results.isArray() || results.size() != statements.size()) {
            throw unavailable("Incomplete InfluxDB response", null);
        }
        Map<MetricKey, Values> values = new LinkedHashMap<>();
        int index = 0;
        for (MetricQuery metric : metrics) {
            Map<String, JsonNode> aggregate = firstRow(results.get(index++));
            Map<String, JsonNode> latest = firstRow(results.get(index++));
            Map<String, JsonNode> deviations = firstRow(results.get(index++));
            long count = count(aggregate, "count");
            values.put(metric.key(), new Values(count, number(aggregate, "average"),
                    number(aggregate, "minimum"), number(aggregate, "maximum"),
                    number(latest, "latest"), time(latest),
                    metric.norm() == null || count == 0 ? null : count(deviations, "deviations")));
        }
        Schedule schedule = emptySchedule();
        if (withSchedule) {
            Map<String, JsonNode> aggregate = firstRow(results.get(index++));
            Map<String, JsonNode> latest = firstRow(results.get(index));
            long count = count(aggregate, "count");
            String rawStatus = latest.getOrDefault("status", mapper.nullNode()).asText("");
            Status status;
            try { status = "VIOLATION".equals(rawStatus) ? Status.WARNING : Status.valueOf(rawStatus); }
            catch (IllegalArgumentException ignored) { status = Status.UNKNOWN; }
            schedule = new Schedule(count, number(aggregate, "average"), number(aggregate, "minimum"),
                    number(aggregate, "maximum"), number(latest, "compliance_percent"),
                    integer(latest, "scheduled_light_minutes"), integer(latest, "actual_light_minutes"),
                    integer(latest, "scheduled_dark_minutes"), integer(latest, "actual_dark_minutes"),
                    integer(latest, "deviation_minutes_total"), time(latest), count == 0 ? Status.UNKNOWN : status);
        }
        return new Snapshot(values, schedule);
    }

    public static Schedule emptySchedule() {
        return new Schedule(0, null, null, null, null, null, null, null, null, null, null, Status.UNKNOWN);
    }

    private JsonNode query(String query) {
        URI uri = URI.create(url + "/query?db=" + encode(database) + "&q=" + encode(query));
        try {
            HttpResponse<String> response = client.send(HttpRequest.newBuilder(uri)
                    .timeout(Duration.ofSeconds(10)).GET().build(), HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) throw unavailable("InfluxDB query failed", null);
            JsonNode root = mapper.readTree(response.body());
            if (root == null || root.has("error")) throw unavailable("Invalid InfluxDB response", null);
            JsonNode results = root.path("results");
            for (JsonNode result : results) {
                if (result.has("error")) throw unavailable("InfluxDB rejected the passport query", null);
            }
            return results;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw unavailable("InfluxDB request interrupted", e);
        } catch (IOException | IllegalArgumentException e) {
            throw unavailable("InfluxDB is unavailable or returned invalid data", e);
        }
    }

    private Map<String, JsonNode> firstRow(JsonNode result) {
        JsonNode series = result.path("series").path(0);
        JsonNode row = series.path("values").path(0);
        Map<String, JsonNode> values = new HashMap<>();
        for (int i = 0; i < series.path("columns").size(); i++) {
            JsonNode cell = row.path(i);
            if (!cell.isMissingNode() && !cell.isNull()) values.put(series.path("columns").get(i).asText(), cell);
        }
        return values;
    }

    private Double number(Map<String, JsonNode> row, String key) {
        JsonNode value = row.get(key);
        if (value == null || !value.isNumber() || !Double.isFinite(value.asDouble())) return null;
        return value.asDouble();
    }
    private Integer integer(Map<String, JsonNode> row, String key) {
        Double value = number(row, key);
        return value == null ? null : value.intValue();
    }
    private long count(Map<String, JsonNode> row, String key) {
        return row.containsKey(key) ? row.get(key).asLong() : 0;
    }
    private Instant time(Map<String, JsonNode> row) {
        if (!row.containsKey("time")) return null;
        try { return Instant.parse(row.get("time").asText()); }
        catch (RuntimeException e) { throw unavailable("Invalid telemetry timestamp", e); }
    }
    private String period(Instant from, Instant to) {
        return " AND time >= " + literal(from.toString()) + " AND time < " + literal(to.toString());
    }
    private String literal(String value) {
        return "'" + value.replace("\\", "\\\\").replace("'", "\\'") + "'";
    }
    private String encode(String value) { return URLEncoder.encode(value, StandardCharsets.UTF_8); }
    private ResponseStatusException unavailable(String message, Exception cause) {
        return new ResponseStatusException(HttpStatus.BAD_GATEWAY, message, cause);
    }
}
