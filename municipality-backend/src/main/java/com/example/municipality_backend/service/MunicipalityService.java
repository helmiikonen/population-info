package com.example.municipality_backend.service;

import com.example.municipality_backend.model.MunicipalityData;
import com.example.municipality_backend.model.PopulationRecord;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;

@Service
public class MunicipalityService {

    private static final String PXWEB_URL = 
        "https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/tyokay/statfin_tyokay_pxt_115b.px"; // väestödata

    private static List<Municipality> municipalitiesCache;
    
    public static class Municipality {
    	private String code;
    	private String name;
    	
    	public Municipality(String code, String name) {
    		this.code = code;
    		this.name = name;
    	}
    	
    	public String getCode() {
    		return this.code;
    	}
    	
    	public String getName() {
    		return this.name;
    	}
    }
    
    public MunicipalityData getMunicipality(String municipalityCode) {
        try {
            HttpClient client = HttpClient.newHttpClient();

            String jsonBody = """
            		{
            		  "query": [
            		    {
            		      "code": "Alue",
            		      "selection": {
            		        "filter": "item",
            		        "values": ["%s"]
            		      }
            		    },
            		    {
            		      "code": "Ikä",
            		      "selection": {
            		        "filter": "item",
            		        "values": ["SSS", "0-17", "18-64", "65-"]
            		      }
            		    }
            		  ],
            		  "response": {
            		    "format": "json-stat2"
            		  }
            		}
            		""".formatted(municipalityCode);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(PXWEB_URL))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            String responseBody = response.body();
            
            System.out.println(responseBody);
            
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(responseBody);

            // 1. Lue dimensionit
            JsonNode dimension = root.get("dimension");
            JsonNode areaDimension = dimension.get("Alue").get("category").get("index");
            JsonNode ageDimension = dimension.get("Ikä").get("category").get("index");
            JsonNode yearDimension = dimension.get("Vuosi").get("category").get("index");

            // 2. Tee käänteiset mapit koodista nimeen
            String municipalityName = dimension.get("Alue").get("category").get("label").get(municipalityCode).asText();
            MunicipalityData data = new MunicipalityData(municipalityCode, municipalityName);

            // 3. Luo lista vuosista ja ikäryhmistä
            List<String> years = new ArrayList<>();
            yearDimension.fieldNames().forEachRemaining(obj -> years.add(obj));

            List<String> ages = new ArrayList<>();
            ageDimension.fieldNames().forEachRemaining(obj -> ages.add(obj));

            // 4. Lue value-array
            JsonNode values = root.get("value");

            // 5. Arvioi size-koordinaatit dimensionin "size"-listasta
            int nAreas = root.get("size").get(0).asInt();
            int nAges = root.get("size").get(1).asInt();
            int nYears = root.get("size").get(2).asInt();

            // 6. Lue arvot kunnittain
            // Käytetään yksinkertaista indeksointia: value[a*nYears*nAges + age*nYears + year]
            int areaIndex = areaDimension.get(municipalityCode).asInt();
            // Luodaan populationrecord kullekin vuodelle
            for (int i = 0; i < nYears; i++) {
                int year = Integer.parseInt(years.get(i));
                PopulationRecord record = new PopulationRecord(year);

                // Etsitään kyseisen vuoden väkiluku kullekin ikäryhmälle
                for (int j = 0; j < nAges; j++) {
                    String ageGroup = ages.get(j);
                    int valueIndex = (areaIndex * nYears * nAges) + i + (j * nYears);
                    
                    int count = values.get(valueIndex).asInt();
                    
                    switch(ageGroup) {
                        case "SSS": record.setTotal(count); break;
                        case "0-17": record.setAge0_17(count); break;
                        case "18-64": record.setAge18_64(count); break;
                        case "65-": record.setAge65plus(count); break;
                    }
                }
                

                data.addRecord(record);
            }
            
            data.printInfo();
            
            return data;

        } catch (Exception e) {
            e.printStackTrace();
            // Palauta tyhjä data virhetilanteessa
            return new MunicipalityData();
        }

    }
    
    public List<Municipality> getAllMunicipalities() {
    	
        if (municipalitiesCache != null) {
            return municipalitiesCache;
        }

        try {
            HttpClient client = HttpClient.newHttpClient();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(PXWEB_URL))
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            String responseBody = response.body();
            
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(responseBody);
            
            JsonNode values = root.get("variables").get(0).get("values");
            JsonNode valueTexts = root.get("variables").get(0).get("valueTexts");
            
            List<Municipality> municipalities = new ArrayList<>();
            
            for (int i=0; i<values.size(); i++) {
            	Municipality municipality = new Municipality(values.get(i).asText(), valueTexts.get(i).asText());
            	if (!municipality.getCode().equals("SSS")) {
            		municipalities.add(municipality);
            		System.out.println(municipality.getCode() + " " + municipality.getName());
            	}
            	
            }
            
            municipalitiesCache = municipalities;
            
            
            return municipalities;

        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
        
        
    }
}