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
import java.util.TreeMap;
import java.util.HashMap;
import java.util.Map;

@Service
public class MunicipalityService {

	private static MunicipalityService service = null;

	private MunicipalityService() {
		municipalitiesCache = new ArrayList<>();
		populationCache = new TreeMap<>();
	}

	public static MunicipalityService getInstance() {
		if (service == null) {
			service = new MunicipalityService();
		}
		return service;
	}
	
	private int getValue(
	        JsonNode root,
	        Map<String, Integer> coordinates) {

	    JsonNode ids = root.get("id");
	    JsonNode sizes = root.get("size");

	    int index = 0;

	    for (int i = 0; i < ids.size(); i++) {
	        String dimensionName = ids.get(i).asText();
	        int dimensionSize = sizes.get(i).asInt();

	        int coordinate = coordinates.getOrDefault(dimensionName, 0);

	        index = index * dimensionSize + coordinate;
	    }

	    JsonNode value = root.get("value").get(index);

	    return value == null || value.isNull() ? 0 : value.asInt();
	}
	
	private int getCategoryIndex(
	        JsonNode root,
	        String dimensionName,
	        String code) {

	    return root.get("dimension")
	            .get(dimensionName)
	            .get("category")
	            .get("index")
	            .get(code)
	            .asInt();
	}

	private MunicipalityData parseMunicipalityData(
	        JsonNode root,
	        String municipalityCode) {

	    JsonNode dimension = root.get("dimension");

	    // Kunnan nimi
	    String municipalityName = dimension
	            .get("kunta_85_20190101")
	            .get("category")
	            .get("label")
	            .get(municipalityCode)
	            .asText();

	    MunicipalityData data =
	            new MunicipalityData(municipalityCode, municipalityName);

	    // Vuodet API:n indeksien mukaan järjestettynä
	    JsonNode yearIndex = dimension
	            .get("timeperiod_y")
	            .get("category")
	            .get("index");

	    List<String> years = new ArrayList<>();

	    yearIndex.fieldNames().forEachRemaining(years::add);

	    years.sort((a, b) ->
	            Integer.compare(
	                    yearIndex.get(a).asInt(),
	                    yearIndex.get(b).asInt()
	            )
	    );

	    // Kunnan indeksi
	    int areaIndex = getCategoryIndex(
	            root, "kunta_85_20190101", municipalityCode);

	    // Sukupuoli on Yhteensä
	    int sexIndex = getCategoryIndex(
	            root, "sukupuoli_9_20180101", "SSS");

	    // Tiedot on Väestö
	    int contentsIndex = getCategoryIndex(
	            root, "contentscode", "vaerak-vaesto");

	    for (String yearString : years) {

	        int year = Integer.parseInt(yearString);

	        PopulationRecord record = new PopulationRecord(year);

	        int yearPosition = getCategoryIndex(
	                root, "timeperiod_y", yearString);

	        Map<String, Integer> coordinates = new HashMap<>();

	        coordinates.put("kunta_85_20190101", areaIndex);
	        coordinates.put("timeperiod_y", yearPosition);
	        coordinates.put("sukupuoli_9_20180101", sexIndex);
	        coordinates.put("contentscode", contentsIndex);

	        // Kokonaisväestö: ikäluokka SSS
	        coordinates.put(
	                "ikaryhma_10_20180101",
	                getCategoryIndex(root, "ikaryhma_10_20180101", "SSS")
	        );

	        record.setTotal(getValue(root, coordinates));

	        // Ikäryhmä 0–14
	        int age0to14 = 0;

	        for (int age = 0; age <= 14; age++) {
	            String ageCode = String.format("%03d", age);

	            coordinates.put(
	                    "ikaryhma_10_20180101",
	                    getCategoryIndex(
	                            root, "ikaryhma_10_20180101", ageCode)
	            );

	            age0to14 += getValue(root, coordinates);
	        }

	        record.setAge0_14(age0to14);

	        // Ikäryhmä 15–64
	        int age15to64 = 0;

	        for (int age = 15; age <= 64; age++) {
	            String ageCode = String.format("%03d", age);

	            coordinates.put(
	                    "ikaryhma_10_20180101",
	                    getCategoryIndex(
	                            root, "ikaryhma_10_20180101", ageCode)
	            );

	            age15to64 += getValue(root, coordinates);
	        }

	        record.setAge15_64(age15to64);

	        // Ikäryhmä 65+
	        int age65plus = 0;

	        for (int age = 65; age <= 99; age++) {
	            String ageCode = String.format("%03d", age);

	            coordinates.put(
	                    "ikaryhma_10_20180101",
	                    getCategoryIndex(
	                            root, "ikaryhma_10_20180101", ageCode)
	            );

	            age65plus += getValue(root, coordinates);
	        }

	        // 100 vuotta tai enemmän
	        coordinates.put(
	                "ikaryhma_10_20180101",
	                getCategoryIndex(root, "ikaryhma_10_20180101", "100-")
	        );

	        age65plus += getValue(root, coordinates);

	        record.setAge65plus(age65plus);

	        data.addRecord(record);
	    }

	    return data;
	}
	
	private static final String PXWEB_URL = 
    "https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/vaerak/11rf.px"; // väestödata

    private static List<Municipality> municipalitiesCache;
    
    private static TreeMap<String, MunicipalityData> populationCache;
    
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
    
    public void clearCache() {
    	municipalitiesCache.clear();
    	populationCache.clear();
    }
    
	
    public List<MunicipalityData> getData() {

        List<Municipality> municipalities = getAllMunicipalities();

        // Tarkistetaan, löytyvätkö kaikkien kuntien tiedot jo välimuistista.
        if (populationCache.size() == municipalities.size() + 1) {
            return new ArrayList<>(populationCache.values());
        }

        try {
            HttpClient client = HttpClient.newHttpClient();
            ObjectMapper mapper = new ObjectMapper();

            // Haetaan 25 kuntaa yhdessä pyynnössä.
            final int batchSize = 25;

            populationCache.clear();

            // Käydään kunnat läpi 25 kunnan erissä.
            for (int i = 0; i < municipalities.size(); i += batchSize) {

                int end = Math.min(i + batchSize, municipalities.size());

                List<Municipality> batch =
                        municipalities.subList(i, end);

                // Lisätään mukaan myös koko maa (SSS).
                List<String> municipalityCodes = new ArrayList<>();
                municipalityCodes.add("SSS");

                for (Municipality municipality : batch) {
                    municipalityCodes.add(municipality.getCode());
                }

                // Muodostetaan kuntakoodien JSON-lista.
                String areaValuesJson = String.join(",",
                        municipalityCodes.stream()
                                .map(code -> "\"" + code + "\"")
                                .toList()
                );

                String jsonBody = """
                {
                  "query": [
                    {
                      "code": "kunta_85_20190101",
                      "selection": {
                        "filter": "item",
                        "values": [%s]
                      }
                    },
                    {
                      "code": "timeperiod_y",
                      "selection": {
                        "filter": "all",
                        "values": ["*"]
                      }
                    },
                    {
                      "code": "sukupuoli_9_20180101",
                      "selection": {
                        "filter": "item",
                        "values": ["SSS"]
                      }
                    },
                    {
                      "code": "ikaryhma_10_20180101",
                      "selection": {
                        "filter": "all",
                        "values": ["*"]
                      }
                    },
                    {
                      "code": "contentscode",
                      "selection": {
                        "filter": "item",
                        "values": ["vaerak-vaesto"]
                      }
                    }
                  ],
                  "response": {
                    "format": "json-stat2"
                  }
                }
                """.formatted(areaValuesJson);

                // Lähetetään API-pyyntö.
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(PXWEB_URL))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                        .build();

                HttpResponse<String> response = client.send(
                        request,
                        HttpResponse.BodyHandlers.ofString()
                );

                // Tarkistetaan vastauksen onnistuminen.
                if (response.statusCode() != 200) {
                    throw new RuntimeException(
                            "Tilastokeskuksen API-virhe: "
                            + response.statusCode()
                            + " - " + response.body()
                    );
                }

                // Luetaan JSON-vastaus.
                JsonNode root = mapper.readTree(response.body());

                // Poimitaan jokaisen kunnan väestötiedot.
                for (String municipalityCode : municipalityCodes) {

                    MunicipalityData data = parseMunicipalityData(
                            root,
                            municipalityCode
                    );

                    populationCache.put(municipalityCode, data);
                }
            }

            return new ArrayList<>(populationCache.values());

        } catch (Exception e) {

            System.err.println("Väestötietojen hakeminen epäonnistui!");
            e.printStackTrace();

            return new ArrayList<>();
        }
    }
    
    public MunicipalityData getMunicipality(String municipalityCode) {

        // Tarkistetaan ensin, löytyykö kunta välimuistista.
        MunicipalityData data = populationCache.get(municipalityCode);

        if (data != null) {
            return data;
        }

        // Jos välimuisti on tyhjä, haetaan kaikkien kuntien tiedot.
        getData();

        // Yritetään hakea kunta uudelleen.
        data = populationCache.get(municipalityCode);

        if (data == null) {
            throw new IllegalArgumentException(
                    "Kuntaa ei löytynyt: " + municipalityCode);
        }

        return data;
    }
    
    public List<Municipality> getAllMunicipalities() {
    	    	
        if (municipalitiesCache != null && municipalitiesCache.size() > 0) {
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