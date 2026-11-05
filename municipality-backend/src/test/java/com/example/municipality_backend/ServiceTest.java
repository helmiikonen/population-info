package com.example.municipality_backend;

import com.example.municipality_backend.service.MunicipalityService;
import com.example.municipality_backend.model.MunicipalityData;
import java.util.List;

public class ServiceTest {
    public static void main(String[] args) {
        MunicipalityService service = MunicipalityService.getInstance();
        service.clearCache();
        service.getData();        
    }
}