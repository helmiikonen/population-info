package com.example.municipality_backend.model;

import java.util.Map;
import java.util.TreeMap;
import java.util.List;

public class MunicipalityData {

    private String municipalityCode;  
    private String municipalityName;  
    
    private Map<Integer, PopulationRecord> populationByYear = new TreeMap<>();

    public MunicipalityData(String code, String name) {
        this.municipalityCode = code;
        this.municipalityName = name;
    }
    
    public MunicipalityData() {
    	
    }
    
    
    public void printInfo() {
    	System.out.println(municipalityCode + " " + municipalityName);
    	System.out.println("Population by year: ");
    	
	    for (Integer key : this.populationByYear.keySet()) {
	        PopulationRecord record = this.populationByYear.get(key);
	        int year = record.getYear();
	        int total = record.getTotal();
	        int age0_17 = record.getAge0_17();
	        int age18_64 = record.getAge18_64();	       
	        int age65plus = record.getAge65plus();
	        System.out.println(year);
	        System.out.println("  Total population: " + total);
	        System.out.println("  0-17 year olds: " + age0_17);
	        System.out.println("  18-64 year olds: " + age18_64);
	        System.out.println("  65+ year olds: " + age65plus);
	        
	    }
    }

    public void addRecord(PopulationRecord record) {
        populationByYear.put(record.getYear(), record);
    }

    public Map<Integer, PopulationRecord> getPopulationByYear() {
        return populationByYear;
    }

    public String getMunicipalityCode() { 
    	return municipalityCode; 
    }
    
    public String getMunicipalityName() { 
    	return municipalityName; 
    }
    
}