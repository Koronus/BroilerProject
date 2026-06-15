package com.broiler_monitoring;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BroilerMonitoringApplication {

	public static void main(String[] args) {
		SpringApplication.run(BroilerMonitoringApplication.class, args);
	}

}
