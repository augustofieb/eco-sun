package com.ecosun.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/test")
public class TestController {
    
    @GetMapping("/ping")
    public String ping() {
        return "Backend funcionando!";
    }
}