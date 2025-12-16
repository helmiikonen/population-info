package com.example.municipality_backend.model;

import java.util.TreeMap;

public class PopulationCache {
	private PopulationRecord totalPopulation;
	private TreeMap<String, MunicipalityData> savedMunipalicities;
	
	public PopulationCache() {
		this.savedMunipalicities = new TreeMap<>();
	}
	
	public void setTotalPopulation(PopulationRecord record) {
		this.totalPopulation = record;
	}
	
	public void addMunicipality(String code, MunicipalityData data) {
		this.savedMunipalicities.put(code, data);
	}
	
	public PopulationRecord getTotalPopulation() {
		return this.totalPopulation;
	}
	
	public TreeMap<String, MunicipalityData> getSavedMunicipalities() {
		return this.savedMunipalicities;
	}
	
	public MunicipalityData getMunicipalityInfo(String code) {
		return this.savedMunipalicities.get(code);
	}
}