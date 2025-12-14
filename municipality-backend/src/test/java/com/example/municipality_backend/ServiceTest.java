package com.example.municipality_backend;

import com.example.municipality_backend.service.MunicipalityService;
import com.example.municipality_backend.model.MunicipalityData;
import java.util.List;

public class ServiceTest {
    public static void main(String[] args) {
        MunicipalityService service = new MunicipalityService();
        //MunicipalityData data_1 = service.getMunicipality("KU441");
        List<MunicipalityService.Municipality> data = service.getAllMunicipalities();

    }
}