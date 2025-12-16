package com.example.municipality_backend.controller;

import com.example.municipality_backend.model.MunicipalityData;
import com.example.municipality_backend.service.MunicipalityService;

import java.util.List;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class MunicipalityController {

    private final MunicipalityService municipalityService;

    public MunicipalityController(MunicipalityService municipalityService) {
        this.municipalityService = municipalityService;
    }

    @GetMapping("/municipality/{code}")
    public MunicipalityData getMunicipality(@PathVariable String code) {
        return this.municipalityService.getMunicipality(code);
    }
    
    @GetMapping("/municipalities")
    public List<MunicipalityService.Municipality> getMunicipalities() {
        return this.municipalityService.getAllMunicipalities();
    }    
    
}