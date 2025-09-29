package com.ecosun;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.ecosun")
public class EcoSunApplication {
    public static void main(String[] args) {
        SpringApplication.run(EcoSunApplication.class, args);
    }
}