package com.broiler_monitoring.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI broilerMonitoringOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Broiler Monitoring API")
                        .version("1.0.0")
                        .description("API для мониторинга бройлерного производства: датчики, телеметрия, уведомления и инциденты.")
                        .contact(new Contact()
                                .name("Broiler Monitoring Team")));
    }
}
