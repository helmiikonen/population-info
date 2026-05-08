package com.example.municipality_backend;

import com.example.municipality_backend.service.MunicipalityService;
import com.example.municipality_backend.model.MunicipalityData;
import java.util.List;

public class ServiceTest {
    public static void main(String[] args) {
        MunicipalityService service = MunicipalityService.getInstance();
        service.clearCache();
        service.getData();
        //MunicipalityData data_1 = service.getMunicipality("KU091");
        //data_1.printInfo();
        //List<MunicipalityService.Municipality> data = service.getAllMunicipalities();
        //for (int i=0; i<data.size(); i++) {
        	//System.out.println(data.get(i).getName());
        //}
        
    }
}